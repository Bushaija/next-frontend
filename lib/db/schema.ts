import { pgTable, uuid, varchar, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { z } from 'zod';

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

// Plain Zod schemas (more compatible)
export const insertUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(255),
  province: z.string().min(1, "Province is required").max(255),
  district: z.string().min(1, "District is required").max(255),
  hospital: z.string().min(1, "Hospital is required").max(255),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CreateUserInput = z.infer<typeof insertUserSchema>;

// Registration schema with confirm password validation (for frontend forms)
export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ApiRegisterInput = z.infer<typeof insertUserSchema>; // For API calls 