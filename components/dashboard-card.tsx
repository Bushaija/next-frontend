import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation";
import { usePlanningMetadataStore } from "@/store/planning-metadata";
import { useCheckExistingPlan } from "@/lib/hooks/use-plans";
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Program = {
  name: string
  status: boolean
}

type ReportingPeriod = {
  value: string 
  label: string
}
// { value: `Q1 FY ${currentYear}`, label: `Q1 FY ${currentYear}` },
interface HealthFacilityProps {
  healthFacilityType: string
  healthFacilityName: string
  district: string
  programs: Program[]
  reportingPeriodOptions: ReportingPeriod[]
  reportingPeriod?: string
  onClick?: () => void
}

export function DashboardCard({ healthFacilityType, healthFacilityName, district, programs, reportingPeriodOptions, reportingPeriod, onClick }: HealthFacilityProps) {
  const router = useRouter();
  const { setSelectedProgram, setSelectedFiscalYear, setFacility } = usePlanningMetadataStore();
  const [selectedProgram, setLocalSelectedProgram] = React.useState<string>("");
  const [selectedFiscalYear, setLocalSelectedFiscalYear] = React.useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [validationMessage, setValidationMessage] = React.useState<string>("");
  
  const { mutate: checkExistingPlan, isPending: isCheckingPlan } = useCheckExistingPlan();

  const handleContinue = () => {
    // Validate form fields
    if (!selectedProgram || !selectedFiscalYear) {
      toast.error('Please select both program and fiscal year');
      return;
    }

    // Check if plan already exists
    checkExistingPlan({
      facilityName: healthFacilityName,
      facilityType: healthFacilityType,
      program: selectedProgram,
      fiscalYear: selectedFiscalYear,
    }, {
      onSuccess: (response) => {
        if (response.exists) {
          // Plan already exists, show confirmation dialog
          setValidationMessage(response.message);
          setShowConfirmDialog(true);
        } else {
          // Plan doesn't exist, proceed with creation
          proceedToPlanCreation();
        }
      },
      onError: (error) => {
        console.error('Validation error:', error);
        toast.error('Failed to validate plan. Please try again.');
      }
    });
  };

  const proceedToPlanCreation = () => {
    setSelectedProgram(selectedProgram);
    setSelectedFiscalYear(selectedFiscalYear);
    setFacility(healthFacilityName, healthFacilityType, district);
    
    // Convert healthFacilityType to lowercase and replace space with hyphen for the query parameter
    const facilityTypeParam = healthFacilityType.toLowerCase().replace(/\s+/g, '-');
    
    // Create URLSearchParams object to properly encode query parameters
    const params = new URLSearchParams();
    params.set('facilityType', facilityTypeParam);
    params.set('facilityName', encodeURIComponent(healthFacilityName));
    params.set('program', encodeURIComponent(selectedProgram));
    params.set('fiscalYear', encodeURIComponent(selectedFiscalYear));
    
    // Close dialogs
    setIsDialogOpen(false);
    setShowConfirmDialog(false);
    
    // Navigate to planning page with all query parameters
    router.push(`/dashboard/planning/new?${params.toString()}`);
    
    // Reset form
    setLocalSelectedProgram("");
    setLocalSelectedFiscalYear("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset form when dialog is closed
      setLocalSelectedProgram("");
      setLocalSelectedFiscalYear("");
    }
  };
  
  return (
    <>
      <Card className="w-[350px]">
        <CardHeader 
          className="flex flex-row gap-2 p-4 cursor-pointer" 
          onClick={onClick}
          title={reportingPeriod ? `Current reporting period: ${reportingPeriod}` : undefined}
        >
          <div className={`bg-black rounded-md flex justify-center items-center w-[40px] h-[40px] text-md font-bold ${healthFacilityType === "Hospital" ? "text-yellow-500" : "text-green-500"}`}>
            {healthFacilityType === "Hospital" ? "H" : "HC"}
          </div>
          <div className="flex flex-col">
            <CardTitle>{healthFacilityName}{" "}{healthFacilityType}</CardTitle>
            <CardDescription>{healthFacilityName},{" "}{district}</CardDescription>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 bg-gray-50">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between gap-2">
              <h4 className="mb-2 text-sm font-semibold leading-none">Programs</h4>
              <h4 className="mb-2 text-sm font-semibold leading-none">Status</h4>
            </div>
           { 
              programs.map((program) => (  
                  <div className="flex flex-row justify-between" key={program.name}>
                  <p className="ml-4 text-sm text-muted-foreground">{program.name}</p>
                  <p className="ml-4 text-sm text-muted-foreground text-center w-[48px]">{program.status ? "True" : "False"}</p>
                </div>
              ))
            }
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50">
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation(); // Prevent event from bubbling up to the card header
              // Add functionality for "See Details" if needed
            }}
          >
            See Details
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={(e) => e.stopPropagation()}>Initiate Plan</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-uppercase font-bold">Create a plan for {healthFacilityName.toUpperCase()}{" "}{healthFacilityType}</DialogTitle>
                <DialogDescription>
                 {"Select a program and fiscal year to initiate a plan."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Program</label>
                    <Select 
                      value={selectedProgram} 
                      onValueChange={setLocalSelectedProgram}
                      disabled={isCheckingPlan}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {programs.filter(program => program.status).map((program) => (
                            <SelectItem key={program.name} value={program.name}>
                              {program.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Fiscal Year</label>
                    <Select 
                      value={selectedFiscalYear} 
                      onValueChange={setLocalSelectedFiscalYear}
                      disabled={isCheckingPlan}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select fiscal year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {reportingPeriodOptions.map((period) => (
                            <SelectItem key={period.value} value={period.value}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContinue();
                  }}
                  disabled={isCheckingPlan || !selectedProgram || !selectedFiscalYear}
                >
                  {isCheckingPlan ? (
                    <>
                      <span className="mr-2">Validating...</span>
                      <span className="animate-spin">⟳</span>
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog for Existing Plans */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Plan Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              {validationMessage}
              <br /><br />
              Do you want to continue and potentially overwrite the existing plan, or would you like to cancel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={proceedToPlanCreation}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
