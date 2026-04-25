const cron = require('node-cron');
const prisma = require('../db');

// Schedule: 0 9 1 * * (9am on 1st of each month)
const startMonthlyReportJob = () => {
  cron.schedule('0 9 1 * *', async () => {
    try {
      console.log('Running monthly report cron job...');

      const now = new Date();
      // Go back one month
      const expectedMonth = now.getMonth() - 1; 
      const lastMonthDate = new Date(now.getFullYear(), expectedMonth, 1);
      
      const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
      
      const startDate = new Date(`${lastMonthStr}-01T00:00:00.000Z`);
      let endMonth = startDate.getUTCMonth() + 1;
      let endYear = startDate.getUTCFullYear();
      if (endMonth > 11) {
        endMonth = 0;
        endYear++;
      }
      const endDate = new Date(Date.UTC(endYear, endMonth, 1));

      const users = await prisma.user.findMany();

      for (const user of users) {
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: user.id,
            date: { gte: startDate, lt: endDate }
          }
        });

        if (transactions.length === 0) continue;

        const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
        
        const categoryMap = {};
        transactions.forEach(t => {
          if (!categoryMap[t.category]) categoryMap[t.category] = 0;
          categoryMap[t.category] += t.amount;
        });

        console.log(`\n--- Monthly Report for ${user.email} (${lastMonthStr}) ---`);
        console.log(`Total Spent: $${totalSpent.toFixed(2)}`);
        Object.entries(categoryMap).forEach(([cat, amount]) => {
          console.log(`- ${cat}: $${amount.toFixed(2)}`);
        });
        console.log('---------------------------------------------------------');
      }

    } catch (error) {
      console.error('Error running monthly report cron job:', error);
    }
  });

  console.log('Monthly report cron job scheduled.');
};

module.exports = startMonthlyReportJob;
