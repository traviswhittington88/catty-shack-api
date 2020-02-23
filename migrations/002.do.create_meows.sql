CREATE TABLE meows (
    meow_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    userHandle TEXT NOT NULL,
    body TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    likeCount INTEGER DEFAULT 0 NOT NULL,
    commentCount INTEGER DEFAULT 0 NOT NULL
);