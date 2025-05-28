"use client"

import { useMemo, useCallback, useState } from "react"
import { ArrowRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SelectionOption } from "./types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Utility function to generate tooltip messages based on validation state
export function getTooltipMessage(isHealthCenterValid: boolean, isReportingPeriodValid: boolean): string {
  if (!isHealthCenterValid && !isReportingPeriodValid) {
    return "Please select both a health center and reporting period";
  } else if (!isHealthCenterValid) {
    return "Please select a health center";
  } else if (!isReportingPeriodValid) {
    return "Please select a reporting period";
  }
  return "";
}

// Reusable dropdown field component
export function DropdownField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  options: SelectionOption[]
  placeholder: string
  disabled?: boolean
}) {
  const selectedLabel = options.find(opt => opt.value === value)?.label || value;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Select
        value={value}
        onValueChange={onChange || (() => {})}
        disabled={!onChange || disabled}
      >
        <SelectTrigger className="w-full">
          {value ? (
            <span>{selectedLabel}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Form section for facility and reporting period selection
interface FormSectionProps {
  healthCenters?: SelectionOption[]
  reportingPeriods?: SelectionOption[]
  selectedHealthCenter?: string
  selectedReportingPeriod?: string
  isHospitalMode?: boolean
  onHealthCenterChange?: (value: string) => void
  onReportingPeriodChange?: (value: string) => void
  onComplete?: () => void
  readOnly?: boolean
}

export function FormSection({
  healthCenters = [],
  reportingPeriods = [],
  selectedHealthCenter = "",
  selectedReportingPeriod = "",
  isHospitalMode = false,
  onHealthCenterChange,
  onReportingPeriodChange,
  onComplete,
  readOnly = false
}: FormSectionProps) {
  // Control dialog open state
  const [open, setOpen] = useState(false);
  
  // Encapsulate validation logic in useMemo for optimization
  const formState = useMemo(() => {
    // Check if selections are valid and complete
    const isHealthCenterValid = isHospitalMode || (selectedHealthCenter !== "");
    const isReportingPeriodValid = selectedReportingPeriod !== "";
    const isFormComplete = isHealthCenterValid && isReportingPeriodValid;
    
    return {
      isHealthCenterValid,
      isReportingPeriodValid,
      isFormComplete
    };
  }, [selectedHealthCenter, selectedReportingPeriod, isHospitalMode]);
  
  // Guard the onComplete callback to only execute when the form is truly complete
  const handleComplete = useCallback(() => {
    if (formState.isFormComplete && onComplete) {
      onComplete();
      setOpen(false);
    }
  }, [formState.isFormComplete, onComplete]);
  
  // Format selections for display
  const selectedHealthCenterLabel = 
    healthCenters.find(hc => hc.value === selectedHealthCenter)?.label || selectedHealthCenter;
  const selectedReportingPeriodLabel = 
    reportingPeriods.find(rp => rp.value === selectedReportingPeriod)?.label || selectedReportingPeriod;
  
  const displayText = formState.isFormComplete ? 
    (isHospitalMode ? 
      `Hospital Mode | ${selectedReportingPeriodLabel}` : 
      `${selectedHealthCenterLabel} | ${selectedReportingPeriodLabel}`
    ) : 
    "Configure Reporting Parameters";
  
  if (readOnly) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="mb-4 flex items-center justify-between w-full"
        >
          <span className="text-sm font-medium">
            {displayText}
          </span>
          <span className="text-xs text-muted-foreground">
            {formState.isFormComplete ? "Change" : "Configure"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Reporting Parameters</DialogTitle>
          <DialogDescription>
            Choose the health center and reporting period for your financial data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {!isHospitalMode && healthCenters.length > 0 && (
            <DropdownField
              label="Select Health Center"
              value={selectedHealthCenter}
              onChange={onHealthCenterChange}
              options={healthCenters}
              placeholder="Select a health center"
            />
          )}
          
          {reportingPeriods.length > 0 && (
            <DropdownField
              label="Reporting Period"
              value={selectedReportingPeriod}
              onChange={onReportingPeriodChange}
              options={reportingPeriods}
              placeholder="Select a reporting period"
            />
          )}
        </div>
        
        <div className="flex justify-end">
          {!formState.isFormComplete ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div aria-describedby="form-incomplete-tooltip">
                    <Button
                      disabled={true}
                      className="flex items-center gap-2 cursor-not-allowed"
                      aria-disabled="true"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-gray-900 text-white px-3 py-2 text-sm" id="form-incomplete-tooltip">
                  {getTooltipMessage(formState.isHealthCenterValid, formState.isReportingPeriodValid)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              onClick={handleComplete}
              className="flex items-center gap-2"
              type="button"
              aria-label="Continue - both selections are complete"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 