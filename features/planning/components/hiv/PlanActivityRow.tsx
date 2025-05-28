'use client';

import React, { useEffect } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Activity, calculateQuarterAmount, calculateTotalBudget } from '../../schema/hiv/schemas';
import { formatCurrency } from '../../utils';
import { UseFormReturn } from 'react-hook-form';

interface PlanActivityRowProps {
  activity: Activity;
  index: number;
  form: UseFormReturn<any>;
  isSubCategory: boolean;
}

export function PlanActivityRow({ activity, index, form, isSubCategory }: PlanActivityRowProps) {
  const { watch, setValue } = form;
  
  // For category rows with special index -1, we don't need to watch or update
  const isReadOnly = index === -1;
  
  // Watch for changes to recalculate derived values
  const frequency = isReadOnly ? 0 : watch(`activities.${index}.frequency`);
  const unitCost = isReadOnly ? 0 : watch(`activities.${index}.unitCost`);
  const countQ1 = isReadOnly ? 0 : watch(`activities.${index}.countQ1`);
  const countQ2 = isReadOnly ? 0 : watch(`activities.${index}.countQ2`);
  const countQ3 = isReadOnly ? 0 : watch(`activities.${index}.countQ3`);
  const countQ4 = isReadOnly ? 0 : watch(`activities.${index}.countQ4`);
  
  // Update calculated fields when inputs change
  useEffect(() => {
    // Skip updates for category rows
    if (isReadOnly) return;
    
    const amountQ1 = calculateQuarterAmount(frequency || 0, unitCost || 0, countQ1 || 0);
    const amountQ2 = calculateQuarterAmount(frequency || 0, unitCost || 0, countQ2 || 0);
    const amountQ3 = calculateQuarterAmount(frequency || 0, unitCost || 0, countQ3 || 0);
    const amountQ4 = calculateQuarterAmount(frequency || 0, unitCost || 0, countQ4 || 0);
    
    setValue(`activities.${index}.amountQ1`, amountQ1);
    setValue(`activities.${index}.amountQ2`, amountQ2);
    setValue(`activities.${index}.amountQ3`, amountQ3);
    setValue(`activities.${index}.amountQ4`, amountQ4);
    
    const totalBudget = amountQ1 + amountQ2 + amountQ3 + amountQ4;
    setValue(`activities.${index}.totalBudget`, totalBudget);
  }, [frequency, unitCost, countQ1, countQ2, countQ3, countQ4, setValue, index, isReadOnly]);
  
  return (
    <TableRow className={isSubCategory ? "bg-muted/20" : "bg-muted/50 font-semibold"}>
      <TableCell className="w-[160px] sticky left-0 z-10" style={{ backgroundColor: isSubCategory ? 'rgba(240, 240, 243, 0.2)' : 'rgba(240, 240, 243, 0.5)' }}>
        {!isSubCategory && activity.activityCategory}
      </TableCell>
      <TableCell className="w-[200px]">
        {isSubCategory && (
          <div className="space-y-1">
            <div className="font-medium">{activity.typeOfActivity}</div>
            <div className="text-xs text-gray-500">{activity.activity}</div>
          </div>
        )}
      </TableCell>
      <TableCell className="w-[80px]">
        {isSubCategory ? (
          <Input
            type="number"
            min="0"
            className="w-full"
            {...form.register(`activities.${index}.frequency`, { 
              valueAsNumber: true,
              required: isSubCategory 
            })}
          />
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="w-[80px]">
        {isSubCategory ? (
          <Input
            type="number"
            min="0"
            className="w-full"
            {...form.register(`activities.${index}.unitCost`, { 
              valueAsNumber: true,
              required: isSubCategory 
            })}
          />
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="w-[80px]">
        {isSubCategory ? (
          <Input
            type="number"
            min="0"
            className="w-full"
            {...form.register(`activities.${index}.countQ1`, { valueAsNumber: true })}
          />
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="w-[80px]">
        {isSubCategory ? (
          <Input
            type="number"
            min="0"
            className="w-full"
            {...form.register(`activities.${index}.countQ2`, { valueAsNumber: true })}
          />
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="w-[80px]">
        {isSubCategory ? (
          <Input
            type="number"
            min="0"
            className="w-full"
            {...form.register(`activities.${index}.countQ3`, { valueAsNumber: true })}
          />
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="w-[80px]">
        {isSubCategory ? (
          <Input
            type="number"
            min="0"
            className="w-full"
            {...form.register(`activities.${index}.countQ4`, { valueAsNumber: true })}
          />
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="w-[80px]">
        {isReadOnly ? formatCurrency(activity.amountQ1) : 
          formatCurrency(watch(`activities.${index}.amountQ1`))}
      </TableCell>
      <TableCell className="w-[80px]">
        {isReadOnly ? formatCurrency(activity.amountQ2) : 
          formatCurrency(watch(`activities.${index}.amountQ2`))}
      </TableCell>
      <TableCell className="w-[80px]">
        {isReadOnly ? formatCurrency(activity.amountQ3) : 
          formatCurrency(watch(`activities.${index}.amountQ3`))}
      </TableCell>
      <TableCell className="w-[80px]">
        {isReadOnly ? formatCurrency(activity.amountQ4) : 
          formatCurrency(watch(`activities.${index}.amountQ4`))}
      </TableCell>
      <TableCell className="w-[100px] font-semibold">
        {isReadOnly ? formatCurrency(activity.totalBudget) : 
          formatCurrency(watch(`activities.${index}.totalBudget`))}
      </TableCell>
      <TableCell className="w-[160px]">
        {isSubCategory && (
          <Input
            type="text"
            placeholder="Add comment..."
            className="w-full"
            {...form.register(`activities.${index}.comment`)}
          />
        )}
      </TableCell>
    </TableRow>
  );
} 