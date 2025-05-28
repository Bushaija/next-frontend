'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ExecutionDashboardCard } from '@/components/execution-dashboard-card';
import facilitiesData from '@/constants/facilities-data.json';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

// Define type to match actual data structure
type Facility = {
  program: string;
  "facility-type": string;
  hospitals: string[];
  "health-centers": string[];
};

// Skeleton component for health center cards
const HealthCenterCardSkeleton = () => {
  return (
    <Card className="w-full p-4 space-y-4">
      <div className="flex flex-row gap-2">
        <Skeleton className="w-[40px] h-[40px] rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-[180px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-0.5 w-full my-2" />
      <div className="pt-2 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[40px]" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-[90px]" />
          <Skeleton className="h-4 w-[40px]" />
        </div>
      </div>
      <div className="pt-4 flex justify-between">
        <Skeleton className="h-9 w-[100px] rounded-md" />
        <Skeleton className="h-9 w-[70px] rounded-md" />
      </div>
    </Card>
  );
};

export default function ExecutableTable() {
  // Cast the JSON data with a default empty array
  const typedFacilitiesData = (facilitiesData || []) as Facility[];
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [hospital, setHospital] = useState<string>('');
  const district = 'Burera'; // Default district as constant instead of state
  const [healthCenters, setHealthCenters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const pageSize = 4; // Display 4 health centers per page
  
  // Mock facility programs (in a real app, this would come from an API)
  const facilityPrograms = [
    { name: 'HIV', status: true },
    // { name: 'HIV/AIDS', status: true },
    // { name: 'Malaria', status: true },
    // { name: 'TB', status: false },
  ];
  
  // Reporting period options
  const reportingPeriodOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      { value: `${currentYear - 3}-${currentYear - 2}`, label: `${currentYear - 3}-${currentYear - 2}` },
      { value: `${currentYear - 2}-${currentYear - 1}`, label: `${currentYear - 2}-${currentYear - 1}` },
      { value: `${currentYear - 1}-${currentYear}`, label: `${currentYear - 1}-${currentYear}` },
      { value: `${currentYear}-${currentYear + 1}`, label: `${currentYear}-${currentYear + 1}` },
    ];
  }, []);
  
  
  // Simulate API fetch with setTimeout
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate network request
      setTimeout(() => {
        if (typedFacilitiesData && typedFacilitiesData.length > 0) {
          // Find first record with hospitals
          const facility = typedFacilitiesData.find(f => f.hospitals && f.hospitals.length > 0);
          if (facility) {
            setHospital(facility.hospitals[0] || '');
            setHealthCenters(facility["health-centers"] || []);
          }
        }
        setIsLoading(false);
      }, 1000);
    };
    
    fetchData();
  }, []);
  
  // Pagination handling
  const totalPages = Math.ceil(healthCenters.length / pageSize);
  
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page > 0 && page <= totalPages) {
      setIsChangingPage(true);
      setCurrentPage(page);
      
      // Simulate page change delay
      setTimeout(() => {
        setIsChangingPage(false);
      }, 500);
    }
  };
  
  // Calculate paginated health centers
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedHealthCenters = healthCenters.slice(startIndex, startIndex + pageSize);
  
  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Show current page and adjacent pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i > 1 && i < totalPages) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if we have more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthCenterCardSkeleton />
        <HealthCenterCardSkeleton />
        <HealthCenterCardSkeleton />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-8">
        <ExecutionDashboardCard 
          healthFacilityType={"Hospital"}
          healthFacilityName={hospital}
          district={district}
          programs={facilityPrograms}
          reportingPeriodOptions={reportingPeriodOptions}
        />
      
        {healthCenters.length > 0 && (
          <>
            <div id="health-centers-section" className="flex flex-col gap-6">
              <h2 className="text-xl font-semibold">Associated Health Centers</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isChangingPage ? (
                  // Show skeleton cards while changing page
                  Array.from({ length: pageSize }).map((_, index) => (
                    <HealthCenterCardSkeleton key={index} />
                  ))
                ) : (
                  // Show actual health center cards
                  paginatedHealthCenters.map((center, index) => (
                    <ExecutionDashboardCard 
                      key={`${currentPage}-${index}`}
                      healthFacilityType={"Health Center"}
                      healthFacilityName={center}
                      district={district}
                      programs={facilityPrograms}
                      reportingPeriodOptions={reportingPeriodOptions}
                    />
                  ))
                )}
              </div>
              
              {/* Pagination */}
              {healthCenters.length > pageSize && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        aria-disabled={currentPage === 1}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {getPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        aria-disabled={currentPage === totalPages}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 