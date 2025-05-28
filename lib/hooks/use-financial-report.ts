import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  FinancialRow,
  generateEmptyFinancialTemplate,
  calculateHierarchicalTotals
} from "@/components/data-form/schema/financial-report";
import { FinancialReportData, SelectionOption } from "@/components/data-form/financial-table";

// Define loading states for better state transitions
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface UseFinancialReportParams {
  programName: string;
  facilities: string[];
  hospital?: string;
  district?: string;
}

export interface UseFinancialReportResult {
  financialData: FinancialRow[] | undefined;
  loadingState: LoadingState;
  error: Error | null;
  selectedHealthCenter: string;
  reportingPeriod: string;
  reportingPeriodOptions: SelectionOption[];
  healthCenterOptions: SelectionOption[];
  isHospitalMode: boolean;
  reportMetadata: {
    reportingPeriod: string;
    healthCenter: string;
    district: string;
    project: string;
    facilityType: string;
  };
  setSelectedHealthCenter: (value: string) => void;
  setReportingPeriod: (value: string) => void;
  handleSaveFinancialData: (data: FinancialReportData) => void;
  getFiscalYear: () => string;
  retry: () => void;
}

// Cache management
interface CacheEntry {
  data: FinancialRow[];
  timestamp: number;
  key: string;
}

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000; 

export function useFinancialReport({
  programName, 
  facilities, 
  hospital = "", 
  district = ""
}: UseFinancialReportParams): UseFinancialReportResult {
  // Data states
  const [financialData, setFinancialData] = useState<FinancialRow[]>();
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [selectedHealthCenter, setSelectedHealthCenter] = useState("");
  
  // Cache reference (persists between renders but doesn't trigger re-renders)
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  
  // Data fetch timestamp for stale data detection
  const lastFetchRef = useRef<number>(0);
  
  // Determine if we're in hospital mode (when selected facility is the hospital)
  const isHospitalMode = useMemo(() => {
    return selectedHealthCenter === hospital;
  }, [selectedHealthCenter, hospital]);
  
  // Generate reporting period options with current year
  const reportingPeriodOptions = useMemo<SelectionOption[]>(() => {
    const currentYear = new Date().getFullYear();
    return [
      { value: `Q1 FY ${currentYear}`, label: `Q1 FY ${currentYear}` },
      { value: `Q2 FY ${currentYear}`, label: `Q2 FY ${currentYear}` },
      { value: `Q3 FY ${currentYear + 1}`, label: `Q3 FY ${currentYear + 1}` },
      { value: `Q4 FY ${currentYear + 1}`, label: `Q4 FY ${currentYear + 1}` },
    ];
  }, []);
  
  // Default to first reporting period
  const [reportingPeriod, setReportingPeriod] = useState(reportingPeriodOptions[0]?.value || "");
  
  // Get health centers for select options (excluding the hospital)
  const healthCenterOptions = useMemo<SelectionOption[]>(() => {
    return facilities
      .filter(facility => facility !== hospital)
      .map(facility => ({
        value: facility,
        label: facility
      }));
  }, [facilities, hospital]);
  
  // Generate a cache key based on current selections
  const getCacheKey = useCallback(() => {
    return `${selectedHealthCenter}:${reportingPeriod}:${programName}`;
  }, [selectedHealthCenter, reportingPeriod, programName]);
  
  // Check if cached data is available and not expired
  const getFromCache = useCallback(() => {
    const cacheKey = getCacheKey();
    const cachedData = cacheRef.current.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_EXPIRATION) {
      return cachedData.data;
    }
    
    return null;
  }, [getCacheKey]);
  
  // Save data to cache
  const saveToCache = useCallback((data: FinancialRow[]) => {
    const cacheKey = getCacheKey();
    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now(),
      key: cacheKey
    });
    
    // Clean up old cache entries (optional)
    if (cacheRef.current.size > 10) {
      // Find and remove oldest entry
      let oldestKey = '';
      let oldestTime = Date.now();
      
      cacheRef.current.forEach((entry, key) => {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestKey = key;
        }
      });
      
      if (oldestKey) {
        cacheRef.current.delete(oldestKey);
      }
    }
  }, [getCacheKey]);

  // Initialize selected health center when facilities are available
  useEffect(() => {
    // Skip if already set
    if (selectedHealthCenter) return;
    
    // Get all non-hospital facilities (health centers)
    const healthCenters = facilities.filter(facility => facility !== hospital);
    
    // Set a default health center or fall back to hospital if no health centers
    if (healthCenters.length > 0) {
      setSelectedHealthCenter(healthCenters[0] || "");
    } else if (hospital) {
      setSelectedHealthCenter(hospital);
    }
  }, [facilities, hospital, selectedHealthCenter]);
  
  // Extracted function to load financial data with caching
  const loadFinancialData = useCallback(async (forceFresh = false) => {
    // Skip if no facility selected
    if (!selectedHealthCenter) {
      setLoadingState('idle');
      return;
    }
    
    // Check if we already fetched very recently (debounce)
    const now = Date.now();
    if (!forceFresh && (now - lastFetchRef.current < 500)) {
      return;
    }
    lastFetchRef.current = now;
    
    // Try to get from cache first
    if (!forceFresh) {
      const cachedData = getFromCache();
      if (cachedData) {
        setFinancialData(cachedData);
        setLoadingState('success');
        setError(null);
        return;
      }
    }
    
    // Not in cache or force refresh, so load data
    setLoadingState('loading');
    setError(null);
    
    try {
      // Simulate API request with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate data
      const data = calculateHierarchicalTotals(generateEmptyFinancialTemplate());
      
      // Save to state and cache
      setFinancialData(data);
      saveToCache(data);
      setLoadingState('success');
    } catch (err) {
      console.error('Error loading financial data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading financial data'));
      setLoadingState('error');
    }
  }, [selectedHealthCenter, reportingPeriod, getFromCache, saveToCache]);
  
  // Function to retry loading data after an error
  const retry = useCallback(() => {
    // Force fresh data (bypass cache)
    loadFinancialData(true);
  }, [loadFinancialData]);
  
  // Load data when dependencies change
  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);
  
  // Handle saving form data with optimistic updates
  const handleSaveFinancialData = useCallback((data: FinancialReportData) => {
    try {
      // Optimistic update - immediately show the changes
      setFinancialData(data.tableData);
      
      // Update cache with new data
      saveToCache(data.tableData);
      
      console.log("Saving financial data:", data);
      
      // In a real app, this would save to the server:
      // 1. Show optimistic UI update (already done)
      // 2. Send data to the server (simulate with timeout)
      // 3. Handle success/error from server
      
      // Simulate server save success
      setTimeout(() => {
        // Handle successful save if needed
      }, 500);
      
    } catch (err) {
      console.error('Error saving financial data:', err);
      setError(err instanceof Error ? err : new Error('Failed to save financial data'));
      setLoadingState('error');
    }
  }, [saveToCache]);

  // Extract the fiscal year from the reporting period
  const getFiscalYear = useCallback(() => {
    if (!reportingPeriod) return new Date().getFullYear().toString();
    
    // Look for a year in the reporting period string
    const match = reportingPeriod.match(/(\d{4})/);
    return match ? match[1] : new Date().getFullYear().toString();
  }, [reportingPeriod]);

  // Create the report metadata for the title component
  const reportMetadata = useMemo(() => ({
    reportingPeriod,
    healthCenter: selectedHealthCenter,
    district,
    project: `${programName} NSP BUDGET SUPPORT`,
    facilityType: isHospitalMode ? "Hospital" : "Health Center"
  }), [reportingPeriod, selectedHealthCenter, district, programName, isHospitalMode]);

  // Handlers for selection changes with loading state updates
  const handleSetSelectedHealthCenter = useCallback((value: string) => {
    setSelectedHealthCenter(value);
  }, []);
  
  const handleSetReportingPeriod = useCallback((value: string) => {
    setReportingPeriod(value);
  }, []);

  return {
    financialData,
    loadingState,  // New more detailed loading state
    error,
    selectedHealthCenter,
    reportingPeriod,
    reportingPeriodOptions,
    healthCenterOptions,
    isHospitalMode,
    reportMetadata,
    setSelectedHealthCenter: handleSetSelectedHealthCenter,
    setReportingPeriod: handleSetReportingPeriod,
    handleSaveFinancialData,
    getFiscalYear,
    retry
  };
} 