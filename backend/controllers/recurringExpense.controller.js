import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const calculateNextDueDate = (frequency, startDate, currentDate = null) => {
  const date = currentDate || new Date(startDate);
  const next = new Date(date);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      next.setDate(next.getDate() + 1);
  }

  return next;
};

export const createRecurringExpense = async (req, res, next) => {
  try {
    const {
      name,
      amount,
      frequency,
      startDate,
      endDate,
      categoryId
    } = req.body;

    const nextDueDate = calculateNextDueDate(frequency, startDate);

    const recurringExpense = await prisma.recurringExpense.create({
      data: {
        name,
        amount: parseFloat(amount),
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        categoryId,
        userId: req.user.id,
        nextDueDate
      },
      include: {
        category: true
      }
    });

    res.status(201).json({ recurringExpense });
  } catch (error) {
    next(error);
  }
};

export const getRecurringExpenses = async (req, res, next) => {
  try {
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: { userId: req.user.id },
      include: {
        category: true
      },
      orderBy: { nextDueDate: 'asc' }
    });

    res.json({ recurringExpenses });
  } catch (error) {
    next(error);
  }
};

export const getRecurringExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        category: true
      }
    });

    if (!recurringExpense) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    res.json({ recurringExpense });
  } catch (error) {
    next(error);
  }
};

export const updateRecurringExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      amount,
      frequency,
      startDate,
      endDate,
      categoryId,
      isActive
    } = req.body;

    const existing = await prisma.recurringExpense.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    const updateData = {
      ...(name && { name }),
      ...(amount && { amount: parseFloat(amount) }),
      ...(frequency && { frequency }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive })
    };

    // Recalculate next due date if frequency or start date changed
    if (frequency || startDate) {
      updateData.nextDueDate = calculateNextDueDate(
        frequency || existing.frequency,
        startDate || existing.startDate,
        existing.nextDueDate
      );
    }

    const recurringExpense = await prisma.recurringExpense.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });

    res.json({ recurringExpense });
  } catch (error) {
    next(error);
  }
};

export const deleteRecurringExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!recurringExpense) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    await prisma.recurringExpense.delete({
      where: { id }
    });

    res.json({ message: 'Recurring expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};



