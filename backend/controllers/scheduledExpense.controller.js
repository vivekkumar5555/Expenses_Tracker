import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updateStatus = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);

  if (due < now) {
    return 'overdue';
  }
  return 'pending';
};

export const createScheduledExpense = async (req, res, next) => {
  try {
    const {
      name,
      amount,
      dueDate,
      categoryId,
      notes
    } = req.body;

    const status = updateStatus(dueDate);

    const scheduledExpense = await prisma.scheduledExpense.create({
      data: {
        name,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        categoryId,
        userId: req.user.id,
        status,
        notes
      },
      include: {
        category: true
      }
    });

    res.status(201).json({ scheduledExpense });
  } catch (error) {
    next(error);
  }
};

export const getScheduledExpenses = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {
      userId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    const scheduledExpenses = await prisma.scheduledExpense.findMany({
      where,
      include: {
        category: true
      },
      orderBy: { dueDate: 'asc' }
    });

    // Update status for overdue items
    const now = new Date();
    const updatedExpenses = await Promise.all(
      scheduledExpenses.map(async (expense) => {
        if (expense.status === 'pending' && new Date(expense.dueDate) < now) {
          const updated = await prisma.scheduledExpense.update({
            where: { id: expense.id },
            data: { status: 'overdue' }
          });
          return { ...updated, category: expense.category };
        }
        return expense;
      })
    );

    res.json({ scheduledExpenses: updatedExpenses });
  } catch (error) {
    next(error);
  }
};

export const getScheduledExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const scheduledExpense = await prisma.scheduledExpense.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        category: true
      }
    });

    if (!scheduledExpense) {
      return res.status(404).json({ message: 'Scheduled expense not found' });
    }

    res.json({ scheduledExpense });
  } catch (error) {
    next(error);
  }
};

export const updateScheduledExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      amount,
      dueDate,
      categoryId,
      status,
      notes
    } = req.body;

    const existing = await prisma.scheduledExpense.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Scheduled expense not found' });
    }

    const updateData = {
      ...(name && { name }),
      ...(amount && { amount: parseFloat(amount) }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(categoryId && { categoryId }),
      ...(notes !== undefined && { notes })
    };

    if (status) {
      updateData.status = status;
      if (status === 'paid') {
        updateData.paidDate = new Date();
      }
    } else if (dueDate) {
      // Auto-update status based on due date
      updateData.status = updateStatus(dueDate);
    }

    const scheduledExpense = await prisma.scheduledExpense.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });

    res.json({ scheduledExpense });
  } catch (error) {
    next(error);
  }
};

export const deleteScheduledExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const scheduledExpense = await prisma.scheduledExpense.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!scheduledExpense) {
      return res.status(404).json({ message: 'Scheduled expense not found' });
    }

    await prisma.scheduledExpense.delete({
      where: { id }
    });

    res.json({ message: 'Scheduled expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};



