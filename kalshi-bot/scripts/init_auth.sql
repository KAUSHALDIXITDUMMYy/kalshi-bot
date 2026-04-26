-- Create users table for Administrative Suite
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'operator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default dev user (password is 'kalshi_pro_2026' hashed or plain for now, 
-- but let's use a placeholder and tell the user)
INSERT INTO admin_users (email, password_hash, role)
VALUES ('dev@kalshi-cmd.pro', 'pbkdf2:sha256:kalshi_pro_2026', 'admin')
ON CONFLICT (email) DO NOTHING;
