import { z } from "zod";
import { HEALTH_CENTER_ACTIVITIES } from '@/constants/hiv-data/healthCenterActivities';
import { HOSPITAL_ACTIVITIES } from '@/constants/hiv-data/hospitalActivities';

export const activitySchema = z.object({
  id: z.string().optional(),
  activityCategory: z.string(),
  typeOfActivity: z.string(),
  activity: z.string().optional(),
  frequency: z.number().min(1, "Frequency is required"),
  unitCost: z.number().min(1, "Unit cost is required"),
  countQ1: z.number().optional().default(0),
  countQ2: z.number().optional().default(0),
  countQ3: z.number().optional().default(0),
  countQ4: z.number().optional().default(0),
  amountQ1: z.number().optional(),
  amountQ2: z.number().optional(),
  amountQ3: z.number().optional(),
  amountQ4: z.number().optional(),
  totalBudget: z.number().optional(), 
  comment: z.string().optional(),
});

export const planSchema = z.object({
  activities: z.array(activitySchema)
});

export type Activity = z.infer<typeof activitySchema>;
export type Plan = z.infer<typeof planSchema>;

export type ActivityEntry = {
  activity: string;
  typeOfActivity: string;
};

export type ActivityCategoryType = {
  [categoryName: string]: ActivityEntry[];
};

// Export both activity categories for use
export const ACTIVITY_CATEGORIES = HEALTH_CENTER_ACTIVITIES;

// Helper to create a skeleton activity
export const createEmptyActivity = (
  activityCategory: string,
  typeOfActivity: string,
  activity?: string
): Activity => ({
  activityCategory,
  typeOfActivity,
  activity: activity || "",
  frequency: 0,
  unitCost: 0,
  countQ1: 0,
  countQ2: 0,
  countQ3: 0,
  countQ4: 0,
  amountQ1: 0,
  amountQ2: 0,
  amountQ3: 0,
  amountQ4: 0,
  totalBudget: 0,
  comment: "",
});

// Calculate amount for a quarter
export const calculateQuarterAmount = (
  frequency: number,
  unitCost: number,
  count: number
): number => {
  return frequency * unitCost * count;
};

// Calculate total budget for an activity
export const calculateTotalBudget = (activity: Activity): number => {
  const amountQ1 = calculateQuarterAmount(
    activity.frequency,
    activity.unitCost,
    activity.countQ1 || 0
  );
  const amountQ2 = calculateQuarterAmount(
    activity.frequency,
    activity.unitCost,
    activity.countQ2 || 0
  );
  const amountQ3 = calculateQuarterAmount(
    activity.frequency,
    activity.unitCost,
    activity.countQ3 || 0
  );
  const amountQ4 = calculateQuarterAmount(
    activity.frequency,
    activity.unitCost,
    activity.countQ4 || 0
  );

  return amountQ1 + amountQ2 + amountQ3 + amountQ4;
};

// Generate default activities for a new plan
export const generateDefaultActivities = (isHospital = false): Activity[] => {
  const activities: Activity[] = [];
  const categoriesSource = isHospital ? HOSPITAL_ACTIVITIES : HEALTH_CENTER_ACTIVITIES;

  Object.entries(categoriesSource).forEach(([category, entries]) => {
    entries.forEach(entry => {
      activities.push(createEmptyActivity(
        category, 
        entry.typeOfActivity,
        entry.activity
      ));
    });
  });

  return activities;
}; 