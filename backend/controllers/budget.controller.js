import prisma from "../lib/prisma.js";

const calculateBudgetSpent = async (budget, userId) => {
  const startDate = budget.startDate;
  const endDate = budget.endDate || new Date();

  const where = {
    userId,
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (budget.categoryId) {
    where.categoryId = budget.categoryId;
  }

  const expenses = await prisma.expense.findMany({ where });
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
};

export const createBudget = async (req, res, next) => {
  try {
    const {
      name,
      amount,
      period,
      startDate,
      endDate,
      categoryId,
      alertThreshold,
    } = req.body;

    const budget = await prisma.budget.create({
      data: {
        name,
        amount: parseFloat(amount),
        period,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        categoryId: categoryId || null,
        userId: req.user.id,
        alertThreshold: alertThreshold ? parseFloat(alertThreshold) : 80,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({ budget });
  } catch (error) {
    next(error);
  }
};

export const getBudgets = async (req, res, next) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.user.id },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await calculateBudgetSpent(budget, req.user.id);
        const percentage = (spent / budget.amount) * 100;
        const isAlert = percentage >= budget.alertThreshold;

        return {
          ...budget,
          spent,
          remaining: budget.amount - spent,
          percentage: Math.round(percentage * 100) / 100,
          isAlert,
        };
      })
    );

    res.json({ budgets: budgetsWithSpent });
  } catch (error) {
    next(error);
  }
};

export const getBudget = async (req, res, next) => {
  try {
    const { id } = req.params;

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        category: true,
      },
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const spent = await calculateBudgetSpent(budget, req.user.id);
    const percentage = (spent / budget.amount) * 100;
    const isAlert = percentage >= budget.alertThreshold;

    res.json({
      budget: {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: Math.round(percentage * 100) / 100,
        isAlert,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      amount,
      period,
      startDate,
      endDate,
      categoryId,
      alertThreshold,
    } = req.body;

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(period && { period }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null,
        }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(alertThreshold && { alertThreshold: parseFloat(alertThreshold) }),
      },
      include: {
        category: true,
      },
    });

    res.json({ budget: updatedBudget });
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const { id } = req.params;

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    await prisma.budget.delete({
      where: { id },
    });

    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    next(error);
  }
};
