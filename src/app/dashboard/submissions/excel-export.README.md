# Excel Export Feature for Submissions with Desired Locations

## Overview

Added a comprehensive Excel export functionality to the submissions dashboard that allows administrators to export all submission data joined with their associated desired locations to a formatted Excel file with multiple worksheets.

## Features

### ✅ **Complete Data Export with Locations**

- **All Submissions** - Exports every submission from the database (not just paginated results)
- **Joined Locations Data** - Includes all desired locations for each submission
- **Full Details** - Includes all submission fields:
  - Personal info (Name, Email, Phone)
  - Vehicle details (Type, Brand/Model, Usage)
  - Charging preferences (Connector, Schedule, Location)
  - Location data (Address, Coordinates)
  - **Desired locations** (Multiple locations per submission)
  - Timestamps (Date and Time submitted)

### ✅ **Multi-Worksheet Export**

- **Complete Data Sheet** - One row per submission-location pair (comprehensive view)
- **Submissions Only Sheet** - Clean submission data without location duplicates
- **Desired Locations Sheet** - All desired locations with associated user info

### ✅ **User Experience**

- **Prominent Button** - Export button positioned in CardHeader for easy access
- **Loading States** - Shows "Exporting..." during export process
- **Error Handling** - User-friendly error messages
- **Automatic Naming** - Files named with current date: `ev-submissions-2025-08-28.xlsx`

### ✅ **Excel Formatting**

- **Auto-sized Columns** - Columns automatically sized for readability
- **Multiple Worksheets** - Organized data across different sheets
- **Professional Layout** - Ready for business use and analysis

## Implementation

### Files Created/Modified:

1. **`src/app/api/submissions/export/route.ts`** - New API endpoint
2. **`src/app/dashboard/submissions/page.tsx`** - Updated with export functionality

### Dependencies Added:

- **`xlsx`** v0.18.5 - Excel file generation
- **`@types/xlsx`** v0.0.36 - TypeScript support

### API Endpoint: `/api/submissions/export`

```typescript
GET /api/submissions/export
Authorization: Required (Bearer token)
Response: {
  success: boolean,
  submissions: Submission[],
  locations: Location[],
  total: number
}
```

### Export Function:

```typescript
const exportToExcel = async () => {
  // Fetches all submissions
  // Formats data for Excel
  // Generates and downloads file
};
```

## Usage

1. **Navigate** to Dashboard → Submissions
2. **Click** the "Export to Excel" button in the top-right of the card
3. **Wait** for "Exporting..." to complete
4. **File** will automatically download to your computer

## Excel Structure

The exported Excel file contains **3 worksheets** for comprehensive data analysis:

### 📊 **Worksheet 1: "Complete Data"**

Shows each submission with all associated desired locations (one row per submission-location pair):

| Column                          | Description                        |
| ------------------------------- | ---------------------------------- |
| **Submission ID**               | Submission unique identifier       |
| **Full Name**                   | User's complete name               |
| **Email**                       | Contact email address              |
| **Phone**                       | Phone number                       |
| **Vehicle Type**                | Type of vehicle (Car, Truck, etc.) |
| **Brand/Model**                 | Vehicle brand and model            |
| **Usage Type**                  | How vehicle is used                |
| **Average KMs/Day**             | Daily driving distance             |
| **Connector Preference**        | Preferred charging connector       |
| **Charging Schedule**           | When they typically charge         |
| **Primary Charging Location**   | Where they usually charge          |
| **Charging Address**            | Full address of charging location  |
| **Charger Type**                | Type of charger used               |
| **Cost per KM**                 | Cost per kilometer charged         |
| **Desired Location ID**         | Unique ID of desired location      |
| **Desired Location Identifier** | Location identifier/name           |
| **Desired Address**             | Full address of desired location   |
| **Desired Latitude**            | GPS latitude of desired location   |
| **Desired Longitude**           | GPS longitude of desired location  |
| **Date Submitted**              | Date of form submission            |
| **Time Submitted**              | Time of form submission            |

### 📋 **Worksheet 2: "Submissions Only"**

Clean submission data without location duplicates (one row per submission):

| Column                        | Description                       |
| ----------------------------- | --------------------------------- |
| **ID**                        | Submission unique identifier      |
| **Full Name**                 | User's complete name              |
| **Email**                     | Contact email address             |
| **Phone**                     | Phone number                      |
| **Vehicle Type**              | Type of vehicle                   |
| **Brand/Model**               | Vehicle brand and model           |
| **Usage Type**                | How vehicle is used               |
| **Average KMs/Day**           | Daily driving distance            |
| **Connector Preference**      | Preferred charging connector      |
| **Charging Schedule**         | When they typically charge        |
| **Primary Charging Location** | Where they usually charge         |
| **Charging Address**          | Full address of charging location |
| **Charger Type**              | Type of charger used              |
| **Cost per KM**               | Cost per kilometer charged        |
| **Date Submitted**            | Date of form submission           |
| **Time Submitted**            | Time of form submission           |

### 📍 **Worksheet 3: "Desired Locations"**

All desired locations with associated user information:

| Column                  | Description                      |
| ----------------------- | -------------------------------- |
| **Submission ID**       | Related submission ID            |
| **User Name**           | Name of the user who submitted   |
| **User Email**          | Email of the user                |
| **Location ID**         | Unique location identifier       |
| **Location Identifier** | Location name/identifier         |
| **Desired Address**     | Full address of desired location |
| **Latitude**            | GPS latitude coordinate          |
| **Longitude**           | GPS longitude coordinate         |
| **Location Added**      | Date location was added          |
| **Vehicle Type**        | User's vehicle type              |
| **Vehicle Brand/Model** | User's vehicle details           |

## Security

- ✅ **Authentication Required** - Only authenticated users can export
- ✅ **Admin Access** - Respects existing access controls
- ✅ **Data Validation** - Proper error handling for invalid requests

## Performance

- ✅ **Efficient Queries** - Uses existing optimized database functions
- ✅ **Memory Management** - Streams large datasets efficiently
- ✅ **Client-side Processing** - Excel generation happens in browser

## Browser Support

- ✅ **Modern Browsers** - Chrome, Firefox, Safari, Edge
- ✅ **Mobile Compatible** - Works on tablets and mobile devices
- ✅ **Download Handling** - Automatic file download

## Key Benefits

### 📊 **Comprehensive Analysis**

- **Complete dataset** with all relationships preserved
- **Multiple views** of the same data for different analysis needs
- **Location mapping** capabilities with GPS coordinates
- **User behavior insights** with charging preferences and patterns

### 🔍 **Data Relationships**

- **One-to-many relationships** properly handled (submissions to locations)
- **Cross-referencing** between submissions and locations
- **User contact info** included in location data for follow-ups
- **Complete audit trail** with timestamps

### 💼 **Business Intelligence Ready**

- **Multiple worksheets** for different stakeholder needs
- **Structured data** ready for pivot tables and charts
- **Geographic data** for mapping and location analysis
- **Time series data** for trend analysis

## Usage Examples

### For Management:

- Use **"Submissions Only"** sheet for user overview and contact management
- Analyze vehicle types and usage patterns
- Track submission trends over time

### For Planning & Operations:

- Use **"Complete Data"** sheet to see all submissions with their location requests
- Identify high-demand areas for charging infrastructure
- Plan charging network expansion based on desired locations

### For Technical Teams:

- Use **"Desired Locations"** sheet for infrastructure planning
- Extract GPS coordinates for mapping applications
- Analyze location distribution and accessibility

## Future Enhancements

- ✅ **Complete Data Export** - ✨ **IMPLEMENTED** - Now includes all submissions with joined locations
- ✅ **Multiple Worksheets** - ✨ **IMPLEMENTED** - Three specialized worksheets
- ✅ **Location Integration** - ✨ **IMPLEMENTED** - Full desired_locations table join
- 📋 **Filtered Exports** - Export based on date ranges or filters
- 📊 **Multiple Formats** - CSV, PDF export options
- 📈 **Scheduled Exports** - Automatic daily/weekly exports
- 🎨 **Custom Formatting** - Branded Excel templates
- 🗺️ **Geographic Export** - KML/GeoJSON format for mapping tools

The export feature is now live and ready for use at **http://localhost:3000/dashboard/submissions**!
