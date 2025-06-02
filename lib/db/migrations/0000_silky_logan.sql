CREATE TYPE "public"."facility_type" AS ENUM('Hospital', 'Health Center', 'District Hospital');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('draft', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."program" AS ENUM('HIV', 'Malaria', 'TB', 'Other');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"activity_category" varchar(255) NOT NULL,
	"type_of_activity" varchar(255) NOT NULL,
	"activity" text,
	"frequency" integer DEFAULT 1 NOT NULL,
	"unit_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"count_q1" integer DEFAULT 0 NOT NULL,
	"count_q2" integer DEFAULT 0 NOT NULL,
	"count_q3" integer DEFAULT 0 NOT NULL,
	"count_q4" integer DEFAULT 0 NOT NULL,
	"amount_q1" numeric(12, 2) DEFAULT '0' NOT NULL,
	"amount_q2" numeric(12, 2) DEFAULT '0' NOT NULL,
	"amount_q3" numeric(12, 2) DEFAULT '0' NOT NULL,
	"amount_q4" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_budget" numeric(12, 2) DEFAULT '0' NOT NULL,
	"comment" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plan_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"previous_status" "plan_status",
	"new_status" "plan_status" NOT NULL,
	"comment" text,
	"reviewed_by" varchar(255),
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" varchar(255) NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"facility_type" "facility_type" NOT NULL,
	"district" varchar(255) NOT NULL,
	"province" varchar(255) NOT NULL,
	"period" varchar(255) NOT NULL,
	"program" "program" NOT NULL,
	"is_hospital" boolean DEFAULT false,
	"general_total_budget" numeric(15, 2) DEFAULT '0' NOT NULL,
	"status" "plan_status" DEFAULT 'draft' NOT NULL,
	"created_by" varchar(255),
	"submitted_by" varchar(255),
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "plans_plan_id_unique" UNIQUE("plan_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"province" varchar(255) NOT NULL,
	"district" varchar(255) NOT NULL,
	"hospital" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_status_history" ADD CONSTRAINT "plan_status_history_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "plan_id_idx" ON "plans" USING btree ("plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");