'use client';

import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { formatCurrency } from '../../utils';
import { Activity } from '../../schema/hiv/schemas';

interface PlanGeneralTotalRowProps {
  activities: Activity[];
}

export function PlanGeneralTotalRow({ activities }: PlanGeneralTotalRowProps) {
  // Calculate quarter totals
  const totalQ1 = activities.reduce((sum, activity) => sum + (activity.amountQ1 || 0), 0);
  const totalQ2 = activities.reduce((sum, activity) => sum + (activity.amountQ2 || 0), 0);
  const totalQ3 = activities.reduce((sum, activity) => sum + (activity.amountQ3 || 0), 0);
  const totalQ4 = activities.reduce((sum, activity) => sum + (activity.amountQ4 || 0), 0);
  
  // Calculate grand total
  const grandTotal = totalQ1 + totalQ2 + totalQ3 + totalQ4;
  
  return (
    <TableRow className="bg-primary/10 font-bold">
      <TableCell colSpan={8} className="text-right sticky left-0 z-10 bg-primary/10">
        General Total
      </TableCell>
      <TableCell>
        {formatCurrency(totalQ1)}
      </TableCell>
      <TableCell>
        {formatCurrency(totalQ2)}
      </TableCell>
      <TableCell>
        {formatCurrency(totalQ3)}
      </TableCell>
      <TableCell>
        {formatCurrency(totalQ4)}
      </TableCell>
      <TableCell>
        {formatCurrency(grandTotal)}
      </TableCell>
      <TableCell>
        (Must match annual allocations)
      </TableCell>
    </TableRow>
  );
} 