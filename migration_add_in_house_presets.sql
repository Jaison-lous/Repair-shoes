-- Migration to create in_house_presets table
CREATE TABLE IF NOT EXISTS in_house_presets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  description text NOT NULL,
  default_price numeric(10, 2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert dummy data for in-house presets
INSERT INTO in_house_presets (description, default_price)
SELECT 'Polishing', 50
WHERE NOT EXISTS (SELECT 1 FROM in_house_presets WHERE description = 'Polishing');

INSERT INTO in_house_presets (description, default_price)
SELECT 'Sole Cleaning', 30
WHERE NOT EXISTS (SELECT 1 FROM in_house_presets WHERE description = 'Sole Cleaning');
