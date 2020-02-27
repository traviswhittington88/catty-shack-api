CREATE TABLE comments (
    user_name TEXT, 
    meow_id INTEGER,
    body TEXT,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    user_image TEXT
);