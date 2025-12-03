import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      userId: req.user.id
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // Total expenses
    const expenses = await prisma.expense.findMany({ where });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Expenses by category
    const categoryBreakdown = {};
    expenses.forEach(exp => {
      if (!categoryBreakdown[exp.categoryId]) {
        categoryBreakdown[exp.categoryId] = { amount: 0, count: 0 };
      }
      categoryBreakdown[exp.categoryId].amount += exp.amount;
      categoryBreakdown[exp.categoryId].count += 1;
    });

    // Get category details
    const categoryIds = Object.keys(categoryBreakdown);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    });

    const categoryData = categories.map(cat => ({
      category: cat,
      amount: categoryBreakdown[cat.id].amount,
      count: categoryBreakdown[cat.id].count,
      percentage: totalExpenses > 0 ? (categoryBreakdown[cat.id].amount / totalExpenses) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    // Expenses by vendor
    const vendorBreakdown = {};
    expenses.forEach(exp => {
      if (exp.vendor) {
        if (!vendorBreakdown[exp.vendor]) {
          vendorBreakdown[exp.vendor] = { amount: 0, count: 0 };
        }
        vendorBreakdown[exp.vendor].amount += exp.amount;
        vendorBreakdown[exp.vendor].count += 1;
      }
    });

    const vendorData = Object.entries(vendorBreakdown)
      .map(([vendor, data]) => ({
        vendor,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Expenses by payment mode
    const paymentModeBreakdown = {};
    expenses.forEach(exp => {
      if (!paymentModeBreakdown[exp.paymentMode]) {
        paymentModeBreakdown[exp.paymentMode] = { amount: 0, count: 0 };
      }
      paymentModeBreakdown[exp.paymentMode].amount += exp.amount;
      paymentModeBreakdown[exp.paymentMode].count += 1;
    });

    const paymentModeData = Object.entries(paymentModeBreakdown)
      .map(([mode, data]) => ({
        mode,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyExpenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: sixMonthsAgo
        }
      }
    });

    const monthlyData = {};
    monthlyExpenses.forEach(exp => {
      const month = new Date(exp.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
      monthlyData[month] += exp.amount;
    });

    const monthlyTrend = Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      summary: {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        totalCount: expenses.length,
        averageExpense: expenses.length > 0 ? Math.round((totalExpenses / expenses.length) * 100) / 100 : 0
      },
      categoryBreakdown: categoryData,
      vendorBreakdown: vendorData,
      paymentModeBreakdown: paymentModeData,
      monthlyTrend
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      userId: req.user.id
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true
      }
    });

    const categoryMap = {};
    expenses.forEach(exp => {
      const catId = exp.categoryId;
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          category: exp.category,
          amount: 0,
          count: 0
        };
      }
      categoryMap[catId].amount += exp.amount;
      categoryMap[catId].count += 1;
    });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const breakdown = Object.values(categoryMap).map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.amount / total) * 100 * 100) / 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    res.json({ breakdown });
  } catch (error) {
    next(error);
  }
};

export const getVendorBreakdown = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      userId: req.user.id,
      vendor: { not: null }
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({ where });

    const vendorMap = {};
    expenses.forEach(exp => {
      if (!vendorMap[exp.vendor]) {
        vendorMap[exp.vendor] = {
          vendor: exp.vendor,
          amount: 0,
          count: 0
        };
      }
      vendorMap[exp.vendor].amount += exp.amount;
      vendorMap[exp.vendor].count += 1;
    });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const breakdown = Object.values(vendorMap).map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.amount / total) * 100 * 100) / 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    res.json({ breakdown });
  } catch (error) {
    next(error);
  }
};

export const exportCSV = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      userId: req.user.id
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true
      },
      orderBy: { date: 'desc' }
    });

    // Generate CSV
    const headers = ['Date', 'Amount', 'Category', 'Vendor', 'Payment Mode', 'Description', 'Notes', 'Tags'];
    const rows = expenses.map(exp => [
      new Date(exp.date).toISOString().split('T')[0],
      exp.amount,
      exp.category.name,
      exp.vendor || '',
      exp.paymentMode,
      exp.description || '',
      exp.notes || '',
      exp.tags.join('; ')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=expenses-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};



