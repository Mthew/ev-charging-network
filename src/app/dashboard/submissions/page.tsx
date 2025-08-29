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

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const response = await fetch(
        `/api/submissions?page=${page}&limit=${limit}`
      );
      const data = await response.json();
      setSubmissions(data.submissions);
      setTotal(data.total);
    };

    fetchSubmissions();
  }, [page, limit]);

  const exportToExcel = async () => {
    try {
      setIsExporting(true);

      // Fetch all submissions for export
      const response = await fetch("/api/submissions/export");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to export data");
      }

      // Prepare main submissions data for Excel
      const submissionsData = data.submissions.map((submission: any) => ({
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
        "Date Submitted": new Date(submission.created_at).toLocaleDateString(),
        "Time Submitted": new Date(submission.created_at).toLocaleTimeString(),
      }));

      // Prepare locations data for Excel - join with submission details
      const locationsData = data.locations.map((location: any) => {
        const relatedSubmission = data.submissions.find(
          (sub: any) => sub.id === location.submission_id
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
      const comprehensiveData: any[] = [];

      data.submissions.forEach((submission: any) => {
        const submissionLocations = data.locations.filter(
          (loc: any) => loc.submission_id === submission.id
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
          submissionLocations.forEach((location: any) => {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Submissions</CardTitle>
          <Button
            onClick={exportToExcel}
            disabled={isExporting}
            className="flex items-center space-x-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? "Exporting..." : "Export to Excel"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Vehicle Type</TableHead>
              <TableHead>Brand/Model</TableHead>
              <TableHead>Usage Type</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">
                  {submission.full_name}
                </TableCell>
                <TableCell>{submission.email}</TableCell>
                <TableCell>{submission.phone}</TableCell>
                <TableCell>{submission.vehicle_type}</TableCell>
                <TableCell>{submission.brand_model}</TableCell>
                <TableCell>{submission.usage_type}</TableCell>
                <TableCell>
                  {new Date(submission.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-sm text-gray-500">
              Showing {submissions.length} of {total} results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionsPage;
