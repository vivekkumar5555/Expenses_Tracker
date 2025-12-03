import prisma from '../lib/prisma.js';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await prisma.userSettings.findUnique({
      where: { userId: req.user.id }
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: req.user.id
        }
      });
    }

    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const {
      currency,
      language,
      approvalLimit,
      theme
    } = req.body;

    let settings = await prisma.userSettings.findUnique({
      where: { userId: req.user.id }
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: req.user.id,
          currency: currency || 'USD',
          language: language || 'en',
          approvalLimit: approvalLimit ? parseFloat(approvalLimit) : null,
          theme: theme || 'light'
        }
      });
    } else {
      settings = await prisma.userSettings.update({
        where: { userId: req.user.id },
        data: {
          ...(currency && { currency }),
          ...(language && { language }),
          ...(approvalLimit !== undefined && { approvalLimit: approvalLimit ? parseFloat(approvalLimit) : null }),
          ...(theme && { theme })
        }
      });
    }

    res.json({ settings });
  } catch (error) {
    next(error);
  }
};



