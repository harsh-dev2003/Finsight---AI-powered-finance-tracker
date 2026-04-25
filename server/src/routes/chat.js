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

router.post('/', async (req, res) => {
  try {
    const { userId } = req.user;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    // 1. Fetch last 90 days of user's transactions
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: ninetyDaysAgo }
      }
    });

    // 2. Build spending summary data for Claude
    let categoryMap = {};
    let monthMap = {};
    let biggestExpense = { amount: 0, description: '' };

    transactions.forEach(t => {
      // Amount combined by category
      if (!categoryMap[t.category]) categoryMap[t.category] = 0;
      categoryMap[t.category] += t.amount;

      // Amount combined by month
      const monthStr = t.date.toISOString().slice(0, 7);
      if (!monthMap[monthStr]) monthMap[monthStr] = 0;
      monthMap[monthStr] += t.amount;

      // Extrapolating the single biggest expense payload
      if (t.amount > biggestExpense.amount) {
        biggestExpense = { amount: t.amount, description: t.description };
      }
    });

    const summary = {
      totalByCategory: categoryMap,
      totalByMonth: monthMap,
      biggestExpense
    };

    // 3. Request Claude Chat Completion
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: `You are FinSight, a personal AI finance advisor. You have access to the user's real spending data below. Be specific, use their actual numbers. Keep answers under 150 words. Use ₹ symbol for amounts.\n\nUSER SPENDING DATA:\n${JSON.stringify(summary, null, 2)}`,
      messages: [
        { role: 'user', content: message }
      ]
    });

    const replyText = response.content[0].text;

    // 4. Save both historical messages immediately
    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'USER',
        content: message
      }
    });

    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'AI',
        content: replyText
      }
    });

    // 5. Send back Response
    res.json({ reply: replyText });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(503).json({ error: 'AI unavailable' });
  }
});

module.exports = router;
