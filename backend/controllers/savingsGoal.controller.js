import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const calculateRequiredDaily = (targetAmount, currentAmount, targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const daysRemaining = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return 0;
  }

  const remaining = targetAmount - currentAmount;
  return remaining / daysRemaining;
};

export const createSavingsGoal = async (req, res, next) => {
  try {
    const {
      name,
      targetAmount,
      targetDate,
      currentAmount
    } = req.body;

    const requiredDaily = calculateRequiredDaily(
      parseFloat(targetAmount),
      parseFloat(currentAmount || 0),
      targetDate
    );

    const savingsGoal = await prisma.savingsGoal.create({
      data: {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount || 0),
        targetDate: new Date(targetDate),
        userId: req.user.id,
        requiredDaily
      }
    });

    res.status(201).json({ savingsGoal });
  } catch (error) {
    next(error);
  }
};

export const getSavingsGoals = async (req, res, next) => {
  try {
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId: req.user.id },
      orderBy: { targetDate: 'asc' }
    });

    // Recalculate required daily for each goal
    const goalsWithCalculations = savingsGoals.map(goal => {
      const requiredDaily = calculateRequiredDaily(
        goal.targetAmount,
        goal.currentAmount,
        goal.targetDate
      );
      const percentage = (goal.currentAmount / goal.targetAmount) * 100;
      const remaining = goal.targetAmount - goal.currentAmount;

      return {
        ...goal,
        requiredDaily: Math.round(requiredDaily * 100) / 100,
        percentage: Math.round(percentage * 100) / 100,
        remaining
      };
    });

    res.json({ savingsGoals: goalsWithCalculations });
  } catch (error) {
    next(error);
  }
};

export const getSavingsGoal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const savingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!savingsGoal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    const requiredDaily = calculateRequiredDaily(
      savingsGoal.targetAmount,
      savingsGoal.currentAmount,
      savingsGoal.targetDate
    );
    const percentage = (savingsGoal.currentAmount / savingsGoal.targetAmount) * 100;
    const remaining = savingsGoal.targetAmount - savingsGoal.currentAmount;

    res.json({
      savingsGoal: {
        ...savingsGoal,
        requiredDaily: Math.round(requiredDaily * 100) / 100,
        percentage: Math.round(percentage * 100) / 100,
        remaining
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSavingsGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      targetAmount,
      currentAmount,
      targetDate
    } = req.body;

    const existing = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    const updateData = {
      ...(name && { name }),
      ...(targetAmount && { targetAmount: parseFloat(targetAmount) }),
      ...(currentAmount !== undefined && { currentAmount: parseFloat(currentAmount) }),
      ...(targetDate && { targetDate: new Date(targetDate) })
    };

    // Recalculate required daily if relevant fields changed
    if (targetAmount || currentAmount !== undefined || targetDate) {
      const finalTargetAmount = targetAmount ? parseFloat(targetAmount) : existing.targetAmount;
      const finalCurrentAmount = currentAmount !== undefined ? parseFloat(currentAmount) : existing.currentAmount;
      const finalTargetDate = targetDate ? new Date(targetDate) : existing.targetDate;

      updateData.requiredDaily = calculateRequiredDaily(
        finalTargetAmount,
        finalCurrentAmount,
        finalTargetDate
      );
    }

    const savingsGoal = await prisma.savingsGoal.update({
      where: { id },
      data: updateData
    });

    res.json({ savingsGoal });
  } catch (error) {
    next(error);
  }
};

export const deleteSavingsGoal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const savingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!savingsGoal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    await prisma.savingsGoal.delete({
      where: { id }
    });

    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    next(error);
  }
};



