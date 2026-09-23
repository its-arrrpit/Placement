import { NextRequest, NextResponse } from 'next/server';
import { getAllPlacements } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const branch = searchParams.get('branch') || '';

    const { drives, source } = await getAllPlacements();
    let placements = drives;

    if (search) {
      placements = placements.filter(
        (p) =>
          p.company.toLowerCase().includes(search) ||
          p.role.toLowerCase().includes(search) ||
          p.tier.toLowerCase().includes(search) ||
          p.eligibleBranches.some((b) => b.toLowerCase().includes(search))
      );
    }

    if (branch && branch !== 'All') {
      placements = placements.filter(
        (p) =>
          p.eligibleBranches.includes(branch) ||
          p.eligibleBranches.some((b) => b.toLowerCase().includes(branch.toLowerCase())) ||
          p.eligibleBranches.some((b) => b.toLowerCase().includes('all') || b.toLowerCase().includes('refer'))
      );
    }

    return NextResponse.json({
      success: true,
      count: placements.length,
      source,
      placements,
    });
  } catch (error) {
    console.error('Error fetching placements:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
