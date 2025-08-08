import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsData, getAllSubmissions, testConnection } from '@/lib/database';
import { getUserFromRequest, hasRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to view analytics (admin only for now)
    if (!hasRole(user, 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Database connection test failed for analytics');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type');

    console.log('Analytics request:', { dataType });

    if (dataType === 'submissions') {
      // Get all submissions with locations for the heatmap
      console.log('Fetching all submissions for heatmap...');
      const { submissions, locations } = await getAllSubmissions();

      return NextResponse.json({
        success: true,
        data: { submissions, locations },
        meta: {
          submissionCount: Array.isArray(submissions) ? submissions.length : 0,
          locationCount: Array.isArray(locations) ? locations.length : 0,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      // Get analytics data for charts and statistics
      console.log('Fetching analytics data for dashboard...');
      const analyticsData = await getAnalyticsData();

      return NextResponse.json({
        success: true,
        data: analyticsData,
        meta: {
          totalSubmissions: analyticsData.totalSubmissions,
          totalLocations: analyticsData.totalLocations,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('❌ Error fetching analytics data:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch analytics data',
        message: 'Unable to retrieve data from database',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    );
  }
}

// Endpoint to get filtered data based on dashboard filters
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to view analytics (admin only for now)
    if (!hasRole(user, 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { filters } = body;

    console.log('Filtered analytics request:', { filters });

    // For now, return all data (filtering logic can be implemented later)
    // In a future version, you would modify the SQL queries based on filters
    const analyticsData = await getAnalyticsData();

    return NextResponse.json({
      success: true,
      data: analyticsData,
      filters: filters,
      meta: {
        totalSubmissions: analyticsData.totalSubmissions,
        totalLocations: analyticsData.totalLocations,
        filtersApplied: filters,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error fetching filtered analytics data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch filtered analytics data',
        message: 'Unable to apply filters to database query',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    );
  }
}
