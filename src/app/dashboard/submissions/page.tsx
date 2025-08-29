"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Submission {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  brand_model: string;
  usage_type: string;
  primary_charging_location: string;
  created_at: string;
}

interface ExportSubmission {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  brand_model: string;
  usage_type: string;
  average_kms_per_day: string;
  preference_connector: string;
  usual_charging_schedule: string;
  primary_charging_location: string;
  charging_address: string;
  charger_type: string;
  cost_per_km_charged?: string;
  created_at: string;
}

interface ExportLocation {
  id: number;
  submission_id: number;
  identifier: string;
  address: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

interface ExportData {
  success: boolean;
  message?: string;
  submissions: ExportSubmission[];
  locations: ExportLocation[];
}

interface ComprehensiveDataItem {
  "Submission ID": number;
  "Full Name": string;
  Email: string;
  Phone: string;
  "Vehicle Type": string;
  "Brand/Model": string;
  "Usage Type": string;
  "Average KMs/Day": string;
  "Connector Preference": string;
  "Charging Schedule": string;
  "Primary Charging Location": string;
  "Charging Address": string;
  "Charger Type": string;
  "Cost per KM": string;
  "Desired Location ID": number | string;
  "Desired Location Identifier": string;
  "Desired Address": string;
  "Desired Latitude": number | string;
  "Desired Longitude": number | string;
  "Date Submitted": string;
  "Time Submitted": string;
}

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/submissions?page=${page}&limit=${limit}`
        );
        const data = await response.json();
        setSubmissions(data.submissions);
        setTotal(data.total);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [page, limit]);

  const exportToExcel = async () => {
    try {
      setIsExporting(true);

      // Fetch all submissions for export
      const response = await fetch("/api/submissions/export");
      const data = (await response.json()) as ExportData;

      if (!data.success) {
        throw new Error(data.message || "Failed to export data");
      }

      // Prepare main submissions data for Excel
      const submissionsData = data.submissions.map(
        (submission: ExportSubmission) => ({
          ID: submission.id,
          "Full Name": submission.full_name,
          Email: submission.email,
          Phone: submission.phone,
          "Vehicle Type": submission.vehicle_type,
          "Brand/Model": submission.brand_model,
          "Usage Type": submission.usage_type,
          "Average KMs/Day": submission.average_kms_per_day,
          "Connector Preference": submission.preference_connector,
          "Charging Schedule": submission.usual_charging_schedule,
          "Primary Charging Location": submission.primary_charging_location,
          "Charging Address": submission.charging_address,
          "Charger Type": submission.charger_type,
          "Cost per KM": submission.cost_per_km_charged || "",
          "Date Submitted": new Date(
            submission.created_at
          ).toLocaleDateString(),
          "Time Submitted": new Date(
            submission.created_at
          ).toLocaleTimeString(),
        })
      );

      // Prepare locations data for Excel - join with submission details
      const locationsData = data.locations.map((location: ExportLocation) => {
        const relatedSubmission = data.submissions.find(
          (sub: ExportSubmission) => sub.id === location.submission_id
        );
        return {
          "Submission ID": location.submission_id,
          "User Name": relatedSubmission?.full_name || "",
          "User Email": relatedSubmission?.email || "",
          "Location ID": location.id,
          "Location Identifier": location.identifier,
          "Desired Address": location.address,
          Latitude: location.latitude || "",
          Longitude: location.longitude || "",
          "Location Added": new Date(location.created_at).toLocaleDateString(),
          "Vehicle Type": relatedSubmission?.vehicle_type || "",
          "Vehicle Brand/Model": relatedSubmission?.brand_model || "",
        };
      });

      // Create comprehensive export data - one row per submission with all locations
      const comprehensiveData: ComprehensiveDataItem[] = [];

      data.submissions.forEach((submission: ExportSubmission) => {
        const submissionLocations = data.locations.filter(
          (loc: ExportLocation) => loc.submission_id === submission.id
        );

        if (submissionLocations.length === 0) {
          // Submission without desired locations
          comprehensiveData.push({
            "Submission ID": submission.id,
            "Full Name": submission.full_name,
            Email: submission.email,
            Phone: submission.phone,
            "Vehicle Type": submission.vehicle_type,
            "Brand/Model": submission.brand_model,
            "Usage Type": submission.usage_type,
            "Average KMs/Day": submission.average_kms_per_day,
            "Connector Preference": submission.preference_connector,
            "Charging Schedule": submission.usual_charging_schedule,
            "Primary Charging Location": submission.primary_charging_location,
            "Charging Address": submission.charging_address,
            "Charger Type": submission.charger_type,
            "Cost per KM": submission.cost_per_km_charged || "",
            "Desired Location ID": "",
            "Desired Location Identifier": "",
            "Desired Address": "",
            "Desired Latitude": "",
            "Desired Longitude": "",
            "Date Submitted": new Date(
              submission.created_at
            ).toLocaleDateString(),
            "Time Submitted": new Date(
              submission.created_at
            ).toLocaleTimeString(),
          });
        } else {
          // Create one row for each desired location
          submissionLocations.forEach((location: ExportLocation) => {
            comprehensiveData.push({
              "Submission ID": submission.id,
              "Full Name": submission.full_name,
              Email: submission.email,
              Phone: submission.phone,
              "Vehicle Type": submission.vehicle_type,
              "Brand/Model": submission.brand_model,
              "Usage Type": submission.usage_type,
              "Average KMs/Day": submission.average_kms_per_day,
              "Connector Preference": submission.preference_connector,
              "Charging Schedule": submission.usual_charging_schedule,
              "Primary Charging Location": submission.primary_charging_location,
              "Charging Address": submission.charging_address,
              "Charger Type": submission.charger_type,
              "Cost per KM": submission.cost_per_km_charged || "",
              "Desired Location ID": location.id,
              "Desired Location Identifier": location.identifier,
              "Desired Address": location.address,
              "Desired Latitude": location.latitude || "",
              "Desired Longitude": location.longitude || "",
              "Date Submitted": new Date(
                submission.created_at
              ).toLocaleDateString(),
              "Time Submitted": new Date(
                submission.created_at
              ).toLocaleTimeString(),
            });
          });
        }
      });

      // Create workbook with multiple worksheets
      const workbook = XLSX.utils.book_new();

      // 1. Comprehensive worksheet (main data with locations)
      const comprehensiveSheet = XLSX.utils.json_to_sheet(comprehensiveData);
      const comprehensiveColWidths = Object.keys(
        comprehensiveData[0] || {}
      ).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      comprehensiveSheet["!cols"] = comprehensiveColWidths;
      XLSX.utils.book_append_sheet(
        workbook,
        comprehensiveSheet,
        "Complete Data"
      );

      // 2. Submissions only worksheet
      const submissionsSheet = XLSX.utils.json_to_sheet(submissionsData);
      const submissionsColWidths = Object.keys(submissionsData[0] || {}).map(
        (key) => ({
          wch: Math.max(key.length, 15),
        })
      );
      submissionsSheet["!cols"] = submissionsColWidths;
      XLSX.utils.book_append_sheet(
        workbook,
        submissionsSheet,
        "Submissions Only"
      );

      // 3. Locations only worksheet (if there are locations)
      if (locationsData.length > 0) {
        const locationsSheet = XLSX.utils.json_to_sheet(locationsData);
        const locationsColWidths = Object.keys(locationsData[0] || {}).map(
          (key) => ({
            wch: Math.max(key.length, 15),
          })
        );
        locationsSheet["!cols"] = locationsColWidths;
        XLSX.utils.book_append_sheet(
          workbook,
          locationsSheet,
          "Desired Locations"
        );
      }

      // Generate filename with current date
      const filename = `ev-submissions-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="w-full">
      <Card className="border-0 shadow-none md:border md:shadow-sm">
        <CardHeader className="px-4 py-4 md:px-6 md:py-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle className="text-xl md:text-2xl">
              User Submissions
            </CardTitle>
            <Button
              onClick={exportToExcel}
              disabled={isExporting}
              className="flex items-center justify-center space-x-2 w-full md:w-auto"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? "Exporting..." : "Export to Excel"}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 md:px-6">
          {/* Mobile-first table with horizontal scroll */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="min-w-[120px] px-4 py-3 text-left">
                      Name
                    </TableHead>
                    <TableHead className="min-w-[180px] px-4 py-3 text-left">
                      Email
                    </TableHead>
                    <TableHead className="min-w-[120px] px-4 py-3 text-left">
                      Phone
                    </TableHead>
                    <TableHead className="min-w-[130px] px-4 py-3 text-left">
                      Vehicle Type
                    </TableHead>
                    <TableHead className="min-w-[150px] px-4 py-3 text-left">
                      Brand/Model
                    </TableHead>
                    <TableHead className="min-w-[120px] px-4 py-3 text-left">
                      Usage Type
                    </TableHead>
                    <TableHead className="min-w-[100px] px-4 py-3 text-left">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: limit }, (_, index) => (
                        <TableRow
                          key={`skeleton-${index}`}
                          className="border-b"
                        >
                          <TableCell className="px-4 py-3">
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Skeleton className="h-4 w-14" />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Skeleton className="h-4 w-18" />
                          </TableCell>
                        </TableRow>
                      ))
                    : submissions.map((submission) => (
                        <TableRow
                          key={submission.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <TableCell className="px-4 py-3 font-medium">
                            {submission.full_name}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-muted-foreground">
                            {submission.email}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {submission.phone}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {submission.vehicle_type}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {submission.brand_model}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {submission.usage_type}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {new Date(
                              submission.created_at
                            ).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col space-y-4 mt-6 px-4 md:px-0 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <div className="text-sm text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `Showing ${submissions.length} of ${total} results`
                )}
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || isLoading}
                className="flex-1 md:flex-none"
              >
                Previous
              </Button>
              <div className="flex items-center justify-center min-w-[100px]">
                {isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || isLoading}
                className="flex-1 md:flex-none"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionsPage;
