import React, { memo } from "react";
import { cn } from "@/lib/utils";

export interface NetAssetsSummaryRowProps {
  label: string;
  surplus: string | number;
  adjustments: string | number;
  total: string | number;
  isHighlighted?: boolean;
  className?: string;
}

export const NetAssetsSummaryRow = memo(function NetAssetsSummaryRow({
  label,
  surplus,
  adjustments,
  total,
  isHighlighted = false,
  className
}: NetAssetsSummaryRowProps) {
  // Format numbers for display
  const formatNumber = (value: string | number) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toLocaleString();
  };
  
  return (
    <tr className={cn(
      "summary-row",
      isHighlighted ? "bg-muted/50 font-bold border-t-2 border-b-2 border-muted" : "",
      className
    )}>
      <td className="py-3 px-4 border-b font-bold">
        {label}
      </td>
      <td className="py-3 px-4 border-b text-right font-bold">
        {formatNumber(surplus)}
      </td>
      <td className="py-3 px-4 border-b text-right font-bold">
        {formatNumber(adjustments)}
      </td>
      <td className="py-3 px-4 border-b text-right font-bold">
        {formatNumber(total)}
      </td>
    </tr>
  );
}); 