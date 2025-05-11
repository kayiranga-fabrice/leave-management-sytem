// Migration: Create Supabase 'subscriptions' table (run this SQL in Supabase SQL editor)
/*
CREATE TABLE subscriptions (
    user_id uuid PRIMARY KEY REFERENCES users(id),
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    payment_status text NOT NULL
);
*/
