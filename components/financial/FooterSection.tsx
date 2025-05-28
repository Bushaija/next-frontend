import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { z } from "zod";

// Zod schema for validation
export const FooterSectionSchema = z.object({
  children: z.any(),
  className: z.string().optional(),
});

// Type derived from Zod schema
export type FooterSectionProps = {
  children: ReactNode;
  className?: string;
};

// This component is now a tr with a special style that acts as a visual separator
// before footer content, avoiding nested tbody issues
export function FooterSection({ children, className }: FooterSectionProps) {
  return (
    <>
      <tr className="h-6 border-t-0">
        <td colSpan={4} className="p-0">
          <div className="h-px w-full border-t-2 border-primary/30" />
        </td>
      </tr>
      {children}
    </>
  );
} 