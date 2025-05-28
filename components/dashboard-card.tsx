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

  const handleContinue = () => {
    if (selectedProgram && selectedFiscalYear) {
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
      
      // Navigate to planning page with all query parameters
      router.push(`/dashboard/planning/new?${params.toString()}`);
    }
  };
  
  return (
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
        <Dialog>
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
                <Select onValueChange={setLocalSelectedProgram}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {programs.map((program) => (
                        <SelectItem key={program.name} value={program.name}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select onValueChange={setLocalSelectedFiscalYear}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select fiscal year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectContent>
                        {reportingPeriodOptions.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleContinue();
                }}
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
