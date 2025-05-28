'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ExecutionTable from '@/components/tables/ExecutionTable';
import ExecutableTable from '@/components/tables/ExecutableTable';
import executingData from '@/constants/executing-data.json';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExecutionRecord } from '@/components/tables/ExecutionTable';

export default function ExecutionPage() {
  const router = useRouter();
  const typedExecutingData = executingData as ExecutionRecord[];
  const reportingPeriodOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      { value: `${currentYear}`, label: `${currentYear - 3}-${currentYear - 2}` },
      { value: `${currentYear + 1}`, label: `${currentYear - 2}-${currentYear - 1}` },
      { value: `${currentYear + 2}`, label: `${currentYear - 1}-${currentYear}` },
      { value: `${currentYear + 3}`, label: `${currentYear}-${currentYear + 1}` },
    ];
  }, []);
  
  

  const handleDelete = (id: string) => {
    alert(`Delete execution report with ID: ${id}`);
    // In a real application, you would call an API to delete the record
  };

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Execution Reports</h1>
          <p className="text-muted-foreground">Manage financial execution reports</p>
        </div>
        <Button onClick={() => router.push('/dashboard/execution/new')}>
          <Plus className="mr-2" />
          New Report
        </Button>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="reports">All Reports</TabsTrigger>
          <TabsTrigger value="executables">Executables</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Financial Execution Reports</CardTitle>
              <CardDescription>
                View and manage all financial execution reports across facilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExecutionTable 
                data={typedExecutingData} 
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="executables" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Executables</CardTitle>
              <CardDescription>
                This section is under development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExecutableTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}