CREATE TABLE "open_houses" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"image_url" text,
	"street_number" text NOT NULL,
	"street_name" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"scheduled_date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"host_agent_id" integer,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "open_houses" ADD CONSTRAINT "open_houses_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "open_houses" ADD CONSTRAINT "open_houses_host_agent_id_agents_id_fk" FOREIGN KEY ("host_agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;