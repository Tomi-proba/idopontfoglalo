-- Cetli — egyedi időpont-emlékeztető rendszer
-- Kezdeti séma: businesses, employees, nyitvatartás/zárvatartás,
-- szolgáltatások, ügyfelek, foglalások, emlékeztetők, várólista, értékelések.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------
create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  owner_email text not null,
  timezone text not null default 'Europe/Budapest',
  reminder_template text not null default
    'Szia {név}! Szeretettel várunk {időpont}-kor: {szolgáltatás}. Ha közbejön valami, szólj nyugodtan!',
  reminder_hours_before integer not null default 18,
  employee_count integer not null default 1 check (employee_count between 1 and 30),
  price_per_seat integer not null default 3000,
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'canceled')),
  trial_reminder_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index businesses_owner_user_id_key on businesses (owner_user_id);

-- ---------------------------------------------------------------------
-- employees — dolgozói naptárak, employee_count erejéig (app-szinten ellenőrizve)
-- ---------------------------------------------------------------------
create table employees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index employees_business_id_idx on employees (business_id);

-- ---------------------------------------------------------------------
-- business_hours — nyitvatartás cég- vagy dolgozó-szinten
-- employee_id = null  ->  céges alapértelmezett nyitvatartás
-- employee_id set     ->  az adott dolgozóra felülíró nyitvatartás
-- ---------------------------------------------------------------------
create table business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  employee_id uuid references employees (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  open_time time not null,
  close_time time not null,
  is_closed boolean not null default false,
  created_at timestamptz not null default now()
);

create index business_hours_business_id_idx on business_hours (business_id);
create index business_hours_employee_id_idx on business_hours (employee_id);

-- ---------------------------------------------------------------------
-- closures — szabadság / zárvatartás, cég- vagy dolgozó-szinten
-- ---------------------------------------------------------------------
create table closures (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  employee_id uuid references employees (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index closures_business_id_idx on closures (business_id);
create index closures_employee_id_idx on closures (employee_id);

-- ---------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------
create table services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  duration_minutes integer not null default 30,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index services_business_id_idx on services (business_id);

-- ---------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------
create table customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create index customers_business_id_idx on customers (business_id);

-- ---------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------
create table appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  employee_id uuid not null references employees (id) on delete cascade,
  customer_id uuid not null references customers (id) on delete cascade,
  service_id uuid references services (id) on delete set null,
  starts_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  confirmation_token uuid not null default gen_random_uuid(),
  confirmed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index appointments_business_id_idx on appointments (business_id);
create index appointments_employee_id_idx on appointments (employee_id);
create index appointments_customer_id_idx on appointments (customer_id);
create index appointments_starts_at_idx on appointments (starts_at);
create unique index appointments_confirmation_token_key on appointments (confirmation_token);

-- ---------------------------------------------------------------------
-- reminder_messages — elküldött/ütemezett emlékeztetők naplója
-- ---------------------------------------------------------------------
create table reminder_messages (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  rendered_message text not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed')),
  created_at timestamptz not null default now()
);

create index reminder_messages_business_id_idx on reminder_messages (business_id);
create index reminder_messages_appointment_id_idx on reminder_messages (appointment_id);
create index reminder_messages_due_idx on reminder_messages (status, scheduled_for);

-- ---------------------------------------------------------------------
-- waitlist — automatikus várólista-kitöltés
-- ---------------------------------------------------------------------
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  employee_id uuid references employees (id) on delete cascade,
  customer_id uuid not null references customers (id) on delete cascade,
  service_id uuid references services (id) on delete set null,
  status text not null default 'waiting'
    check (status in ('waiting', 'offered', 'booked', 'expired')),
  created_at timestamptz not null default now()
);

create index waitlist_business_id_idx on waitlist (business_id);

-- ---------------------------------------------------------------------
-- review_requests — értékelés-kérés + dolgozónkénti csillagozás
-- ---------------------------------------------------------------------
create table review_requests (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  employee_id uuid not null references employees (id) on delete cascade,
  sent_at timestamptz,
  clicked_at timestamptz,
  rating smallint check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index review_requests_business_id_idx on review_requests (business_id);
create index review_requests_employee_id_idx on review_requests (employee_id);

-- ---------------------------------------------------------------------
-- Row Level Security — minden tábla csak a saját businesshez tartozó
-- tulajdonosnak (auth.uid()) érhető el. A cron- és visszaigazolás-útvonalak
-- a service role kulccsal, RLS megkerülésével futnak a szerveren.
-- ---------------------------------------------------------------------
alter table businesses enable row level security;
alter table employees enable row level security;
alter table business_hours enable row level security;
alter table closures enable row level security;
alter table services enable row level security;
alter table customers enable row level security;
alter table appointments enable row level security;
alter table reminder_messages enable row level security;
alter table waitlist enable row level security;
alter table review_requests enable row level security;

create policy "owner can manage own business" on businesses
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

create policy "owner can manage own employees" on employees
  for all using (
    exists (select 1 from businesses b where b.id = employees.business_id and b.owner_user_id = auth.uid())
  ) with check (
    exists (select 1 from businesses b where b.id = employees.business_id and b.owner_user_id = auth.uid())
  );

create policy "owner can manage own business_hours" on business_hours
  for all using (
    exists (select 1 from businesses b where b.id = business_hours.business_id and b.owner_user_id = auth.uid())
  ) with check (
    exists (select 1 from businesses b where b.id = business_hours.business_id and b.owner_user_id = auth.uid())
  );

create policy "owner can manage own closures" on closures
  for all using (
    exists (select 1 from businesses b where b.id = closures.business_id and b.owner_user_id = auth.uid())
  ) with check (
    exists (select 1 from businesses b where b.id = closures.business_id and b.owner_user_id = auth.uid())
  );

create policy "owner can manage own services" on services
  for all using (
    exists (select 1 from businesses b where b.id = services.business_id and b.owner_user_id = auth.uid())
  ) with check (
    exists (select 1 from businesses b where b.id = services.business_id and b.owner_user_id = auth.uid())
  );

create policy "owner can manage own customers" on customers
  for all using (
    exists (select 1 from businesses b where b.id = customers.business_id and b.owner_user_id = auth.uid())
  ) with check (
    exists (select 1 from businesses b where b.id = customers.business_id and b.owner_user_id = auth.uid())
  );

create policy "owner can manage own appointments" on appointments
  for all using (
    exists (select 1 from businesses b where b.id = appointments.business_id and b.owner_user_id = auth.uid())
  ) with check (
    exists (select 1 from businesses b where b.id = appointments.business_id and b.owner_user_id = auth.uid())
  );

create policy "owner can view own reminder_messages" on reminder_messages
  for select using (
    exists (select 1 from businesses b where b.id = reminder_messages.business_id and b.owner_user_id = auth.uid())
  );

create policy "owner can manage own waitlist" on waitlist
  for all using (
    exists (select 1 from businesses b where b.id = waitlist.business_id and b.owner_user_id = auth.uid())
  ) with check (
    exists (select 1 from businesses b where b.id = waitlist.business_id and b.owner_user_id = auth.uid())
  );

create policy "owner can view own review_requests" on review_requests
  for select using (
    exists (select 1 from businesses b where b.id = review_requests.business_id and b.owner_user_id = auth.uid())
  );
