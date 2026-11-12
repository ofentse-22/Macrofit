const API_URL = "https://wger.de/api/v2/exerciseinfo/";
const PAGE_SIZE = 100;
let remoteExercisesPromise;

const CATEGORY_MAP = {
  abs: "Core",
  arms: "Arms",
  back: "Back",
  calves: "Legs",
  cardio: "Full Body",
  chest: "Chest",
  legs: "Legs",
  shoulders: "Shoulders",
};

const EXERCISE_NAME_GROUPS = [
  ["arnoldpress", "arnoldshoulderpress"],
  ["frontraise", "frontraises"],
  ["lateralraise", "lateralraises"],
];
const EXERCISE_NAME_ALIASES = new Map(
  EXERCISE_NAME_GROUPS.flatMap((group) => {
    const canonicalName = group[0];
    return group.map((name) => [name, canonicalName]);
  }),
);

export function normalizeExerciseName(name) {
  const identity = String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bvariation\s*\d+\b/g, "")
    .replace(/\bcustom\b/g, "")
    .replace(/\bdumbell?\b/g, "dumbbell")
    .replace(/[^a-z0-9]/g, "");
  return EXERCISE_NAME_ALIASES.get(identity) || identity;
}

export function mergeExerciseCatalog(localExercises, remoteExercises) {
  const seen = new Set();
  return [...localExercises, ...remoteExercises].filter((exercise) => {
    const identities = [exercise.name, ...(exercise.aliases || [])]
      .map(normalizeExerciseName)
      .filter(Boolean);
    if (!identities.length || identities.some((identity) => seen.has(identity))) return false;
    identities.forEach((identity) => seen.add(identity));
    return true;
  });
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|li|div|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
}

export function normalizeWgerExercise(item) {
  const translation = item.translations?.find((entry) => entry.language === 2);
  const name = translation?.name?.trim();
  if (!name) return null;

  const categoryName = item.category?.name?.trim() || "";
  const category = CATEGORY_MAP[categoryName.toLowerCase()] || "Other";
  const instructions = stripHtml(translation.description_source || translation.description);
  const equipment = (item.equipment || []).map((entry) => entry.name).filter(Boolean);
  const muscles = (item.muscles || [])
    .map((muscle) => muscle.name_en || muscle.name)
    .filter(Boolean);
  const detailLines = [
    instructions,
    muscles.length ? `Target muscles: ${[...new Set(muscles)].join(", ")}` : "",
    equipment.length ? `Equipment: ${[...new Set(equipment)].join(", ")}` : "",
  ].filter(Boolean);
  const image = item.images?.find((entry) => entry.image)?.image || null;
  const aliases = (translation.aliases || [])
    .map((alias) => alias.alias)
    .filter((alias) => typeof alias === "string" && alias.trim());

  return {
    name,
    aliases,
    category,
    instructions: detailLines.join("\n\n") || "No instructions provided.",
    image,
    source: "wger",
    sourceUrl: `https://wger.de/en/exercise/${item.id}`,
    license: item.license?.short_name || "",
    licenseUrl: item.license?.url || "",
  };
}

async function fetchPage(offset) {
  const url = new URL(API_URL);
  url.searchParams.set("language", "2");
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`wger exercise catalog returned HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.results)) {
    throw new Error("wger exercise catalog returned an invalid response");
  }
  return data;
}

async function fetchRemoteExercises() {
  const firstPage = await fetchPage(0);
  const pageOffsets = [];
  for (let offset = PAGE_SIZE; offset < Number(firstPage.count || 0); offset += PAGE_SIZE) {
    pageOffsets.push(offset);
  }

  const pages = await Promise.all(pageOffsets.map(fetchPage));
  return [firstPage, ...pages]
    .flatMap((page) => page.results.map(normalizeWgerExercise).filter(Boolean));
}

export function getRemoteExercises() {
  if (!remoteExercisesPromise) {
    remoteExercisesPromise = fetchRemoteExercises().catch((error) => {
      remoteExercisesPromise = undefined;
      throw error;
    });
  }
  return remoteExercisesPromise;
}

export function resetRemoteExerciseCache() {
  remoteExercisesPromise = undefined;
}
