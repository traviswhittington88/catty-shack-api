CREATE TABLE comments (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_name TEXT, 
    meow_id INTEGER,
    body TEXT,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    user_image TEXT
);