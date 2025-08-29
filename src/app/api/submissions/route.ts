import { NextResponse } from 'next/server';
import { getSubmissions } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const { submissions, total } = await getSubmissions({ page, limit });
    return NextResponse.json({ submissions, total, page, limit });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
