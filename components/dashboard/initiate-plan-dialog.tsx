import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Program, ReportingPeriod } from "./constants";

interface InitiatePlanDialogProps {
  program: Program;
  reportingPeriods: ReportingPeriod[];
  onInitiate: (program: Program, period: ReportingPeriod) => void;
  trigger?: React.ReactNode;
}

export const InitiatePlanDialog = ({
  program,
  reportingPeriods,
  onInitiate,
  trigger,
}: InitiatePlanDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            Initiate Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Initiate {program.name} Plan</DialogTitle>
          <DialogDescription>
            Select a reporting period to initiate the plan for {program.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            {reportingPeriods.map((period) => (
              <Button
                key={period.id}
                variant="outline"
                className="w-full"
                onClick={() => onInitiate(program, period)}
                aria-label={`Initiate plan for ${period.name}`}
              >
                {period.name}
              </Button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 