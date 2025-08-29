import { NextRequest, NextResponse } from "next/server";
import {
  insertFormSubmission,
  initializeDatabase,
  testConnection,
  EVFormSubmission,
} from "@/lib/database";

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY is not set");
    return false;
  }

  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await fetch(verificationUrl, { method: "POST" });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error verifying ReCaptcha:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recaptchaToken, ...formData } = body;

    if (!recaptchaToken) {
      return NextResponse.json(
        { error: "ReCaptcha token is missing" },
        { status: 400 }
      );
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: "Invalid ReCaptcha token" },
        { status: 400 }
      );
    }

    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("Database connection test failed");
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    console.log("Received form submission:", {
      email: formData.email,
      vehicleType: formData.vehicleType,
      desiredLocationsCount: formData.desiredLocations?.length || 0,
    });

    // Extract form data
    const {
      vehicleType,
      brandModel,
      usageType,
      averageKmsPerDay,
      usualChargingSchedule,
      preferenceConnector,
      primaryChargingLocation,
      chargingAddress,
      chargerType,
      costPerKmCharged,
      fullName,
      phone,
      email,
      desiredLocations = [],
      currentChargingLocation = {},
    } = formData;

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
    const submission: Omit<
      EVFormSubmission,
      "id" | "created_at" | "updated_at"
    > = {
      vehicle_type: vehicleType,
      brand_model: brandModel,
      usage_type: usageType,
      usual_charging_schedule: usualChargingSchedule,
      preference_connector: preferenceConnector,
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
