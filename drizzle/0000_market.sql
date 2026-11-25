CREATE TABLE quotes (day TEXT NOT NULL, id TEXT NOT NULL, source TEXT NOT NULL, category TEXT NOT NULL, model TEXT NOT NULL, observed_at TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(day,id));
--> statement-breakpoint
CREATE INDEX quotes_lookup ON quotes(model,category,day);
--> statement-breakpoint
CREATE TABLE crawl_runs (id TEXT PRIMARY KEY NOT NULL, started_at TEXT NOT NULL, finished_at TEXT, status TEXT NOT NULL, data TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE leases (key TEXT PRIMARY KEY NOT NULL, until_ms INTEGER NOT NULL);
