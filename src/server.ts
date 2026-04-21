import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { Anime, Manga } from "./types";
import { animeList } from "./data/anime";
import { mangaList } from "./data/manga";

const app = express();
const PORT = 3000;
const _dir = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(join(_dir, "..", "public")));

let nextAnimeId =
  animeList.length > 0 ? Math.max(...animeList.map((a) => a.id)) + 1 : 1;

let nextMangaId =
  mangaList.length > 0 ? Math.max(...mangaList.map((m) => m.id)) + 1 : 1;

// ---------- Hilfsfunktionen ----------

const ANIME_SORT_KEYS = ["title", "rating", "episodes", "genre"] as const;
const MANGA_SORT_KEYS = ["title", "rating", "chapters", "genre"] as const;

function filterAnime(
  search?: string,
  genre?: string,
  sort?: string,
  order: "asc" | "desc" = "asc"
) {
  let result = [...animeList];

  if (genre) {
    result = result.filter(
      (a) => a.genre.toLowerCase() === genre.toLowerCase()
    );
  }
  if (search) {
    result = result.filter((a) =>
      a.title.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (sort && (ANIME_SORT_KEYS as readonly string[]).includes(sort)) {
    const key = sort as keyof Anime;
    result.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === "string" && typeof bv === "string") {
        return order === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return order === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }

  return result;
}

function filterManga(
  search?: string,
  genre?: string,
  sort?: string,
  order: "asc" | "desc" = "asc"
) {
  let result = [...mangaList];

  if (genre) {
    result = result.filter(
      (m) => m.genre.toLowerCase() === genre.toLowerCase()
    );
  }
  if (search) {
    result = result.filter((m) =>
      m.title.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (sort && (MANGA_SORT_KEYS as readonly string[]).includes(sort)) {
    const key = sort as keyof Manga;
    result.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === "string" && typeof bv === "string") {
        return order === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return order === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }

  return result;
}

// ---------- ANIME CRUD ----------

// GET alle Anime + Filter + Sortierung + Pagination
app.get("/api/anime", (req, res) => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const genre  = req.query.genre  ? String(req.query.genre)  : undefined;
  const sort   = req.query.sort   ? String(req.query.sort)   : undefined;
  const order  = req.query.order === "desc" ? "desc" : "asc";
  const page   = Math.max(1, parseInt(String(req.query.page  ?? "1"), 10) || 1);
  const limit  = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "6"), 10) || 6));

  const filtered   = filterAnime(search, genre, sort, order);
  const total      = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const data       = filtered.slice((page - 1) * limit, page * limit);

  res.json({ data, page, limit, total, totalPages });
});

// GET einzelner Anime
app.get("/api/anime/:id", (req, res) => {
  const id = Number(req.params.id);
  const anime = animeList.find((a) => a.id === id);

  if (!anime) {
    res.status(404).json({ error: "Anime nicht gefunden" });
    return;
  }

  res.json(anime);
});

// POST Anime
app.post("/api/anime", (req, res) => {
  const { title, description, episodes, rating, genre } = req.body;

  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "title ist erforderlich und muss ein String sein" });
    return;
  }
  if (!description || typeof description !== "string") {
    res.status(400).json({ error: "description ist erforderlich und muss ein String sein" });
    return;
  }
  if (typeof episodes !== "number" || episodes < 1) {
    res.status(400).json({ error: "episodes ist erforderlich und muss eine positive Zahl sein" });
    return;
  }
  if (typeof rating !== "number" || rating < 1 || rating > 10) {
    res.status(400).json({ error: "rating ist erforderlich und muss zwischen 1 und 10 liegen" });
    return;
  }
  if (!genre || typeof genre !== "string") {
    res.status(400).json({ error: "genre ist erforderlich und muss ein String sein" });
    return;
  }

  const newAnime: Anime = {
    id: nextAnimeId++,
    title,
    description,
    episodes,
    rating,
    genre
  };

  animeList.push(newAnime);
  res.status(201).json(newAnime);
});

// PUT Anime
app.put("/api/anime/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = animeList.findIndex((a) => a.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Anime nicht gefunden" });
    return;
  }

  const { title, description, episodes, rating, genre } = req.body;

  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "title ist erforderlich und muss ein String sein" });
    return;
  }
  if (!description || typeof description !== "string") {
    res.status(400).json({ error: "description ist erforderlich und muss ein String sein" });
    return;
  }
  if (typeof episodes !== "number" || episodes < 1) {
    res.status(400).json({ error: "episodes ist erforderlich und muss eine positive Zahl sein" });
    return;
  }
  if (typeof rating !== "number" || rating < 1 || rating > 10) {
    res.status(400).json({ error: "rating ist erforderlich und muss zwischen 1 und 10 liegen" });
    return;
  }
  if (!genre || typeof genre !== "string") {
    res.status(400).json({ error: "genre ist erforderlich und muss ein String sein" });
    return;
  }

  animeList[index] = {
    ...animeList[index],
    title,
    description,
    episodes,
    rating,
    genre
  };

  res.json(animeList[index]);
});

// DELETE Anime
app.delete("/api/anime/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = animeList.findIndex((a) => a.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Anime nicht gefunden" });
    return;
  }

  animeList.splice(index, 1);
  res.status(204).send();
});

// ---------- MANGA CRUD ----------

// GET alle Manga + Filter + Sortierung + Pagination
app.get("/api/manga", (req, res) => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const genre  = req.query.genre  ? String(req.query.genre)  : undefined;
  const sort   = req.query.sort   ? String(req.query.sort)   : undefined;
  const order  = req.query.order === "desc" ? "desc" : "asc";
  const page   = Math.max(1, parseInt(String(req.query.page  ?? "1"), 10) || 1);
  const limit  = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "6"), 10) || 6));

  const filtered   = filterManga(search, genre, sort, order);
  const total      = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const data       = filtered.slice((page - 1) * limit, page * limit);

  res.json({ data, page, limit, total, totalPages });
});

// GET einzelner Manga
app.get("/api/manga/:id", (req, res) => {
  const id = Number(req.params.id);
  const manga = mangaList.find((m) => m.id === id);

  if (!manga) {
    res.status(404).json({ error: "Manga nicht gefunden" });
    return;
  }

  res.json(manga);
});

// POST Manga
app.post("/api/manga", (req, res) => {
  const { title, description, chapters, rating, genre } = req.body;

  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "title ist erforderlich und muss ein String sein" });
    return;
  }
  if (!description || typeof description !== "string") {
    res.status(400).json({ error: "description ist erforderlich und muss ein String sein" });
    return;
  }
  if (typeof chapters !== "number" || chapters < 1) {
    res.status(400).json({ error: "chapters ist erforderlich und muss eine positive Zahl sein" });
    return;
  }
  if (typeof rating !== "number" || rating < 1 || rating > 10) {
    res.status(400).json({ error: "rating ist erforderlich und muss zwischen 1 und 10 liegen" });
    return;
  }
  if (!genre || typeof genre !== "string") {
    res.status(400).json({ error: "genre ist erforderlich und muss ein String sein" });
    return;
  }

  const newManga: Manga = {
    id: nextMangaId++,
    title,
    description,
    chapters,
    rating,
    genre
  };

  mangaList.push(newManga);
  res.status(201).json(newManga);
});

// PUT Manga
app.put("/api/manga/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = mangaList.findIndex((m) => m.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Manga nicht gefunden" });
    return;
  }

  const { title, description, chapters, rating, genre } = req.body;

  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "title ist erforderlich und muss ein String sein" });
    return;
  }
  if (!description || typeof description !== "string") {
    res.status(400).json({ error: "description ist erforderlich und muss ein String sein" });
    return;
  }
  if (typeof chapters !== "number" || chapters < 1) {
    res.status(400).json({ error: "chapters ist erforderlich und muss eine positive Zahl sein" });
    return;
  }
  if (typeof rating !== "number" || rating < 1 || rating > 10) {
    res.status(400).json({ error: "rating ist erforderlich und muss zwischen 1 und 10 liegen" });
    return;
  }
  if (!genre || typeof genre !== "string") {
    res.status(400).json({ error: "genre ist erforderlich und muss ein String sein" });
    return;
  }

  mangaList[index] = {
    ...mangaList[index],
    title,
    description,
    chapters,
    rating,
    genre
  };

  res.json(mangaList[index]);
});

// DELETE Manga
app.delete("/api/manga/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = mangaList.findIndex((m) => m.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Manga nicht gefunden" });
    return;
  }

  mangaList.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});