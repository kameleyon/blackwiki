import { NextResponse } from 'next/server'
import { getSearchFilterOptions } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const filterOptions = await getSearchFilterOptions()
    
    return NextResponse.json({
      success: true,
      data: filterOptions
    })
  } catch (error) {
    console.error('Filter options error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    )
  }
}