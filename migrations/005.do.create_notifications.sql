CREATE TABLE notifications (
    recipient TEXT,
    sender TEXT,
    read BOOLEAN DEFAULT false,
    meow_id INTEGER,
    type TEXT,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);