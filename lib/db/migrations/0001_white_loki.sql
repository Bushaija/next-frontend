CREATE TYPE "public"."execution_status" AS ENUM('active', 'completed', 'paused', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('receipt', 'expenditure');--> statement-breakpoint
CREATE TABLE "execution_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"planned_count_q1" integer DEFAULT 0 NOT NULL,
	"planned_count_q2" integer DEFAULT 0 NOT NULL,
	"planned_count_q3" integer DEFAULT 0 NOT NULL,
	"planned_count_q4" integer DEFAULT 0 NOT NULL,
	"planned_amount_q1" numeric(12, 2) DEFAULT '0' NOT NULL,
	"planned_amount_q2" numeric(12, 2) DEFAULT '0' NOT NULL,
	"planned_amount_q3" numeric(12, 2) DEFAULT '0' NOT NULL,
	"planned_amount_q4" numeric(12, 2) DEFAULT '0' NOT NULL,
	"planned_total_budget" numeric(12, 2) DEFAULT '0' NOT NULL,
	"actual_count_q1" integer DEFAULT 0 NOT NULL,
	"actual_count_q2" integer DEFAULT 0 NOT NULL,
	"actual_count_q3" integer DEFAULT 0 NOT NULL,
	"actual_count_q4" integer DEFAULT 0 NOT NULL,
	"actual_amount_q1" numeric(12, 2) DEFAULT '0' NOT NULL,
	"actual_amount_q2" numeric(12, 2) DEFAULT '0' NOT NULL,
	"actual_amount_q3" numeric(12, 2) DEFAULT '0' NOT NULL,
	"actual_amount_q4" numeric(12, 2) DEFAULT '0' NOT NULL,
	"actual_total_spent" numeric(12, 2) DEFAULT '0' NOT NULL,
	"variance_q1" numeric(12, 2) DEFAULT '0' NOT NULL,
	"variance_q2" numeric(12, 2) DEFAULT '0' NOT NULL,
	"variance_q3" numeric(12, 2) DEFAULT '0' NOT NULL,
	"variance_q4" numeric(12, 2) DEFAULT '0' NOT NULL,
	"variance_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"progress" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" varchar(255) NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" "execution_status" DEFAULT 'active' NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"progress" integer DEFAULT 0,
	"total_budget" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_spent" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_received" numeric(15, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "executions_execution_id_unique" UNIQUE("execution_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" varchar(255) NOT NULL,
	"execution_id" uuid NOT NULL,
	"execution_activity_id" uuid,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"quarter" varchar(10) NOT NULL,
	"description" text NOT NULL,
	"reference" varchar(255),
	"vendor" varchar(255),
	"category" varchar(255),
	"date_transacted" timestamp NOT NULL,
	"approved_by" varchar(255),
	"approved_at" timestamp,
	"recorded_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "transactions_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
ALTER TABLE "execution_activities" ADD CONSTRAINT "execution_activities_execution_id_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_activities" ADD CONSTRAINT "execution_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_execution_id_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_execution_activity_id_execution_activities_id_fk" FOREIGN KEY ("execution_activity_id") REFERENCES "public"."execution_activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "execution_id_idx" ON "executions" USING btree ("execution_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transaction_id_idx" ON "transactions" USING btree ("transaction_id");