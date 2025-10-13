import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongoose';
import HomepageSettings from '@/lib/models/HomepageSettings';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get the homepage settings (should only be one document)
    let settings = await HomepageSettings.findOne();

    // If no settings exist, create default ones
    if (!settings) {
      settings = await HomepageSettings.create({
        selectedFeaturedCourses: []
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        selectedFeaturedCourses: settings.selectedFeaturedCourses
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Error fetching homepage settings:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { selectedFeaturedCourses } = body;

    // Validate the input
    if (!Array.isArray(selectedFeaturedCourses)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'selectedFeaturedCourses must be an array'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate that all items are strings
    if (!selectedFeaturedCourses.every(id => typeof id === 'string')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'All selectedFeaturedCourses items must be strings'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get or create the homepage settings document
    let settings = await HomepageSettings.findOne();

    if (!settings) {
      settings = await HomepageSettings.create({
        selectedFeaturedCourses
      });
    } else {
      settings.selectedFeaturedCourses = selectedFeaturedCourses;
      await settings.save();
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        selectedFeaturedCourses: settings.selectedFeaturedCourses
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Error saving homepage settings:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}