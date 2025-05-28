import { z } from "zod";

// Define the schema for budget data
export const budgetValueSchema = z.object({
  originalBudget: z.union([
    z.number(),
    z.string().refine(val => !isNaN(Number(val)), {
      message: "Must be a valid number"
    })
  ]).optional(),
  revisedBudget: z.union([
    z.number(),
    z.string().refine(val => !isNaN(Number(val)), {
      message: "Must be a valid number"
    })
  ]).optional(),
  actualBudget: z.union([
    z.number(),
    z.string().refine(val => !isNaN(Number(val)), {
      message: "Must be a valid number"
    })
  ]).optional(),
  note: z.string().optional()
});

export type BudgetValueType = z.infer<typeof budgetValueSchema>;

/**
 * Validates a budget field's value
 * @param field The field to validate
 * @param value The value to validate
 * @returns null if valid, or an error message if invalid
 */
export function validateBudgetValue(field: string, value: string | number): string | null {
  if (field === 'note') return null; // Notes don't need validation
  
  // Create a partial schema for just this field
  const fieldSchema = z.object({
    [field]: z.union([
      z.number(),
      z.string().refine(val => !isNaN(Number(val)), {
        message: "Must be a valid number"
      })
    ])
  });
  
  // Try to parse and validate
  const result = fieldSchema.safeParse({ [field]: value });
  
  if (!result.success) {
    // Extract the first error message
    const formattedError = result.error.format();
    const errorPath = field as keyof typeof formattedError;
    const errorMessage = formattedError[errorPath]?._errors?.[0];
    
    return errorMessage || "Invalid value";
  }
  
  return null;
} 