CREATE TABLE catshack_users (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  user_name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  user_image TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  date_created TIMESTAMP DEFAULT now() NOT NULL
  --date_modified TIMESTAMP
);