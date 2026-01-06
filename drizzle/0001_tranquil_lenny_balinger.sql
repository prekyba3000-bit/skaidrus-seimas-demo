CREATE TABLE "session_mp_votes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "session_mp_votes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_vote_id" integer NOT NULL,
	"mp_id" integer NOT NULL,
	"seimas_mp_id" varchar(50) NOT NULL,
	"vote_value" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_votes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "session_votes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"seimas_vote_id" varchar(50) NOT NULL,
	"sitting_id" varchar(50) NOT NULL,
	"session_id" varchar(50) NOT NULL,
	"question" text NOT NULL,
	"vote_date" timestamp NOT NULL,
	"vote_time" varchar(20),
	"voted_for" integer DEFAULT 0,
	"voted_against" integer DEFAULT 0,
	"abstained" integer DEFAULT 0,
	"total_voted" integer DEFAULT 0,
	"comment" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "session_votes_seimas_vote_id_unique" UNIQUE("seimas_vote_id")
);
--> statement-breakpoint
ALTER TABLE "session_mp_votes" ADD CONSTRAINT "session_mp_votes_session_vote_id_session_votes_id_fk" FOREIGN KEY ("session_vote_id") REFERENCES "public"."session_votes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_mp_votes" ADD CONSTRAINT "session_mp_votes_mp_id_mps_id_fk" FOREIGN KEY ("mp_id") REFERENCES "public"."mps"("id") ON DELETE no action ON UPDATE no action;