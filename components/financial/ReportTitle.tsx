import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { z } from "zod";

// Zod schema for validation
export const ReportTitleSchema = z.object({
  governmentBody: z.string().min(1, "Government body is required"),
  program: z.string().min(1, "Program name is required"),
  reportType: z.string().min(1, "Report type is required"),
  statement: z.string().min(1, "Statement type is required"),
});

// Type derived from Zod schema
export type ReportTitleProps = z.infer<typeof ReportTitleSchema>;

export function ReportTitle({
  governmentBody,
  program,
  reportType,
  statement,
  className,
}: ReportTitleProps & { className?: string }) {
  return (
    <Card className={cn("border-0 shadow-none pt-4", className)}>
      <CardContent className="p-0 space-y-1 text-lg font-semibold">
        <h1>{governmentBody}</h1>
        <h2>{program}</h2>
        <h3>{reportType}</h3>
        <h4>{statement}</h4>
      </CardContent>
    </Card>
  );
} 