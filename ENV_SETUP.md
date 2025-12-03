# Настройка переменных окружения

## Создайте файл .env

Создайте файл `.env` в корне проекта со следующим содержимым:

```
VITE_SUPABASE_URL=https://zpbbnmdzxzzyvlswnnmi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_oinrBEnNHY2rSATlYyC9rg_-bMfGB_i
```

## Для Netlify

В Netlify Dashboard:
1. Перейдите в Site settings → Environment variables
2. Добавьте переменные:
   - `VITE_SUPABASE_URL` = `https://zpbbnmdzxzzyvlswnnmi.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_oinrBEnNHY2rSATlYyC9rg_-bMfGB_i`

## Важно

- Файл `.env` уже добавлен в `.gitignore` и не будет закоммичен в репозиторий
- Значения по умолчанию уже встроены в код, но лучше использовать переменные окружения

