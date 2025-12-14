-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Complaints Table (Presets)
create table complaints (
  id uuid default uuid_generate_v4() primary key,
  description text not null,
  default_price numeric(10, 2) not null default 0
);

-- Orders Table
create type order_status as enum ('submitted', 'received', 'completed', 'departure', 'in_store');

create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  whatsapp_number text not null,
  shoe_model text not null,
  serial_number text,
  custom_complaint text,
  is_price_unknown boolean default false,
  total_price numeric(10, 2) default 0,
  status order_status default 'submitted',
  expected_return_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Link Table (Many-to-Many for presets)
create table order_complaints (
  order_id uuid references orders(id) on delete cascade,
  complaint_id uuid references complaints(id) on delete cascade,
  primary key (order_id, complaint_id)
);

-- Insert some dummy data for complaints
insert into complaints (description, default_price) values
('Heel Replacement', 450),
('Sole Pasting', 250),
('Full Polish', 150),
('Stitching', 100),
('Patch Work', 300);
