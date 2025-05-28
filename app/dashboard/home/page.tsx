"use client"
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardCard } from '@/components/dashboard-card';
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

// Define types for the facilities data
type Program = {
  name: string;
  status: boolean;
}

type FacilityData = {
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

const MainPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [facilityPrograms, setFacilityPrograms] = useState<Program[]>([]);
  const [healthCenters, setHealthCenters] = useState<string[]>([]);

  // Get facilityType from URL query parameter
  const facilityType = searchParams.get('facilityType');
  
  const reportingPeriodOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      { value: `FY ${currentYear}`, label: `${currentYear - 3}-${currentYear - 2}` },
      { value: `FY ${currentYear + 1}`, label: `${currentYear - 2}-${currentYear - 1}` },
      { value: `FY ${currentYear + 2}`, label: `${currentYear - 1}-${currentYear}` },
      { value: `FY ${currentYear + 3}`, label: `${currentYear}-${currentYear + 1}` },
    ];
  }, []);
  
  // State for reporting period
  const [reportingPeriod, setReportingPeriod] = useState(() => reportingPeriodOptions[0]?.value || "");
  
  // Update reporting period from URL if available
  useEffect(() => {
    const urlReportingPeriod = searchParams.get('reportingPeriod');
    if (urlReportingPeriod) {
      setReportingPeriod(urlReportingPeriod);
    }
  }, [searchParams]);
  
  // Pagination state
  const pageSize = 4; // Number of health centers per page
  const [currentPage, setCurrentPage] = useState(1);
  const [isChangingPage, setIsChangingPage] = useState(false);
  
  // Function to preserve existing query parameters when adding a new one
  const updateUrlWithFacilityType = useCallback((type: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('facilityType', type);
    params.set('reportingPeriod', reportingPeriod);
    router.push(`?${params.toString()}`);
  }, [router, reportingPeriod]);

  // Get facility data from URL parameters with null checks
  const facilityName = searchParams.get('facilityName') || '';
  const district = searchParams.get('district') || '';
  
  // Function to find facility data based on facility name
  const getFacilityData = useCallback(() => {
    if (!facilityName) {
      if (process.env.NODE_ENV === "development") {
        console.error("Facility name is missing from URL parameters");
      }
      return;
    }

    // Convert both to lowercase and trim for comparison
    const normalizedFacility = facilityName.toLowerCase().trim();
    
    // Get all programs available for this facility
    const programsForFacility: Program[] = [];
    const allHealthCenters: string[] = [];
    
    facilitiesData.forEach((facility: FacilityData) => {
      const facilityExists = facility.hospitals.some(
        h => h.toLowerCase().trim() === normalizedFacility
      ) || facility["health-centers"].some(
        hc => hc.toLowerCase().trim() === normalizedFacility
      );
      
      if (facilityExists) {
        programsForFacility.push({
          name: facility.program.toUpperCase(),
          status: true
        });
        
        // Add health centers for this facility program
        allHealthCenters.push(...facility["health-centers"]);
      }
    });
    
    // Remove duplicates from health centers array
    const uniqueHealthCenters = [...new Set(allHealthCenters)];
    
    setFacilityPrograms(programsForFacility);
    setHealthCenters(uniqueHealthCenters);
    
    if (process.env.NODE_ENV === "development" && programsForFacility.length === 0) {
      console.warn("No programs found for facility:", facilityName);
    }
  }, [facilityName]);

  useEffect(() => {
    // Add a small delay to ensure data is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
      getFacilityData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [getFacilityData]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Get paginated health centers
  const paginatedHealthCenters = healthCenters.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  // Calculate total pages
  const totalPages = Math.ceil(healthCenters.length / pageSize);

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    
    // Show skeleton loading state
    setIsChangingPage(true);
    
    // Scroll to the health centers section for better UX
    const healthCentersSection = document.getElementById('health-centers-section');
    if (healthCentersSection) {
      healthCentersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Add a small delay to simulate loading and show skeleton
    setTimeout(() => {
      setCurrentPage(page);
      setIsChangingPage(false);
    }, 500); // 500ms delay to show skeleton loading state
  };

  // Debug information only in development
  if (process.env.NODE_ENV === "development") {
    // Log the current facilityType from URL
    console.log('Current facilityType from URL:', facilityType);
  }

  return (
    <main className="p-4">
      
      <div className="flex flex-col gap-8">
        {facilityName && (
          <DashboardCard 
            healthFacilityType={"Hospital"}
            healthFacilityName={facilityName}
            district={district}
            programs={facilityPrograms}
            reportingPeriodOptions={reportingPeriodOptions}
            reportingPeriod={reportingPeriod}
            onClick={() => {
              updateUrlWithFacilityType('hospital');
            }}
          />
        )}
      
        {healthCenters.length > 0 ? (
          <section id="health-centers-section" className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold">Associated Health Centers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isChangingPage ? (
                // Show skeleton cards while changing page
                Array.from({ length: pageSize }).map((_, index) => (
                  <HealthCenterCardSkeleton key={index} />
                ))
              ) : (
                // Show actual health center cards
                paginatedHealthCenters.map((center) => (
                  <DashboardCard 
                    key={`center-${center}`}
                    reportingPeriod={reportingPeriod}
                    healthFacilityType={"Health Center"}
                    healthFacilityName={center}
                    district={district}
                    programs={facilityPrograms}
                    reportingPeriodOptions={reportingPeriodOptions}
                    onClick={() => {
                      updateUrlWithFacilityType('health-center');
                    }}
                  />
                ))
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        aria-disabled={currentPage === 1}
                        aria-label="Previous page"
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, and pages around the current page
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink 
                              isActive={currentPage === page}
                              aria-current={currentPage === page ? "page" : undefined}
                              onClick={() => handlePageChange(page)}
                              className="cursor-pointer"
                              aria-label={`Page ${page}`}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      
                      // Show ellipsis for skipped pages
                      if (
                        (page === 2 && currentPage > 3) || 
                        (page === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <PaginationItem key={`ellipsis-${page}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        aria-disabled={currentPage === totalPages}
                        aria-label="Next page"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </section>
        ) : (
          <section className="mt-6">
            <Card className="p-6 text-center text-gray-600">
              <p>No health centers are currently linked to <strong>{facilityName}</strong>. Please check back later or contact support.</p>
            </Card>
          </section>
        )}
      </div>
    </main>
  );
};

export default MainPage;

