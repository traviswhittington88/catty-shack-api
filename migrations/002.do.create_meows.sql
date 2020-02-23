CREATE TABLE meows (
    userHandle TEXT NOT NULL,
    body TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    likeCount INTEGER DEFAULT 0 NOT NULL,
    commentCount INTEGER DEFAULT 0 NOT NULL
);