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

// Define user type based on login response
type User = {
  id: string;
  name: string;
  email: string;
  province: string;
  district: string;
  hospital: string;
  createdAt: string;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
  
  // Function to get current user from localStorage
  const getCurrentUser = useCallback((): User | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.warn('No user data found in localStorage');
        return null;
      }
      
      const user = JSON.parse(userStr) as User;
      console.log('📋 Current user data:', {
        name: user.name,
        email: user.email,
        province: user.province,
        district: user.district,
        hospital: user.hospital
      });
      
      return user;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  }, []);

  // Function to preserve existing query parameters when adding a new one
  const updateUrlWithFacilityType = useCallback((type: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('facilityType', type);
    params.set('reportingPeriod', reportingPeriod);
    router.push(`?${params.toString()}`);
  }, [router, reportingPeriod]);
  
  // Function to filter facility data based on user's geographical location and hospital
  const getUserFacilityData = useCallback((user: User) => {
    console.log('🔍 Filtering facilities for user:', {
      hospital: user.hospital,
      district: user.district,
      province: user.province
    });

    // Convert user hospital name to lowercase for comparison
    const userHospital = user.hospital.toLowerCase().trim();
    
    // Get all programs available for this user's hospital
    const programsForFacility: Program[] = [];
    const allHealthCenters: string[] = [];
    
    facilitiesData.forEach((facility: FacilityData) => {
      // Check if user's hospital exists in this facility's hospitals list
      const hospitalExists = facility.hospitals.some(
        h => h.toLowerCase().trim() === userHospital
      );
      
      if (hospitalExists) {
        console.log(`✅ Found program for ${user.hospital}:`, facility.program);
        
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
    
    console.log('📊 Facility data results:', {
      programs: programsForFacility.length,
      healthCenters: uniqueHealthCenters.length
    });
    
    setFacilityPrograms(programsForFacility);
    setHealthCenters(uniqueHealthCenters);
    
    if (process.env.NODE_ENV === "development") {
      if (programsForFacility.length === 0) {
        console.warn("No programs found for user's hospital:", user.hospital);
        console.log("Available hospitals in data:", 
          facilitiesData.flatMap(f => f.hospitals).filter((h, i, arr) => arr.indexOf(h) === i)
        );
      }
    }
  }, []);

  // Load user data and facility information
  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Initializing dashboard data...');
      
      // Get current user data
      const user = getCurrentUser();
      
      if (!user) {
        console.error('❌ No user data available, redirecting to sign-in');
        router.push('/sign-in');
        return;
      }
      
      setCurrentUser(user);
      
      // Filter facility data based on user's information
      getUserFacilityData(user);
      
      // Add a small delay to show loading state
      setTimeout(() => {
        setIsLoading(false);
        console.log('✅ Dashboard data loaded successfully');
      }, 1000);
    };

    initializeData();
  }, [getCurrentUser, getUserFacilityData, router]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg">Loading your dashboard...</p>
          {currentUser && (
            <p className="text-sm text-muted-foreground">
              Welcome back, {currentUser.name}!
            </p>
          )}
        </div>
      </div>
    );
  }

  // If no user data, show error state
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Session Expired</h2>
          <p className="text-muted-foreground mb-4">
            Please log in again to access your dashboard.
          </p>
          <button 
            onClick={() => router.push('/sign-in')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Sign In
          </button>
        </Card>
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
    console.log('Current facilityType from URL:', facilityType);
    console.log('Current user:', currentUser);
    console.log('Facility programs:', facilityPrograms);
    console.log('Health centers:', healthCenters.length);
  }

  return (
    <main className="p-4">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome, {currentUser.name}
        </h1>
        <p className="text-muted-foreground">
          {currentUser.hospital} • {currentUser.district}, {currentUser.province}
        </p>
      </div>
      
      <div className="flex flex-col gap-8">
        {/* User's Hospital Dashboard Card */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Hospital</h2>
          <DashboardCard 
            healthFacilityType={"Hospital"}
            healthFacilityName={currentUser.hospital}
            district={currentUser.district}
            programs={facilityPrograms}
            reportingPeriodOptions={reportingPeriodOptions}
            reportingPeriod={reportingPeriod}
            onClick={() => {
              updateUrlWithFacilityType('hospital');
            }}
          />
        </section>
      
        {/* Associated Health Centers */}
        {healthCenters.length > 0 ? (
          <section id="health-centers-section" className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold">
              Associated Health Centers ({healthCenters.length})
            </h2>
            
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
                    district={currentUser.district}
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
              <h3 className="text-lg font-semibold mb-2">No Associated Health Centers</h3>
              <p>
                No health centers are currently linked to <strong>{currentUser.hospital}</strong> in our system.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                If you believe this is an error, please contact your system administrator.
              </p>
            </Card>
          </section>
        )}
      </div>
    </main>
  );
};

export default MainPage;

