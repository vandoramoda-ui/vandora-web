-- Create newsletter_subscribers table if it doesn't exist
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (for the popup)
CREATE POLICY "Enable insert for everyone" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

-- Allow admins to view
CREATE POLICY "Enable select for admins" ON newsletter_subscribers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'superadmin')
        )
    );
