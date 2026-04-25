/*
CURL EXAMPLES:

# Get Budgets for month
curl -X GET "http://localhost:5000/api/budgets?month=2026-04" \
  -H "Authorization: Bearer <TOKEN>"

# Upsert/Create Budget
curl -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"category": "Entertainment", "monthlyLimit": 200, "month": "2026-04"}'

# Delete Budget
curl -X DELETE "http://localhost:5000/api/budgets/<BUDGET_ID>" \
  -H "Authorization: Bearer <TOKEN>"
*/

const express = require('express');
const prisma = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { userId } = req.user;
    const { month } = req.query; // '2026-04'

    if (!month) {
      return res.status(400).json({ error: 'Month parameter is required' });
    }

    const budgets = await prisma.budget.findMany({
      where: { userId, month }
    });

    // Calculate actual spending for that category during the specified month
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    let endMonth = startDate.getUTCMonth() + 1;
    let endYear = startDate.getUTCFullYear();
    if (endMonth > 11) {
      endMonth = 0;
      endYear++;
    }
    const endDate = new Date(Date.UTC(endYear, endMonth, 1));

    const transactions = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        date: { gte: startDate, lt: endDate }
      },
      _sum: { amount: true }
    });

    const spendingByCategory = transactions.reduce((acc, t) => {
      acc[t.category] = t._sum.amount || 0;
      return acc;
    }, {});

    const budgetsWithSpending = budgets.map(b => ({
      ...b,
      actualSpent: spendingByCategory[b.category] || 0
    }));

    res.json(budgetsWithSpending);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId } = req.user;
    const { category, monthlyLimit, month } = req.body;

    const existingBudget = await prisma.budget.findFirst({
      where: { userId, category, month }
    });

    let budget;
    if (existingBudget) {
      budget = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { monthlyLimit: parseFloat(monthlyLimit) }
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          userId,
          category,
          monthlyLimit: parseFloat(monthlyLimit),
          month
        }
      });
    }

    res.json(budget);
  } catch (error) {
    console.error('Error upserting budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Budget not found or unauthorized' });
    }

    await prisma.budget.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
