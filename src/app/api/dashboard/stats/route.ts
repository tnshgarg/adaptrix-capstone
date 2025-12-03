import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Adapter from '@/models/Adapter'
import User from '@/models/User'
import Download from '@/models/Download'

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const [
      totalAdapters,
      totalDownloads,
      totalUsers,
      recentAdapters
    ] = await Promise.all([
      Adapter.countDocuments(),
      Download.countDocuments(),
      User.countDocuments(),
      Adapter.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('author', 'id name username avatar')
    ])

    const formattedRecentAdapters = recentAdapters.map(adapter => ({
      ...adapter.toObject(),
      id: adapter._id.toString(),
      author: adapter.author ? {
        ...(adapter.author as any).toObject(),
        id: (adapter.author as any)._id.toString()
      } : null,
      model: adapter.compatibleModels,
      _id: undefined,
      __v: undefined
    }))

    return NextResponse.json({
      totalAdapters,
      totalDownloads,
      totalUsers,
      recentAdapters: formattedRecentAdapters
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}