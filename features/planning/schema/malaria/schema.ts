import { z } from "zod";
import { MALARIA_ACTIVITIES } from "@/constants/malaria-data/malaria-activities";

export const activitySchema = z.object({
    id: z.string().optional(),
    activity: z.string(),
    activityDescription: z.string(),
    quantity: z.number(),
    frequency: z.number().min(1, "frequency is required"),
    unitCost: z.number().min(1, "unit cost is required"),
    amountQ1: z.number(),
    amountQ2: z.number(),
    amountQ3: z.number(),
    amountQ4: z.number(),
    annualBudget: z.number().optional(),
    comment: z.string().optional()
});

export const planSchema = z.object({
    activities: z.array(activitySchema)
});

export type Activity = z.infer<typeof activitySchema>;
export type Plan = z.infer<typeof planSchema>;

export type ActivityEntry = {
    activity: string;
    activityDescription: string;
};

// skipped ActivityCategoryType

export const ACTIVITY_CATEGORIES = MALARIA_ACTIVITIES;

export const createEmptyActivity = (
    entry: ActivityEntry,
): Activity => ({
    activity: entry.activity,
    activityDescription: entry.activityDescription,
    quantity: 0,
    frequency: 0,
    unitCost: 0,
    amountQ1: 0,
    amountQ2: 0,
    amountQ3: 0,
    amountQ4: 0,
    annualBudget: 0,
    comment: ""
});

// calculate amount for a quarter
export const calculateQuarterAmount = (
    quantity: number,
    frequency: number,
    unitCost: number,
): number => {
    return quantity * frequency * unitCost;
};

// calculate total budget for an activity
export const calculateTotalBudget = (activity: Activity): number => {
    const amountQ1 = calculateQuarterAmount(
        activity.quantity,
        activity.frequency,
        activity.unitCost
    );
    const amountQ2 = calculateQuarterAmount(
        activity.frequency,
        activity.quantity,
        activity.unitCost
    );
    const amountQ3 = calculateQuarterAmount(
        activity.quantity,
        activity.frequency,
        activity.unitCost
    );
    const amountQ4 = calculateQuarterAmount(
        activity.quantity,
        activity.frequency,
        activity.unitCost
    )

    return amountQ1 + amountQ2 + amountQ3 + amountQ4;
};


// generate default activities for a new plan
export const generateDefaultActivities = (isHospital = false): Activity[] => {
    const activities: Activity[] = [];
    const categoriesSource = isHospital ? MALARIA_ACTIVITIES : MALARIA_ACTIVITIES;

    categoriesSource.forEach((entry) => {
        activities.push(createEmptyActivity(entry))
    });

    return activities;
};