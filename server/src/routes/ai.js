const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const prisma = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-20250514';

// Simple in-memory cache per user for insights
const insightsCache = {};

router.post('/categorize', async (req, res) => {
  try {
    const { userId } = req.user;
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'transactions array is required' });
    }

    const savedTransactions = [];

    // Call Claude for each transaction
    const categorizePromises = transactions.map(async (tx) => {
      try {
        const response = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 150,
          system: 'You are a financial transaction categorizer. Given a transaction description and amount, return ONLY a JSON object: { "category": "string", "confidence": number }. Categories: Food, Transport, Shopping, Bills, Entertainment, Health, Travel, Investment, Income, Other. No explanation, just JSON.',
          messages: [
            { role: 'user', content: `Description: ${tx.description}, Amount: ${tx.amount}` }
          ]
        });

        const textResponse = response.content[0].text;
        let parsed = { category: 'Other', confidence: 0 };
        
        try {
          const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            parsed = JSON.parse(textResponse);
          }
        } catch (parseErr) {
          console.error("Failed to parse Claude JSON response:", textResponse);
        }

        // Save cleanly to DB
        const savedTx = await prisma.transaction.create({
          data: {
            userId,
            date: new Date(tx.date || new Date()),
            description: tx.description || 'Unknown',
            amount: parseFloat(tx.amount) || 0,
            category: parsed.category || 'Other',
            source: 'UPLOAD'
          }
        });

        savedTransactions.push({
          ...savedTx,
          confidence: parsed.confidence
        });
      } catch (err) {
        console.error("Claude categorize fail for transaction:", err.message);
        throw err; 
      }
    });

    await Promise.all(categorizePromises);

    res.json({
      saved: savedTransactions.length,
      transactions: savedTransactions
    });

  } catch (error) {
    console.error('Categorize AI error:', error);
    res.status(503).json({ error: 'AI unavailable' });
  }
});

router.get('/insights', async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Simple JS Object Cache for 1 hour
    if (insightsCache[userId] && insightsCache[userId].expiry > Date.now()) {
      return res.json(insightsCache[userId].data);
    }

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: threeMonthsAgo }
      }
    });

    const dataPayload = JSON.stringify(transactions);

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: "Analyze this spending data and return ONLY a JSON array of exactly 5 insight objects: [{\"title\": \"string\", \"detail\": \"string\", \"type\": \"warning\"|\"positive\"|\"neutral\"}]. Focus on real patterns, percentage changes, anomalies. Data: " + dataPayload,
      messages: [
        { role: 'user', content: 'Generate 5 spending insights as a JSON array ONLY.' }
      ]
    });

    const textResponse = response.content[0].text;
    let insights = [];
    try {
      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(textResponse);
    } catch (e) {
      console.error("Failed to parse Claude Insights:", textResponse);
      throw new Error('Parse error');
    }

    // Assign to Cache
    insightsCache[userId] = {
      data: insights,
      expiry: Date.now() + 60 * 60 * 1000 // 1 hour
    };

    res.json(insights);
  } catch (error) {
    console.error('Insights AI error:', error);
    res.status(503).json({ error: 'AI unavailable' });
  }
});

router.get('/forecast', async (req, res) => {
  try {
    const { userId } = req.user;

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        date: { gte: threeMonthsAgo }
      },
      _sum: { amount: true }
    });

    const dataPayload = JSON.stringify(transactions);

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: "Based on 3 months of spending trends, predict next month's spending per category. Return ONLY JSON: {\"predictions\": [{\"category\": \"string\", \"predicted\": number, \"trend\": \"up\"|\"down\"|\"stable\", \"percentChange\": number}], \"totalPredicted\": number}. Data: " + dataPayload,
      messages: [
        { role: 'user', content: 'Provide the forecast JSON.' }
      ]
    });

    const textResponse = response.content[0].text;
    let forecast = {};
    try {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      forecast = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(textResponse);
    } catch (e) {
      console.error("Failed to parse Claude Forecast json:", textResponse);
      throw new Error('Parse error');
    }

    res.json(forecast);
  } catch (error) {
    console.error('Forecast AI error:', error);
    res.status(503).json({ error: 'AI unavailable' });
  }
});

module.exports = router;
