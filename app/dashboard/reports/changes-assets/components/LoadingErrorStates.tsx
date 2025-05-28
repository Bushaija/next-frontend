import React from "react";
import { FinancialTableSkeleton } from "@/components/financial";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function LoadingState() {
  return (
    <div 
      className="container mx-auto py-8" 
      role="status" 
      aria-live="polite"
    >
      <FinancialTableSkeleton />
      <span className="sr-only">Loading financial data...</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div 
      className="container mx-auto py-8" 
      role="alert" 
      aria-live="assertive"
    >
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-500 mb-2">Error: {message}</p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
} 