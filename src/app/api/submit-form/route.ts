import { NextRequest, NextResponse } from "next/server";
import {
  insertFormSubmission,
  initializeDatabase,
  testConnection,
} from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("Database connection test failed");
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    const body = await request.json();
    console.log("Received form submission:", {
      email: body.email,
      vehicleType: body.vehicleType,
      desiredLocationsCount: body.desiredLocations?.length || 0,
    });

    // Extract form data
    const {
      vehicleType,
      brandModel,
      usageType,
      averageKmsPerDay,
      primaryChargingLocation,
      chargingAddress,
      chargerType,
      costPerKmCharged,
      fullName,
      phone,
      email,
      desiredLocations = [],
      currentChargingLocation = {},
    } = body;

    // Validate required fields
    const requiredFields = {
      vehicleType,
      brandModel,
      usageType,
      averageKmsPerDay,
      primaryChargingLocation,
      chargingAddress,
      chargerType,
      fullName,
      phone,
      email,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field, _]) => field);

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields,
          message: `Please fill in all required fields: ${missingFields.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Initialize database if needed
    try {
      const dbInitialized = await initializeDatabase();
      if (!dbInitialized) {
        throw new Error("Failed to initialize database");
      }
    } catch (error) {
      console.error("Database initialization failed:", error);
      return NextResponse.json(
        { error: "Database initialization failed" },
        { status: 503 }
      );
    }

    // Prepare submission data
    const submission = {
      vehicle_type: vehicleType,
      brand_model: brandModel,
      usage_type: usageType,
      average_kms_per_day: averageKmsPerDay,
      primary_charging_location: primaryChargingLocation,
      charging_address: chargingAddress,
      charger_type: chargerType,
      cost_per_km_charged: costPerKmCharged || null,
      full_name: fullName,
      phone: phone,
      email: email,
    };

    // Insert into database
    const submissionId = await insertFormSubmission(
      submission,
      desiredLocations,
      currentChargingLocation
    );

    console.log("✅ Form submission successful:", { submissionId, email });

    return NextResponse.json({
      success: true,
      submissionId,
      message: "Form submitted successfully",
      data: {
        submissionId,
        email,
        desiredLocationsCount: desiredLocations.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error submitting form:", error);

    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("connection")) {
        return NextResponse.json(
          {
            error: "Database connection error",
            message: "Please try again later",
          },
          { status: 503 }
        );
      }
      if (error.message.includes("Duplicate entry")) {
        return NextResponse.json(
          {
            error: "Duplicate submission",
            message: "This email has already been used for a submission",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to submit form. Please try again.",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Form submission endpoint - use POST method",
  });
}
