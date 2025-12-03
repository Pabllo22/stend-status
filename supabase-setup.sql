-- SQL скрипт для создания таблиц в Supabase
-- Выполните этот скрипт в SQL Editor в Supabase Dashboard

-- Таблица стендов
CREATE TABLE IF NOT EXISTS stands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Таблица контуров
CREATE TABLE IF NOT EXISTS circuits (
  id TEXT PRIMARY KEY,
  "standId" TEXT NOT NULL REFERENCES stands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "isOccupied" BOOLEAN DEFAULT false,
  "isActive" BOOLEAN DEFAULT true,
  "userId" TEXT,
  "taskNumber" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Включить Row Level Security (RLS) для публичного доступа
ALTER TABLE stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Политики безопасности - разрешить всем читать и писать
CREATE POLICY "Allow public read access" ON stands FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON stands FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON stands FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON stands FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON circuits FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON circuits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON circuits FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON circuits FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON users FOR DELETE USING (true);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_stands_updated_at BEFORE UPDATE ON stands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_circuits_updated_at BEFORE UPDATE ON circuits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Инициализация данных
INSERT INTO stands (id, name, "isActive") VALUES
  ('meetups', 'Meetups', true),
  ('career', 'Career', true),
  ('edu', 'Edu', true),
  ('sprint-offer', 'Sprint Offer', true)
ON CONFLICT (id) DO NOTHING;

-- Вставка контуров для каждого стенда
INSERT INTO circuits (id, "standId", name, "isOccupied", "isActive", "userId", "taskNumber")
SELECT 
  stand_id || '-circuit-' || circuit_num as id,
  stand_id as "standId",
  'Test ' || circuit_num as name,
  false as "isOccupied",
  true as "isActive",
  NULL as "userId",
  NULL as "taskNumber"
FROM (
  SELECT 'meetups' as stand_id, 1 as circuit_num
  UNION ALL SELECT 'meetups', 2
  UNION ALL SELECT 'career', 1
  UNION ALL SELECT 'career', 2
  UNION ALL SELECT 'edu', 1
  UNION ALL SELECT 'edu', 2
  UNION ALL SELECT 'sprint-offer', 1
  UNION ALL SELECT 'sprint-offer', 2
) circuits_data
ON CONFLICT (id) DO NOTHING;

-- Вставка пользователей
INSERT INTO users (id, name) VALUES
  ('anton', 'Антон'),
  ('aliya', 'Алия'),
  ('natasha', 'Наташа')
ON CONFLICT (id) DO NOTHING;

