import { NextRequest, NextResponse } from 'next/server';
import { testConnection, getSubmissionsCount, initializeDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('🔍 Health check requested...');

    // Test database connection
    const isDbConnected = await testConnection();

    if (!isDbConnected) {
      return NextResponse.json({
        status: 'unhealthy',
        database: 'disconnected',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }, { status: 503 });
    }

    // Test database operations
    let submissionCount = 0;
    let dbOperational = false;

    try {
      submissionCount = await getSubmissionsCount();
      dbOperational = true;
    } catch (error) {
      console.error('Database operation test failed:', error);
    }

    // Check environment configuration
    const config = {
      dbHost: process.env.DB_HOST ? '✓ configured' : '❌ missing',
      dbName: process.env.DB_NAME ? '✓ configured' : '❌ missing',
      dbUser: process.env.DB_USER ? '✓ configured' : '❌ missing',
      googleMapsApi: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY &&
                     process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here'
                     ? '✓ configured' : '❌ missing or placeholder'
    };

    const isHealthy = isDbConnected && dbOperational;
    const responseTime = Date.now() - startTime;

    console.log(`✅ Health check completed in ${responseTime}ms - Status: ${isHealthy ? 'healthy' : 'degraded'}`);

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      database: {
        connected: isDbConnected,
        operational: dbOperational,
        totalSubmissions: submissionCount
      },
      configuration: config,
      system: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      },
      responseTime,
      timestamp: new Date().toISOString()
    }, {
      status: isHealthy ? 200 : 206 // 206 = Partial Content (degraded)
    });

  } catch (error) {
    console.error('❌ Health check failed:', error);

    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Initialize database and return status
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Database initialization requested...');

    const body = await request.json();
    const { action } = body;

    if (action === 'init-database') {
      const initialized = await initializeDatabase();

      if (initialized) {
        const submissionCount = await getSubmissionsCount();

        return NextResponse.json({
          success: true,
          message: 'Database initialized successfully',
          submissionCount,
          timestamp: new Date().toISOString()
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Database initialization failed'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Invalid action. Use "init-database" to initialize the database.'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Database initialization failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to initialize database'
    }, { status: 500 });
  }
}
