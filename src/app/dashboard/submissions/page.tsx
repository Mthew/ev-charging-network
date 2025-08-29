'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface Submission {
  id: number;
  full_name: string;
  email: string;
  vehicle_type: string;
  usage_type: string;
  created_at: string;
}

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const response = await fetch(`/api/submissions?page=${page}&limit=${limit}`);
      const data = await response.json();
      setSubmissions(data.submissions);
      setTotal(data.total);
    };

    fetchSubmissions();
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit);

  return (
      <Card>
        <CardHeader>
          <CardTitle>User Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vehicle Type</TableHead>
                <TableHead>Usage Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.full_name}</TableCell>
                  <TableCell>{submission.email}</TableCell>
                  <TableCell>{submission.vehicle_type}</TableCell>
                  <TableCell>{submission.usage_type}</TableCell>
                  <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
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