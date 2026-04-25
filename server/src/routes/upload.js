/*
CURL EXAMPLES:

# Upload CSV
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/path/to/statement.csv"

# Upload PDF
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/path/to/statement.pdf"
*/

const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const pdfParse = require('pdf-parse');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only .csv and .pdf files are allowed'), false);
    }
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let transactions = [];

    // Parse CSV
    if (req.file.mimetype === 'text/csv') {
      const fileContent = req.file.buffer.toString('utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      transactions = records.map(record => {
        // Find best match for varying column names
        const dateKey = Object.keys(record).find(k => k.toLowerCase().includes('date'));
        const descKey = Object.keys(record).find(k => k.toLowerCase().includes('description') || k.toLowerCase().includes('name'));
        const amountKey = Object.keys(record).find(k => k.toLowerCase().includes('amount') || k.toLowerCase().includes('value'));

        const date = dateKey ? record[dateKey] : new Date().toISOString();
        const description = descKey ? record[descKey] : 'Unknown Description';
        let amount = amountKey ? parseFloat(record[amountKey].replace(/[^\d.-]/g, '')) : 0;
        
        return { date, description, amount };
      });

    // Parse PDF
    } else if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      const rawText = data.text;
      
      const Anthropic = require('@anthropic-ai/sdk');
      const apiKey = process.env.ANTHROPIC_API_KEY;
      
      let aiSuccess = false;
      
      if (apiKey && apiKey !== 'your-anthropic-api-key' && rawText.trim().length > 0) {
        try {
          const anthropic = new Anthropic({ apiKey });
          const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            system: 'You are a data extraction assistant. Extract ALL financial transactions from the provided bank statement text. Return ONLY a JSON array of objects with keys: "date" (string), "description" (string), "amount" (number). Do not include balance or other non-transaction rows. ONLY return valid JSON array.',
            messages: [
              { role: 'user', content: rawText.substring(0, 50000) }
            ]
          });

          const textResponse = response.content[0].text;
          const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
          transactions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(textResponse);
          aiSuccess = true;
        } catch (err) {
          console.error("AI PDF parsing failed:", err.message);
          // Don't crash, we'll try the fallback regex
        }
      }

      // Regex Fallback if AI fails or no valid API key
      if (!aiSuccess) {
        console.log("Using Regex fallback for PDF parsing");
        
        // Match dates like DD-MM-YYYY or DD/MM/YY, a description, and an amount at the end
        // This is a more relaxed global regex compared to the original one
        const fallbackRegex = /(\d{1,4}[-/\.]\d{1,2}[-/\.]\d{1,4})\s+(.+?)\s+([+-]?\$?\u20B9?\s?\d{1,10}(?:,\d{3})*(?:\.\d{1,2})?)/g;
        let match;
        while ((match = fallbackRegex.exec(rawText)) !== null) {
          // Avoid matching completely arbitrary long lines
          if (match[2].length < 100) {
             transactions.push({
               date: match[1],
               description: match[2].trim(),
               amount: parseFloat(match[3].replace(/[^\d.-]/g, ''))
             });
          }
        }
      }
    }

    // Return the unclassified transactions array
    // We don't save to the database here! The frontend will pass this to AI logic next.
    res.json({ transactions });
  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
});

module.exports = router;
