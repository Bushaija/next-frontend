import { pgTable, uuid, varchar, timestamp, boolean, uniqueIndex, text, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

// Enums
export const planStatusEnum = pgEnum('plan_status', ['draft', 'pending', 'approved', 'rejected']);
export const facilityTypeEnum = pgEnum('facility_type', ['Hospital', 'Health Center', 'District Hospital']);
export const programEnum = pgEnum('program', ['HIV', 'Malaria', 'TB', 'Other']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  province: varchar('province', { length: 255 }).notNull(),
  district: varchar('district', { length: 255 }).notNull(),
  hospital: varchar('hospital', { length: 255 }).notNull(),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('email_idx').on(table.email),
}));

// Plans table
export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: varchar('plan_id', { length: 255 }).notNull().unique(), // Human-readable ID like "plan-2024-001"
  facilityName: varchar('facility_name', { length: 255 }).notNull(),
  facilityType: facilityTypeEnum('facility_type').notNull(),
  district: varchar('district', { length: 255 }).notNull(),
  province: varchar('province', { length: 255 }).notNull(),
  period: varchar('period', { length: 255 }).notNull(), // e.g., "FY 2024", "2023-2024"
  program: programEnum('program').notNull(),
  isHospital: boolean('is_hospital').default(false),
  generalTotalBudget: decimal('general_total_budget', { precision: 15, scale: 2 }).notNull().default('0'),
  status: planStatusEnum('status').notNull().default('draft'),
  createdBy: varchar('created_by', { length: 255 }), // User name who created the plan
  submittedBy: varchar('submitted_by', { length: 255 }), // User name who submitted the plan
  submittedAt: timestamp('submitted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  planIdIdx: uniqueIndex('plan_id_idx').on(table.planId),
}));

// Activities table
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  activityCategory: varchar('activity_category', { length: 255 }).notNull(),
  typeOfActivity: varchar('type_of_activity', { length: 255 }).notNull(),
  activity: text('activity'), // Longer text field for activity description
  frequency: integer('frequency').notNull().default(1),
  unitCost: decimal('unit_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  countQ1: integer('count_q1').notNull().default(0),
  countQ2: integer('count_q2').notNull().default(0),
  countQ3: integer('count_q3').notNull().default(0),
  countQ4: integer('count_q4').notNull().default(0),
  amountQ1: decimal('amount_q1', { precision: 12, scale: 2 }).notNull().default('0'),
  amountQ2: decimal('amount_q2', { precision: 12, scale: 2 }).notNull().default('0'),
  amountQ3: decimal('amount_q3', { precision: 12, scale: 2 }).notNull().default('0'),
  amountQ4: decimal('amount_q4', { precision: 12, scale: 2 }).notNull().default('0'),
  totalBudget: decimal('total_budget', { precision: 12, scale: 2 }).notNull().default('0'),
  comment: text('comment'),
  sortOrder: integer('sort_order').default(0), // For maintaining activity order
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Plan status history table (for audit trail)
export const planStatusHistory = pgTable('plan_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  previousStatus: planStatusEnum('previous_status'),
  newStatus: planStatusEnum('new_status').notNull(),
  comment: text('comment'),
  reviewedBy: varchar('reviewed_by', { length: 255 }), // User name who made the status change
  description: text('description'), // Auto-generated description of the transition
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const plansRelations = relations(plans, ({ many }) => ({
  activities: many(activities),
  statusHistory: many(planStatusHistory),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  plan: one(plans, {
    fields: [activities.planId],
    references: [plans.id],
  }),
}));

export const planStatusHistoryRelations = relations(planStatusHistory, ({ one }) => ({
  plan: one(plans, {
    fields: [planStatusHistory.planId],
    references: [plans.id],
  }),
}));

// Plain Zod schemas (more compatible)
export const insertUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(255),
  province: z.string().min(1, "Province is required").max(255),
  district: z.string().min(1, "District is required").max(255),
  hospital: z.string().min(1, "Hospital is required").max(255),
});

// Activity Planning Schemas
export const insertActivitySchema = z.object({
  activityCategory: z.string().min(1, "Activity category is required"),
  typeOfActivity: z.string().min(1, "Type of activity is required"),
  activity: z.string().optional(),
  frequency: z.number().min(1, "Frequency must be at least 1"),
  unitCost: z.number().min(0.01, "Unit cost must be greater than 0"),
  countQ1: z.number().min(0, "Count Q1 cannot be negative").default(0),
  countQ2: z.number().min(0, "Count Q2 cannot be negative").default(0),
  countQ3: z.number().min(0, "Count Q3 cannot be negative").default(0),
  countQ4: z.number().min(0, "Count Q4 cannot be negative").default(0),
  comment: z.string().optional(),
  sortOrder: z.number().optional().default(0),
});

export const insertPlanSchema = z.object({
  facilityName: z.string().min(1, "Facility name is required"),
  facilityType: z.enum(['Hospital', 'Health Center', 'District Hospital']),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  period: z.string().min(1, "Period is required"),
  program: z.enum(['HIV', 'Malaria', 'TB', 'Other']),
  isHospital: z.boolean().default(false),
  createdBy: z.string().optional(),
  submittedBy: z.string().optional(),
  activities: z.array(insertActivitySchema).min(1, "At least one activity is required"),
});

export const updatePlanStatusSchema = z.object({
  status: z.enum(['draft', 'pending', 'approved', 'rejected']),
  comment: z.string().optional(),
  reviewedBy: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CreateUserInput = z.infer<typeof insertUserSchema>;

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type CreatePlanInput = z.infer<typeof insertPlanSchema>;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type CreateActivityInput = z.infer<typeof insertActivitySchema>;

export type PlanStatusHistory = typeof planStatusHistory.$inferSelect;
export type NewPlanStatusHistory = typeof planStatusHistory.$inferInsert;

// Registration schema with confirm password validation (for frontend forms)
export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ApiRegisterInput = z.infer<typeof insertUserSchema>; // For API calls 