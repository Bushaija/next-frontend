import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FacilityHeader } from "./facility-header";
import { ProgramList } from "./program-list";
import { InitiatePlanDialog } from "./initiate-plan-dialog";
import { HealthFacilityProps, Program, ReportingPeriod } from "./constants";

export const DashboardCard = ({
  type,
  name,
  district,
  programs,
  reportingPeriodOptions,
  onFacilityClick,
}: HealthFacilityProps) => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handleProgramClick = (program: Program) => {
    setSelectedProgram(program);
  };

  const handleInitiatePlan = (program: Program, period: ReportingPeriod) => {
    // Handle plan initiation logic here
    console.log("Initiating plan for", program.name, "with period", period.name);
    setSelectedProgram(null);
  };

  return (
    <Card className="w-full overflow-hidden">
      <FacilityHeader
        type={type}
        name={name}
        district={district}
        onClick={onFacilityClick}
      />
      <ProgramList
        programs={programs}
        onProgramClick={handleProgramClick}
      />
      {selectedProgram && (
        <div className="p-4 border-t">
          <InitiatePlanDialog
            program={selectedProgram}
            reportingPeriods={reportingPeriodOptions}
            onInitiate={handleInitiatePlan}
          />
        </div>
      )}
    </Card>
  );
}; 