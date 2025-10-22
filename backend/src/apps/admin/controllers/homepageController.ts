import { Request, Response, NextFunction } from 'express';
import connectDB from '@core/lib/mongoose';
import HomepageSettings from '@core/models/HomepageSettings';

/**
 * GET /api/admin/homepage-settings
 * Get homepage settings
 */
export const getHomepageSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();

    let settings = await HomepageSettings.findOne();

    if (!settings) {
      settings = await HomepageSettings.create({
        selectedFeaturedCourses: []
      });
    }

    res.json({
      success: true,
      data: {
        selectedFeaturedCourses: settings.selectedFeaturedCourses
      }
    });
  } catch (err: any) {
    console.error('Error fetching homepage settings:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/**
 * PUT /api/admin/homepage-settings
 * Update homepage settings
 */
export const updateHomepageSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();

    const { selectedFeaturedCourses } = req.body;

    if (!Array.isArray(selectedFeaturedCourses)) {
      res.status(400).json({
        success: false,
        error: 'selectedFeaturedCourses must be an array'
      });
      return;
    }

    if (!selectedFeaturedCourses.every(id => typeof id === 'string')) {
      res.status(400).json({
        success: false,
        error: 'All selectedFeaturedCourses items must be strings'
      });
      return;
    }

    let settings = await HomepageSettings.findOne();

    if (!settings) {
      settings = await HomepageSettings.create({
        selectedFeaturedCourses
      });
    } else {
      settings.selectedFeaturedCourses = selectedFeaturedCourses;
      await settings.save();
    }

    res.json({
      success: true,
      data: {
        selectedFeaturedCourses: settings.selectedFeaturedCourses
      }
    });
  } catch (err: any) {
    console.error('Error saving homepage settings:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
