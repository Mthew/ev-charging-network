import mysql, { ResultSetHeader, Pool, PoolConnection } from 'mysql2/promise';

// Database connection configuration
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ev_charging_network',
  // Connection pool settings
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
  timeout: parseInt(process.env.DB_TIMEOUT || '60000'),
  // Additional production settings
  reconnect: true,
  charset: 'utf8mb4',
  timezone: 'Z',
  supportBigNumbers: true,
  bigNumberStrings: true,
};

// Create connection pool (better for production)
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    console.log('Creating new MySQL connection pool...');
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Get connection from pool
export async function getConnection(): Promise<PoolConnection> {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Failed to get database connection from pool:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  let connection: PoolConnection | null = null;
  try {
    console.log('Testing database connection...');
    connection = await getConnection();

    // Test query
    await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Database schema types
export interface EVFormSubmission {
  id?: number;
  // Vehicle Information
  vehicle_type: string;
  brand_model: string;
  license_plate?: string;
  usage_type: string;
  average_kms_per_day: string;

  // Current Charging Location
  primary_charging_location: string;
  charging_address: string;
  charging_latitude?: number;
  charging_longitude?: number;
  charger_type: string;

  // Contact Information
  full_name: string;
  phone: string;
  email: string;

  // Metadata
  created_at?: Date;
  updated_at?: Date;
}

export interface DesiredLocation {
  id?: number;
  submission_id: number;
  identifier: string;
  address: string;
  latitude?: number;
  longitude?: number;
  created_at?: Date;
}

// Initialize database tables
export async function initializeDatabase(): Promise<boolean> {
  let connection: PoolConnection | null = null;

  try {
    console.log('Initializing database tables...');
    connection = await getConnection();

    // Create main submissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ev_form_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_type VARCHAR(100) NOT NULL,
        brand_model VARCHAR(200) NOT NULL,
        license_plate VARCHAR(50),
        usage_type VARCHAR(100) NOT NULL,
        average_kms_per_day VARCHAR(50) NOT NULL,
        primary_charging_location VARCHAR(100) NOT NULL,
        charging_address TEXT NOT NULL,
        charging_latitude DECIMAL(10, 8),
        charging_longitude DECIMAL(11, 8),
        charger_type VARCHAR(100) NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_vehicle_type (vehicle_type),
        INDEX idx_usage_type (usage_type),
        INDEX idx_charging_location (primary_charging_location),
        INDEX idx_created_at (created_at),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create desired locations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS desired_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id INT NOT NULL,
        identifier VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES ev_form_submissions(id) ON DELETE CASCADE,
        INDEX idx_submission_id (submission_id),
        INDEX idx_identifier (identifier),
        INDEX idx_location (latitude, longitude)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Insert form submission
export async function insertFormSubmission(
  submission: Omit<EVFormSubmission, 'id' | 'created_at' | 'updated_at'>,
  desiredLocations: Array<{ identifier: string; address: string; latitude?: number; longitude?: number; }>,
  chargingCoordinates?: { lat?: number; lng?: number }
): Promise<number> {
  let connection: PoolConnection | null = null;

  try {
    connection = await getConnection();
    await connection.beginTransaction();

    console.log('Inserting form submission:', {
      email: submission.email,
      vehicleType: submission.vehicle_type,
      desiredLocationsCount: desiredLocations.length
    });

    // Insert main submission
    const [result] = await connection.execute(`
      INSERT INTO ev_form_submissions (
        vehicle_type, brand_model, license_plate, usage_type, average_kms_per_day,
        primary_charging_location, charging_address, charging_latitude, charging_longitude, charger_type,
        full_name, phone, email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      submission.vehicle_type,
      submission.brand_model,
      submission.license_plate || null,
      submission.usage_type,
      submission.average_kms_per_day,
      submission.primary_charging_location,
      submission.charging_address,
      chargingCoordinates?.lat || null,
      chargingCoordinates?.lng || null,
      submission.charger_type,
      submission.full_name,
      submission.phone,
      submission.email
    ]);

    const submissionId = (result as ResultSetHeader).insertId;
    console.log('✅ Form submission inserted with ID:', submissionId);

    // Insert desired locations
    for (const location of desiredLocations) {
      await connection.execute(`
        INSERT INTO desired_locations (submission_id, identifier, address, latitude, longitude)
        VALUES (?, ?, ?, ?, ?)
      `, [
        submissionId,
        location.identifier,
        location.address,
        location.latitude || null,
        location.longitude || null
      ]);
    }

    console.log('✅ Inserted', desiredLocations.length, 'desired locations');

    await connection.commit();
    return submissionId;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('❌ Error inserting form submission:', error);
    throw new Error(`Failed to save form submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Get all submissions with their desired locations
export async function getAllSubmissions() {
  let connection: PoolConnection | null = null;

  try {
    connection = await getConnection();

    const [submissions] = await connection.execute(`
      SELECT * FROM ev_form_submissions
      ORDER BY created_at DESC
    `);

    const [locations] = await connection.execute(`
      SELECT dl.*, efs.id as submission_id
      FROM desired_locations dl
      JOIN ev_form_submissions efs ON dl.submission_id = efs.id
      ORDER BY dl.created_at DESC
    `);

    console.log('✅ Retrieved', Array.isArray(submissions) ? submissions.length : 0, 'submissions and', Array.isArray(locations) ? locations.length : 0, 'locations');
    return { submissions, locations };
  } catch (error) {
    console.error('❌ Error retrieving submissions:', error);
    throw new Error(`Failed to retrieve submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Get analytics data for dashboard
export async function getAnalyticsData() {
  let connection: PoolConnection | null = null;

  try {
    connection = await getConnection();

    // Vehicle type distribution
    const [vehicleTypes] = await connection.execute(`
      SELECT vehicle_type, COUNT(*) as count
      FROM ev_form_submissions
      GROUP BY vehicle_type
      ORDER BY count DESC
    `);

    // Usage type distribution
    const [usageTypes] = await connection.execute(`
      SELECT usage_type, COUNT(*) as count
      FROM ev_form_submissions
      GROUP BY usage_type
      ORDER BY count DESC
    `);

    // Charging location distribution
    const [chargingLocations] = await connection.execute(`
      SELECT primary_charging_location, COUNT(*) as count
      FROM ev_form_submissions
      GROUP BY primary_charging_location
      ORDER BY count DESC
    `);

    // Daily km ranges
    const [kmRanges] = await connection.execute(`
      SELECT average_kms_per_day, COUNT(*) as count
      FROM ev_form_submissions
      GROUP BY average_kms_per_day
      ORDER BY count DESC
    `);

    // Desired location concentrations
    const [desiredLocationCounts] = await connection.execute(`
      SELECT identifier, COUNT(*) as count
      FROM desired_locations
      GROUP BY identifier
      ORDER BY count DESC
    `);

    // Monthly submissions
    const [monthlyData] = await connection.execute(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM ev_form_submissions
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    // Get total counts
    const [totalSubmissions] = await connection.execute(`
      SELECT COUNT(*) as total FROM ev_form_submissions
    `);

    const [totalLocations] = await connection.execute(`
      SELECT COUNT(*) as total FROM desired_locations
    `);

    console.log('✅ Retrieved analytics data');

    return {
      vehicleTypes,
      usageTypes,
      chargingLocations,
      kmRanges,
      desiredLocationCounts,
      monthlyData,
      totalSubmissions: Array.isArray(totalSubmissions) && totalSubmissions[0] && typeof totalSubmissions[0] === 'object' && 'total' in totalSubmissions[0] ? Number(totalSubmissions[0].total) : 0,
      totalLocations: Array.isArray(totalLocations) && totalLocations[0] && typeof totalLocations[0] === 'object' && 'total' in totalLocations[0] ? Number(totalLocations[0].total) : 0
    };
  } catch (error) {
    console.error('❌ Error retrieving analytics data:', error);
    throw new Error(`Failed to retrieve analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Get submissions count
export async function getSubmissionsCount(): Promise<number> {
  let connection: PoolConnection | null = null;

  try {
    connection = await getConnection();
    const [result] = await connection.execute(`
      SELECT COUNT(*) as count FROM ev_form_submissions
    `);

    const count = Array.isArray(result) && result[0] && typeof result[0] === 'object' && 'count' in result[0] ? Number(result[0].count) : 0;
    console.log('✅ Total submissions count:', count);
    return count;
  } catch (error) {
    console.error('❌ Error getting submissions count:', error);
    return 0;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Close connection pool (for cleanup)
export async function closePool(): Promise<void> {
  if (pool) {
    console.log('Closing MySQL connection pool...');
    await pool.end();
    pool = null;
  }
}
