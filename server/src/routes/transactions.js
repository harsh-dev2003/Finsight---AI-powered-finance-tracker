/*
CURL EXAMPLES:

# Get all transactions for April 2026
curl -X GET "http://localhost:5000/api/transactions?month=2026-04" \
  -H "Authorization: Bearer <TOKEN>"

# Add a transaction manually
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-04-18T12:00:00Z", "description": "Groceries", "amount": 150.75, "category": "Food"}'

# Update transaction category
curl -X PATCH http://localhost:5000/api/transactions/<TRANSACTION_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"category": "Dining"}'

# Delete transaction
curl -X DELETE http://localhost:5000/api/transactions/<TRANSACTION_ID> \
  -H "Authorization: Bearer <TOKEN>"

# Get summary metrics (last 6 months)
curl -X GET http://localhost:5000/api/transactions/summary \
  -H "Authorization: Bearer <TOKEN>"
*/

const express = require('express');
const prisma = require('../db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { month, category } = req.query; // e.g. 2026-04
    const { userId } = req.user;

    let dateFilter = {};
    if (month) {
      const startDate = new Date(`${month}-01T00:00:00.000Z`);
      let endMonth = startDate.getUTCMonth() + 1;
      let endYear = startDate.getUTCFullYear();
      if (endMonth > 11) {
        endMonth = 0;
        endYear++;
      }
      const endDate = new Date(Date.UTC(endYear, endMonth, 1));
      
      dateFilter = {
        gte: startDate,
        lt: endDate
      };
    }

    const where = {
      userId,
      ...(month && { date: dateFilter }),
      ...(category && { category })
    };

    const transactions = await prisma.transaction.findMany({ 
      where, 
      orderBy: { date: 'desc' } 
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId } = req.user;
    const { date, description, amount, category, source = 'MANUAL' } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        // Default to now if not provided
        date: date ? new Date(date) : new Date(),
        description,
        amount: parseFloat(amount),
        category: category || 'Uncategorized',
        source
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { category } = req.body;

    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: { category }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

    await prisma.transaction.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Setup for 6 months ago to the end of the current month
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 5); // To include current month + 5 previous = 6 months
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: sixMonthsAgo }
      }
    });

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = {};
    const monthMap = {};

    transactions.forEach(t => {
      // By category grouping
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { total: 0, count: 0 };
      }
      categoryMap[t.category].total += t.amount;
      categoryMap[t.category].count += 1;

      // By month grouping ('YYYY-MM')
      const monthStr = t.date.toISOString().slice(0, 7);
      if (!monthMap[monthStr]) {
        monthMap[monthStr] = 0;
      }
      monthMap[monthStr] += t.amount;
    });

    const byCategory = Object.keys(categoryMap).map(c => ({
      category: c,
      total: categoryMap[c].total,
      count: categoryMap[c].count
    }));

    const byMonth = Object.keys(monthMap).map(m => ({
      month: m,
      total: monthMap[m]
    })).sort((a, b) => a.month.localeCompare(b.month)); // Sort chronologically

    res.json({
      totalSpent,
      byCategory,
      byMonth
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
