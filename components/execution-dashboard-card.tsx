import React from 'react';

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
import { useExecutionMetadataStore } from "@/store/execution-metadata";

type Program = {
  name: string
  status: boolean
}

type ReportingPeriod = {
  value: string 
  label: string
}

type HealthFacilityProps = {
  healthFacilityType: "Hospital" | "Health Center"
  healthFacilityName: string
  district: string
  programs: Program[]
  reportingPeriodOptions: ReportingPeriod[]
}

export function ExecutionDashboardCard({ 
  healthFacilityType, 
  healthFacilityName, 
  district, 
  programs, 
  reportingPeriodOptions 
}: HealthFacilityProps) {
  const router = useRouter();
  const { 
    setSelectedProgram, 
    setSelectedFiscalYear, 
    setFacility 
  } = useExecutionMetadataStore();
  
  const [selectedProgram, setLocalSelectedProgram] = React.useState<string>("");
  const [selectedFiscalYear, setLocalSelectedFiscalYear] = React.useState<string>("");

  const handleContinue = () => {
    if (selectedProgram && selectedFiscalYear) {
      setSelectedProgram(selectedProgram);
      setSelectedFiscalYear(selectedFiscalYear);
      setFacility(healthFacilityName, healthFacilityType, district);
      
      // Create URLSearchParams object to properly encode query parameters
      const params = new URLSearchParams();
      params.set('facilityType', healthFacilityType.toLowerCase().replace(/\s+/g, '-'));
      params.set('facilityName', encodeURIComponent(healthFacilityName));
      params.set('district', encodeURIComponent(district));
      params.set('program', encodeURIComponent(selectedProgram));
      // Extract just the year from the fiscal year value (e.g., "FY 2024" -> "2024")
      const fiscalYear = selectedFiscalYear.replace('FY ', '');
      params.set('fiscalYear', encodeURIComponent(fiscalYear));
      
      // Navigate to execution new page with all query parameters
      router.push(`/dashboard/execution/new?${params.toString()}`);
    }
  };
  
  return (
    <Card className="w-[350px]">
      <CardHeader className="flex flex-row gap-2 p-4">
        <div className="bg-black rounded-md flex justify-center items-center w-[40px] h-[40px] text-md text-white font-bold">
          {healthFacilityType === "Hospital" ? "H" : "HC"}
        </div>
        <div className="flex flex-col">
          <CardTitle>{healthFacilityName}{" "}{healthFacilityType}</CardTitle>
          <CardDescription>{healthFacilityName},{" "}{district}</CardDescription>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4">
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
        <Button variant="outline">See Details</Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Execute</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-uppercase font-bold">Create Execution Report for {healthFacilityName.toUpperCase()}{" "}{healthFacilityType}</DialogTitle>
              <DialogDescription>
                {"Select a program and fiscal year to create an execution report."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-4">
                <Select onValueChange={setLocalSelectedProgram}>
                  <SelectTrigger className="w-full">
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
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleContinue}
                disabled={!selectedProgram || !selectedFiscalYear}
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
} 