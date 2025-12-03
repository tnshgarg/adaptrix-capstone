import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Adapter from '@/models/Adapter'
import AdapterVersion from '@/models/AdapterVersion'
import { z } from 'zod'

const createAdapterSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()),
  compatibleModels: z.array(z.string()),
  version: z.string().default('1.0.0'),
  license: z.string().default('MIT'),
  repository: z.string().optional(),
  readme: z.string().optional(),
  isPublic: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'popular'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const authorId = searchParams.get('authorId')

    let query: any = {}

    if (authorId) {
      query.authorId = authorId
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }

    if (category && category !== 'all') {
      query.category = category
    }

    if (!authorId) {
      query.isPublic = true
    }

    let sortOption: any = { downloads: -1 };
    if (sort === 'stars') sortOption = { starCount: -1 };
    if (sort === 'recent') sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const adapters = await Adapter.find(query)
      .populate('author', 'id name username avatar')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Adapter.countDocuments(query);

    const formattedAdapters = adapters.map(adapter => {
      const obj = adapter.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        author: adapter.author ? {
          ...(adapter.author as any).toObject(),
          id: (adapter.author as any)._id.toString()
        } : null,
        model: adapter.compatibleModels,
        _id: undefined,
        __v: undefined
      };
    });

    return NextResponse.json({
      adapters: formattedAdapters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching adapters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch adapters' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect();

    const body = await request.json()
    const validatedData = createAdapterSchema.parse(body)

    const existingAdapter = await Adapter.findOne({ slug: validatedData.slug })

    if (existingAdapter) {
      return NextResponse.json(
        { error: 'Adapter with this slug already exists' },
        { status: 400 }
      )
    }

    const adapter = await Adapter.create({
      ...validatedData,
      authorId: session.user.id,
    })



    await AdapterVersion.create({
      version: validatedData.version,
      adapterId: adapter._id,
      changelog: 'Initial release'
    })


    const populatedAdapter = await Adapter.findById(adapter._id).populate('author', 'id name username avatar');

    const formattedAdapter = {
      ...populatedAdapter!.toObject(),
      id: populatedAdapter!._id.toString(),
      author: populatedAdapter!.author ? {
        ...(populatedAdapter!.author as any).toObject(),
        id: (populatedAdapter!.author as any)._id.toString()
      } : null,
      model: populatedAdapter!.compatibleModels,
      downloads: 0,
      stars: 0,
      reviews: 0,
      _id: undefined,
      __v: undefined
    }


    return NextResponse.json({
      message: 'Adapter created successfully',
      adapter: formattedAdapter
    })
  } catch (error) {
    console.error('Error creating adapter:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create adapter' },
      { status: 500 }
    )
  }
}

function getOrderBy(sort: string) {

  return {}
}