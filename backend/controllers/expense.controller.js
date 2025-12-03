import prisma from '../lib/prisma.js';

export const createExpense = async (req, res, next) => {
  try {
    const {
      amount,
      description,
      date,
      categoryId,
      vendor,
      notes,
      paymentMode,
      tags
    } = req.body;

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        categoryId,
        userId: req.user.id,
        vendor,
        notes,
        paymentMode: paymentMode || 'cash',
        tags: tags || []
      },
      include: {
        category: true
      }
    });

    res.status(201).json({ expense });
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      categoryId,
      vendor,
      paymentMode,
      startDate,
      endDate,
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter
    const where = {
      userId: req.user.id
    };

    if (categoryId) where.categoryId = categoryId;
    if (vendor) where.vendor = { contains: vendor, mode: 'insensitive' };
    if (paymentMode) where.paymentMode = paymentMode;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get expenses
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take
      }),
      prisma.expense.count({ where })
    ]);

    res.json({
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        category: true
      }
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ expense });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      amount,
      description,
      date,
      categoryId,
      vendor,
      notes,
      paymentMode,
      tags
    } = req.body;

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(categoryId && { categoryId }),
        ...(vendor !== undefined && { vendor }),
        ...(notes !== undefined && { notes }),
        ...(paymentMode && { paymentMode }),
        ...(tags && { tags })
      },
      include: {
        category: true
      }
    });

    res.json({ expense });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await prisma.expense.delete({
      where: { id }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};



