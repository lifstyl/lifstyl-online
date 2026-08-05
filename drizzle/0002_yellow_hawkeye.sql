ALTER TABLE "agents" DROP CONSTRAINT "agents_name_unique";--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "phone_lookup" text NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "is_manager" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_phone_lookup_unique" UNIQUE("phone_lookup");