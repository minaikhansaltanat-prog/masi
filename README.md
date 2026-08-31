# GUMYR — GUMIR.KZ

Ұлттық мәсі шеберханасының (GUMIR.KZ) корпоративтік сайты. Жеті тілде (қазақша, орысша, өзбекше, қырғызша, арабша, түрікше, қытайша) қолжетімді, толығымен статикалық көп беттi лендинг.

## Іске қосу

```bash
node serve.mjs
```

Сайт `http://localhost:3000` мекенжайында ашылады.

## Скриншот алу

```bash
node screenshot.mjs http://localhost:3000 [label] [width] [height] [fullPage]
```

Скриншоттар `./temporary screenshots/` қалтасына сақталады.

## Құрылым

```
index.html              — негізгі бет (HTML + inline CSS)
assets/js/i18n.js        — 7 тілдегі аудармалар
assets/js/main.js        — интерактивтілік (мәзір, тіл ауыстыру, каруселдер, форма)
assets/images/           — оңтайландырылған өнім/галерея фотолары
assets/video/            — қысқа процесс видеолары
scripts/optimize_images.py — фотоларды сығымдау скрипті (Pillow)
```

## Компания

ЖШС «GUMIR.KZ», БИН 221040025667.
