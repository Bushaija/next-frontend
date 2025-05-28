import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ColumnDefinition {
  key: string;
  label: string;
  editable?: boolean;
  className?: string;
}

export interface DynamicFinancialTableProps {
  columns: ColumnDefinition[];
  caption?: string;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
  renderHeader?: (columns: ColumnDefinition[]) => ReactNode;
}

export function DynamicFinancialTable({
  columns,
  caption,
  ariaLabel,
  className,
  children,
  renderHeader
}: DynamicFinancialTableProps) {
  return (
    <div className="overflow-x-auto">
      <table 
        className={cn("w-full border-collapse", className)}
        aria-label={ariaLabel}
      >
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        
        <thead>
          {renderHeader ? (
            renderHeader(columns)
          ) : (
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={cn(
                    "py-3 px-4 text-left bg-muted font-medium text-muted-foreground",
                    column.className
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          )}
        </thead>
        
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}

export interface DynamicSectionGroupProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

export function DynamicSectionGroup({
  title,
  className,
  children
}: DynamicSectionGroupProps) {
  return (
    <>
      {title && (
        <tr className={cn("section-header", className)}>
          <th 
            colSpan={100} 
            className="py-3 px-4 text-left bg-muted/50 font-semibold"
          >
            {title}
          </th>
        </tr>
      )}
      {children}
    </>
  );
}

export interface DynamicSubsectionGroupProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

export function DynamicSubsectionGroup({
  title,
  className,
  children
}: DynamicSubsectionGroupProps) {
  return (
    <>
      {title && (
        <tr className={cn("subsection-header", className)}>
          <th 
            colSpan={100} 
            className="py-2 px-4 text-left bg-muted/20 font-medium"
          >
            {title}
          </th>
        </tr>
      )}
      {children}
    </>
  );
}

export function SeparatorRow() {
  return (
    <tr className="separator-row">
      <td colSpan={100} className="h-1"></td>
    </tr>
  );
} 