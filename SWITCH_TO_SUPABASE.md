# Переключение на Supabase (общая база данных)

## Быстрая инструкция:

1. **Выполните настройку Supabase** (см. `SUPABASE_SETUP.md`)

2. **Замените файлы:**
   ```bash
   # Переименуйте текущие файлы
   mv src/App.tsx src/App.local.tsx
   mv src/components/Circuit.tsx src/components/Circuit.local.tsx
   
   # Переименуйте Supabase версии
   mv src/App.supabase.tsx src/App.tsx
   mv src/components/Circuit.supabase.tsx src/components/Circuit.tsx
   ```

3. **Создайте файл `.env`** с вашими ключами Supabase:
   ```
   VITE_SUPABASE_URL=https://ваш-проект.supabase.co
   VITE_SUPABASE_ANON_KEY=ваш-ключ
   ```

4. **Пересоберите проект:**
   ```bash
   npm run build
   ```

5. **Для Netlify добавьте переменные окружения:**
   - В Netlify Dashboard → Site settings → Environment variables
   - Добавьте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`

## Преимущества Supabase:
- ✅ Все пользователи видят одни и те же данные
- ✅ Изменения синхронизируются в реальном времени
- ✅ Бесплатный тариф до 500MB базы данных
- ✅ Надежное хранилище данных

## Если нужно вернуться к локальной базе:
```bash
mv src/App.tsx src/App.supabase.tsx
mv src/components/Circuit.tsx src/components/Circuit.supabase.tsx
mv src/App.local.tsx src/App.tsx
mv src/components/Circuit.local.tsx src/components/Circuit.tsx
```

