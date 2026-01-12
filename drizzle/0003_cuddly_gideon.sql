CREATE TABLE "system_status" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "system_status_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_name" varchar(100) NOT NULL,
	"last_successful_run" timestamp,
	"last_run_status" varchar(20),
	"last_run_error" text,
	"records_processed" integer DEFAULT 0,
	"records_failed" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_status_job_name_unique" UNIQUE("job_name")
);
--> statement-breakpoint
CREATE TABLE "user_activity_reads" (
	"user_id" varchar(64) NOT NULL,
	"activity_id" integer NOT NULL,
	"read_at" timestamp DEFAULT now(),
	CONSTRAINT "user_activity_reads_user_id_activity_id_pk" PRIMARY KEY("user_id","activity_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "settings" jsonb;--> statement-breakpoint
ALTER TABLE "user_activity_reads" ADD CONSTRAINT "user_activity_reads_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "system_status_job_name_idx" ON "system_status" USING btree ("job_name");--> statement-breakpoint
CREATE INDEX "bills_status_created_at_idx" ON "bills" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "bills_status_idx" ON "bills" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bills_category_idx" ON "bills" USING btree ("category");--> statement-breakpoint
CREATE INDEX "bills_created_at_idx" ON "bills" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bills_title_idx" ON "bills" USING btree ("title");--> statement-breakpoint
CREATE INDEX "mps_is_active_party_idx" ON "mps" USING btree ("is_active","party");--> statement-breakpoint
CREATE INDEX "mps_party_idx" ON "mps" USING btree ("party");--> statement-breakpoint
CREATE INDEX "mps_name_idx" ON "mps" USING btree ("name");--> statement-breakpoint
CREATE INDEX "votes_mp_id_voted_at_idx" ON "votes" USING btree ("mp_id","voted_at");--> statement-breakpoint
CREATE INDEX "votes_bill_id_voted_at_idx" ON "votes" USING btree ("bill_id","voted_at");--> statement-breakpoint
CREATE INDEX "votes_mp_id_idx" ON "votes" USING btree ("mp_id");--> statement-breakpoint
CREATE INDEX "votes_bill_id_idx" ON "votes" USING btree ("bill_id");--> statement-breakpoint
CREATE INDEX "votes_voted_at_idx" ON "votes" USING btree ("voted_at");