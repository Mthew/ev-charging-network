import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getAllSubmissions } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all submissions from database (no filters to get all)
    const result = await getAllSubmissions({});

    // Type assertion since we know the result structure
    const submissions = Array.isArray(result.submissions)
      ? result.submissions
      : [];
    const locations = Array.isArray(result.locations) ? result.locations : [];

    return NextResponse.json({
      success: true,
      submissions,
      locations,
      total: submissions.length,
    });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
