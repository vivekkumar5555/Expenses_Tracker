import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId: req.user.id }
        ]
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });

    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        userId: req.user.id,
        isDefault: false
      }
    });

    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color })
      }
    });

    res.json({ category: updatedCategory });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has expenses
    const expenseCount = await prisma.expense.count({
      where: { categoryId: id }
    });

    if (expenseCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with existing expenses'
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};



