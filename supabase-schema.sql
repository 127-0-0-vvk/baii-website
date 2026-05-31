-- ============================================================
-- BAII Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text default 'student' check (role in ('admin', 'student')),
  phone text,
  school text,
  city text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
drop policy if exists "Admins can read all profiles" on profiles;
create policy "Admins can read all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
drop policy if exists "Admins can insert profiles" on profiles;
create policy "Admins can insert profiles" on profiles for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
drop policy if exists "Admins can update profiles" on profiles;
create policy "Admins can update profiles" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Courses
create table if not exists courses (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  title text not null,
  track text not null check (track in ('energy', 'semiconductor')),
  description text,
  prerequisite_code text,
  order_index integer default 0,
  duration text,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table courses enable row level security;
drop policy if exists "Anyone can read courses" on courses;
create policy "Anyone can read courses" on courses for select using (true);
drop policy if exists "Admins can manage courses" on courses;
create policy "Admins can manage courses" on courses for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Seed courses
insert into courses (code, title, track, description, prerequisite_code, order_index, duration) values
  ('ETF',  'Energy Foundation',           'energy',        'Core fundamentals of energy science — the mandatory starting point for all energy tracks.', null,  0, '6 weeks'),
  ('ET01', 'Solar & Storage',             'energy',        'Solar PV systems, battery management, energy audit, smart meter with IoT dashboard.',         'ETF', 1, '3-4 months'),
  ('ET02', 'Wind Systems',                'energy',        'Turbine mechanics, power curves, blade aerodynamics, site assessment, GWO safety framework.',  'ETF', 2, '3-4 months'),
  ('ET03', 'Hydrogen & Fuel Cells',       'energy',        'Green hydrogen electrolysis, PEM fuel cells, hydrogen storage and safety protocols.',           'ETF', 3, '3-4 months'),
  ('ET04', 'Grid Integration & Smart Energy', 'energy',   'Smart grids, microgrids, SCADA, demand response, V2G, virtual power plants.',                   'ETF', 4, '3-4 months'),
  ('ET05', 'Energy Materials Science',    'energy',        'Perovskite solar cells, solid-state batteries, thermoelectrics — the materials of clean energy.','ETF', 5, '3-4 months'),
  ('SCF',  'Semiconductor Foundation',    'semiconductor', 'Core fundamentals of semiconductor physics — mandatory before all SC tracks.',                   null,  0, '6 weeks'),
  ('SC01', 'Chip Design Fundamentals',    'semiconductor', 'VLSI basics, digital logic, CMOS, open-source EDA tools (OpenROAD, Magic VLSI).',               'SCF', 1, '3-4 months'),
  ('SC02', 'Power Semiconductors',        'semiconductor', 'MOSFETs, IGBTs, SiC and GaN — the chips inside every solar inverter, EV, and wind turbine.',    'SCF', 2, '3-4 months'),
  ('SC03', 'Sensors & MEMS',              'semiconductor', 'Pressure/temperature sensors, MEMS accelerometers, IoT integration layer.',                      'SCF', 3, '3-4 months')
on conflict (code) do nothing;

-- Cohorts
create table if not exists cohorts (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references courses(id),
  name text not null,
  start_date date,
  end_date date,
  max_students integer default 30,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table cohorts enable row level security;
drop policy if exists "Anyone can read cohorts" on cohorts;
create policy "Anyone can read cohorts" on cohorts for select using (true);
drop policy if exists "Admins can manage cohorts" on cohorts;
create policy "Admins can manage cohorts" on cohorts for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Student–cohort assignments
create table if not exists student_cohorts (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) on delete cascade,
  cohort_id uuid references cohorts(id) on delete cascade,
  enrolled_at timestamptz default now(),
  unique(student_id, cohort_id)
);
alter table student_cohorts enable row level security;
drop policy if exists "Students can read own cohorts" on student_cohorts;
create policy "Students can read own cohorts" on student_cohorts for select using (student_id = auth.uid());
drop policy if exists "Admins can manage all" on student_cohorts;
create policy "Admins can manage all" on student_cohorts for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Landing page enrollment requests (pre-signup interest)
create table if not exists enrollment_requests (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  phone text not null,
  school text not null,
  city text not null,
  course_code text not null,
  finished_foundation boolean,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);
alter table enrollment_requests enable row level security;
drop policy if exists "Anyone can insert enrollment request" on enrollment_requests;
create policy "Anyone can insert enrollment request" on enrollment_requests for insert with check (true);
drop policy if exists "Admins can read all enrollment requests" on enrollment_requests;
create policy "Admins can read all enrollment requests" on enrollment_requests for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
drop policy if exists "Admins can update enrollment requests" on enrollment_requests;
create policy "Admins can update enrollment requests" on enrollment_requests for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
