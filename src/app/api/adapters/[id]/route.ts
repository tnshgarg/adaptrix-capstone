import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Adapter from '@/models/Adapter'
import { z } from 'zod'
import mongoose from 'mongoose'

const updateAdapterSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  compatibleModels: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  repository: z.string().optional(),
  readme: z.string().optional(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    let adapter;
    if (mongoose.Types.ObjectId.isValid(id)) {
      adapter = await Adapter.findById(id).populate('author', 'id name username avatar');
    }

    if (!adapter) {

      adapter = await Adapter.findOne({ slug: id }).populate('author', 'id name username avatar');
    }

    if (!adapter) {
      return NextResponse.json({ error: 'Adapter not found' }, { status: 404 })
    }

    return formatResponse(adapter);
  } catch (error) {
    console.error('Error fetching adapter:', error)
    return NextResponse.json(
      { error: 'Failed to fetch adapter' },
      { status: 500 }
    )
  }
}

function formatResponse(adapter: any) {
  const obj = adapter.toObject();
  return NextResponse.json({
    adapter: {
      ...obj,
      id: obj._id.toString(),
      author: adapter.author ? {
        ...adapter.author.toObject(),
        id: adapter.author._id.toString()
      } : null,
      model: adapter.compatibleModels,
      _id: undefined,
      __v: undefined
    }
  })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect();
    const { id } = await params;

    const adapter = await Adapter.findById(id);

    if (!adapter) {
      return NextResponse.json({ error: 'Adapter not found' }, { status: 404 })
    }

    if (adapter.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateAdapterSchema.parse(body)

    const updatedAdapter = await Adapter.findByIdAndUpdate(
      id,
      { ...validatedData },
      { new: true }
    ).populate('author', 'id name username avatar');

    return formatResponse(updatedAdapter);
  } catch (error) {
    console.error('Error updating adapter:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update adapter' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect();
    const { id } = await params;

    const adapter = await Adapter.findById(id);

    if (!adapter) {
      return NextResponse.json({ error: 'Adapter not found' }, { status: 404 })
    }

    if (adapter.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await Adapter.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Adapter deleted successfully' })
  } catch (error) {
    console.error('Error deleting adapter:', error)
    return NextResponse.json(
      { error: 'Failed to delete adapter' },
      { status: 500 }
    )
  }
}