# Code Review — Praktikum 2

Systematisches Code Review des Projekts (Anime/Manga REST-API, Express 5 + TypeScript).

---

## Issue 1: Inkonsistentes Fehlerformat (`message` statt `error`)

**Vorher:**
```ts
res.status(404).json({ message: "Anime nicht gefunden" });
```

**Problem:** Der Key `message` ist nicht konsistent mit dem REST-Standard und dem Aufgabenblatt, das `{ "error": "..." }` vorschreibt.

**Nachher:**
```ts
res.status(404).json({ error: "Anime nicht gefunden" });
```

**Gelernt:** Einheitliche Fehlerformate erleichtern dem Frontend die Fehlerbehandlung — man muss nicht prüfen, ob es `error`, `message` oder `msg` heißt.

---

## Issue 2: Fehlende 400-Validierung in POST und PUT

**Vorher:**
```ts
app.post("/api/anime", (req, res) => {
  const { title, description, episodes, rating, genre } = req.body;
  // Direkt speichern — ohne Validierung!
  const newAnime: Anime = { id: nextAnimeId++, title, description, ... };
  animeList.push(newAnime);
  res.status(201).json(newAnime);
});
```

**Problem:** Leere oder falsch typisierte Felder wurden stillschweigend akzeptiert. Ein `POST` mit `{}` erzeugte einen Eintrag mit `title: undefined`.

**Nachher:**
```ts
if (!title || typeof title !== "string") {
  res.status(400).json({ error: "title ist erforderlich und muss ein String sein" });
  return;
}
// ... weitere Prüfungen
```

**Gelernt:** Validierung gehört ins Backend — auch wenn das Frontend schon prüft, muss die API selbst robust sein (Defense in Depth).

---

## Issue 3: Keine Typprüfung für numerische Felder

**Vorher:**
```ts
const { episodes, rating } = req.body;
// episodes und rating könnten Strings sein ("abc", "99")
```

**Problem:** JSON-Body aus Fetch kann theoretisch jeden Typ enthalten. TypeScript-Typen gelten nur zur Compile-Zeit — zur Laufzeit ist `req.body` ungeprüft.

**Nachher:**
```ts
if (typeof episodes !== "number" || episodes < 1) {
  res.status(400).json({ error: "episodes ist erforderlich und muss eine positive Zahl sein" });
  return;
}
if (typeof rating !== "number" || rating < 1 || rating > 10) {
  res.status(400).json({ error: "rating ist erforderlich und muss zwischen 1 und 10 liegen" });
  return;
}
```

**Gelernt:** TypeScript schützt nur zur Compile-Zeit. Externe Eingaben (HTTP-Body, Query-Parameter) müssen immer zur Laufzeit validiert werden.
