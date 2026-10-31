-- Profile pictures stored in Postgres (replaces Replit App Storage).
CREATE TABLE IF NOT EXISTS profile_avatars (
  id text PRIMARY KEY,
  owner text NOT NULL,
  content_type text NOT NULL,
  size integer NOT NULL,
  data bytea NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
