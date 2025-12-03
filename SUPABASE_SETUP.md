# Настройка Supabase для общей базы данных

## Шаги настройки:

1. **Создайте проект на Supabase**
   - Перейдите на https://supabase.com
   - Создайте новый проект (бесплатный тариф)
   - Дождитесь завершения создания проекта

2. **Создайте таблицы**
   - В Supabase Dashboard перейдите в SQL Editor
   - Откройте файл `supabase-setup.sql` из этого проекта
   - Скопируйте весь SQL код и выполните его в SQL Editor
   - Это создаст все необходимые таблицы и заполнит начальными данными
   
   Yu_gsY##HU42f*y
3. **Получите ключи API**
   - В Supabase Dashboard перейдите в Settings → API
   - Скопируйте:
     - Project URL (это будет `VITE_SUPABASE_URL`)
     - anon/public key (это будет `VITE_SUPABASE_ANON_KEY`)

4. **Настройте переменные окружения**
   - Создайте файл `.env` в корне проекта (скопируйте из `.env.example`)
   - Вставьте ваши значения:
     ```
     VITE_SUPABASE_URL=https://ваш-проект.supabase.co
     VITE_SUPABASE_ANON_KEY=ваш-ключ
     ```

5. **Обновите импорты в коде**
   - В файле `src/App.tsx` замените импорт:
     ```typescript
     // Было:
     import { ... } from './db/database';
     
     // Стало:
     import { ... } from './db/supabaseDatabase';
     ```

6. **Обновите компоненты**
   - В `src/components/Circuit.tsx` замените:
     ```typescript
     // Было:
     import { getUserById } from '../db/database';
     
     // Стало:
     import { getUserById } from '../db/supabaseDatabase';
     ```

7. **Пересоберите проект**
   ```bash
   npm run build
   ```

## Важно:
- Все функции теперь асинхронные, поэтому нужно использовать `await` при вызове
- Данные будут синхронизироваться между всеми пользователями в реальном времени
- При первом запуске данные будут загружены из Supabase

