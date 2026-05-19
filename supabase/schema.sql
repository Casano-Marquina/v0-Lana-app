-- ===========================================
-- LANA OS - Supabase Database Schema
-- ===========================================
-- Este script crea todas las tablas necesarias
-- para la aplicación de bienestar y productividad
-- ===========================================

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- ===========================================
-- TIPOS ENUMERADOS (ENUMS)
-- ===========================================

-- Enum para los reinos/ámbitos de vida
create type realm_type as enum ('personal', 'academic', 'relational');

-- Enum para las áreas de nutrición financiera
create type nutrition_type as enum ('centro', 'futuro', 'corazon');

-- Enum para niveles de energía
create type energy_level_type as enum ('low', 'medium', 'high');

-- ===========================================
-- TABLA: profiles
-- ===========================================
-- Extiende los datos del usuario de Auth
-- Se crea automáticamente cuando un usuario se registra

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  username text unique,
  full_name text,
  avatar_url text,
  last_energy_level energy_level_type default 'medium',
  last_energy_check timestamp with time zone,
  
  -- Validaciones
  constraint username_length check (char_length(username) >= 3)
);

-- Índices para profiles
create index if not exists profiles_username_idx on profiles (username);

-- ===========================================
-- TABLA: tasks
-- ===========================================
-- Almacena las tareas del usuario organizadas por realm y jerarquía

create table if not exists tasks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users on delete cascade not null,
  
  -- Datos de la tarea
  title text not null,
  description text,
  realm realm_type not null default 'personal',
  
  -- Jerarquía de prioridad (sistema Lana)
  -- 1 = No postergar (urgente/importante)
  -- 2 = Pensar en postergar (importante pero flexible)
  -- 3 = Postergar (puede esperar)
  hierarchy integer not null default 2 check (hierarchy >= 1 and hierarchy <= 3),
  
  -- Estado
  is_completed boolean default false not null,
  completed_at timestamp with time zone,
  
  -- Fechas
  due_date timestamp with time zone,
  reminder_time timestamp with time zone,
  
  -- Validaciones
  constraint title_not_empty check (char_length(trim(title)) > 0)
);

-- Índices para tasks
create index if not exists tasks_user_id_idx on tasks (user_id);
create index if not exists tasks_realm_idx on tasks (realm);
create index if not exists tasks_hierarchy_idx on tasks (hierarchy);
create index if not exists tasks_is_completed_idx on tasks (is_completed);
create index if not exists tasks_due_date_idx on tasks (due_date);
create index if not exists tasks_user_realm_idx on tasks (user_id, realm);
create index if not exists tasks_user_completed_idx on tasks (user_id, is_completed);

-- ===========================================
-- TABLA: ovillos_gastados
-- ===========================================
-- Registro de gastos/inversiones con narrativa de bienestar

create table if not exists ovillos_gastados (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users on delete cascade not null,
  
  -- Datos del gasto
  amount decimal(10, 2) not null check (amount > 0),
  note text,
  
  -- Área de vida que nutrió esta inversión
  nutrition nutrition_type not null,
  
  -- Modo Transmutar (para gastos que generan ansiedad)
  is_transmuted boolean default false,
  transmute_reason text,
  transmuted_at timestamp with time zone
);

-- Índices para ovillos_gastados
create index if not exists ovillos_user_id_idx on ovillos_gastados (user_id);
create index if not exists ovillos_nutrition_idx on ovillos_gastados (nutrition);
create index if not exists ovillos_created_at_idx on ovillos_gastados (created_at);
create index if not exists ovillos_user_nutrition_idx on ovillos_gastados (user_id, nutrition);

-- ===========================================
-- TABLA: energy_history
-- ===========================================
-- Historial de check-ins de energía diarios

create table if not exists energy_history (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users on delete cascade not null,
  
  energy_level energy_level_type not null,
  check_date date not null default current_date,
  
  -- Un solo check-in por día por usuario
  constraint unique_daily_checkin unique (user_id, check_date)
);

-- Índices para energy_history
create index if not exists energy_user_id_idx on energy_history (user_id);
create index if not exists energy_check_date_idx on energy_history (check_date);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Habilitar RLS en todas las tablas
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table ovillos_gastados enable row level security;
alter table energy_history enable row level security;

-- -----------------------------------------
-- Políticas para PROFILES
-- -----------------------------------------

-- Los usuarios pueden ver su propio perfil
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- -----------------------------------------
-- Políticas para TASKS
-- -----------------------------------------

-- Los usuarios pueden ver sus propias tareas
create policy "Users can view own tasks"
  on tasks for select
  using (auth.uid() = user_id);

-- Los usuarios pueden crear sus propias tareas
create policy "Users can create own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias tareas
create policy "Users can update own tasks"
  on tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propias tareas
create policy "Users can delete own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- -----------------------------------------
-- Políticas para OVILLOS_GASTADOS
-- -----------------------------------------

-- Los usuarios pueden ver sus propios gastos
create policy "Users can view own ovillos"
  on ovillos_gastados for select
  using (auth.uid() = user_id);

-- Los usuarios pueden crear sus propios gastos
create policy "Users can create own ovillos"
  on ovillos_gastados for insert
  with check (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios gastos (para transmutar)
create policy "Users can update own ovillos"
  on ovillos_gastados for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios gastos
create policy "Users can delete own ovillos"
  on ovillos_gastados for delete
  using (auth.uid() = user_id);

-- -----------------------------------------
-- Políticas para ENERGY_HISTORY
-- -----------------------------------------

-- Los usuarios pueden ver su propio historial de energía
create policy "Users can view own energy history"
  on energy_history for select
  using (auth.uid() = user_id);

-- Los usuarios pueden crear su propio check-in
create policy "Users can create own energy checkin"
  on energy_history for insert
  with check (auth.uid() = user_id);

-- Los usuarios pueden actualizar su check-in del día
create policy "Users can update own energy checkin"
  on energy_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ===========================================
-- FUNCIONES Y TRIGGERS
-- ===========================================

-- Función para actualizar updated_at automáticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger para profiles
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- Trigger para tasks
create trigger update_tasks_updated_at
  before update on tasks
  for each row
  execute function update_updated_at_column();

-- Función para crear perfil automáticamente al registrarse
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para crear perfil cuando se registra un usuario
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- Función para marcar completed_at cuando se completa una tarea
create or replace function handle_task_completion()
returns trigger as $$
begin
  if new.is_completed = true and old.is_completed = false then
    new.completed_at = timezone('utc'::text, now());
  elsif new.is_completed = false then
    new.completed_at = null;
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger para completed_at en tasks
create trigger on_task_completion
  before update on tasks
  for each row
  execute function handle_task_completion();

-- ===========================================
-- VISTAS ÚTILES
-- ===========================================

-- Vista de resumen de tareas por realm
create or replace view tasks_summary as
select
  user_id,
  realm,
  count(*) filter (where not is_completed) as pending_count,
  count(*) filter (where is_completed) as completed_count,
  count(*) as total_count
from tasks
group by user_id, realm;

-- Vista de balance financiero por área
create or replace view ovillos_balance as
select
  user_id,
  nutrition,
  sum(amount) as total_amount,
  count(*) as transaction_count,
  round(
    sum(amount) * 100.0 / nullif(sum(sum(amount)) over (partition by user_id), 0),
    2
  ) as percentage
from ovillos_gastados
group by user_id, nutrition;

-- ===========================================
-- DATOS INICIALES (opcional)
-- ===========================================

-- Comentado por defecto, descomentar si se necesitan datos de prueba
/*
-- Ejemplo de inserción de tarea (requiere usuario autenticado)
insert into tasks (user_id, title, realm, hierarchy, due_date)
values (
  auth.uid(),
  'Completar proyecto de Lana OS',
  'academic',
  1,
  now() + interval '7 days'
);
*/

-- ===========================================
-- FIN DEL SCHEMA
-- ===========================================
