import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongoose';
import Course from '@/lib/models/Course';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const course = await Course.findById(params.id).select('-__v').lean();

    if (!course) {
      return new Response(JSON.stringify({ success: false, error: 'Course not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, result: { course } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('course fetch error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();

    // Set isFeatured based on type
    if (body.type === 'featured') {
      body.isFeatured = true;
    }

    const course = await Course.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!course) {
      return new Response(JSON.stringify({ success: false, error: 'Course not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, result: { course } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('course update error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const course = await Course.findByIdAndDelete(params.id);

    if (!course) {
      return new Response(JSON.stringify({ success: false, error: 'Course not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, message: 'Course deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('course delete error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}