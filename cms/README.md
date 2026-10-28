# GUMYR басқару панелі

Сайттың (gumyr.kz) барлық мәтінін, суретін, карточкасын және аудармасын өзгертуге арналған панель. Vercel-де жұмыс істейді: `https://gumyr-admin.vercel.app`.

## Қалай жұмыс істейді

- Интерфейс — `public/` (қарапайым JS модульдері, build жоқ). API — `api/index.js` (бір Vercel функциясы), логикасы `lib/` ішінде.
- Мазмұн — Vercel Blob қоймасында (`gumyr-media`): әр «Жариялау» жаңа өзгермейтін файл `content/v/<уақыт>.json` болып сақталады (соңғы 40), суреттер — `media/`.
- Сайт (`assets/js/main.js`) жүктелгенде өзінің `assets/js/content.js` мазмұнын көрсетеді де, `GET /api/content` арқылы жарияланған нұсқаны алып ауыстырады. Панель істен шықса да, сайт бұзылмайды.
- Алдын ала қарау: панель жобаны `postMessage` арқылы сайттың `?cms-preview=1` iframe-іне жібереді.

## Орнату / жаңарту

```bash
cd cms
npm install
vercel deploy --prod        # жоба: gumyr-admin, Git байланысы ажыратылған
```

Орта айнымалылары (Vercel → Settings → Environment Variables): `ADMIN_PASSWORD`, `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN` (Blob қоймасы байланған кезде автоматты қосылады). Міндетті емес: `ANTHROPIC_API_KEY` (автоаударма Google орнына Claude арқылы жасалады), `TRANSLATE_MODEL`.

`public/vendor/blob-client.js` — `npm run build:client` нәтижесі (Blob жүктеу кітапханасы); `@vercel/blob` нұсқасын жаңартқанда қайта жасаңыз.

## Мазмұн схемасы (schema 2)

`public/seed.json` — бірінші жариялауға дейінгі бастапқы мазмұн, `assets/js/content.js` соның көшірмесі. Құрылымы: `languages`, `settings`, `texts` (кілт → `{тіл: мәтін}`), `hero`, `marquee`, `colors`, `categories`, `customOrders`, `aboutFeatures`, `gallery`, `testimonials`. Сайтта жаңа мәтін орнын қосқанда, оны `public/js/schema.js` ішіндегі `TEXT_GROUPS` тізіміне де жазыңыз.
