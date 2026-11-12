const API_URL = "https://world.openfoodfacts.org/api/v2/search";
const PAGE_SIZE = 100;

function readNutritionValue(nutriments, nutrient, unit) {
  const rawValue = nutriments[`${nutrient}_${unit}`];
  if (rawValue === null || rawValue === undefined || rawValue === "") return null;
  const value = Number(rawValue);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function getFoodIdentity(food) {
  const name = (food.foodName || food.name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(?:aubergines?|eggplants?)\b/g, "eggplant")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:kg|g|mg|ml|cl|l|oz|lb|lbs)\b/g, " ")
    .replace(/\b\d+\s*(?:x|pack|packs|pcs|pieces)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  return [
    name,
    food.unit,
    food.calories,
    food.protein,
    food.carbs,
    food.fat,
  ].join("|");
}

export function deduplicateFoods(foods, seen = new Set()) {
  return foods.filter((food) => {
    const identity = getFoodIdentity(food);
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

export function normalizeOpenFoodFactsProduct(product) {
  const nutriments = product?.nutriments;
  const name = typeof product?.product_name === "string" ? product.product_name.trim() : "";
  const code = product?.code ? String(product.code) : "";
  if (!name || !code || !nutriments) return null;

  const unit = readNutritionValue(nutriments, "energy-kcal", "100g") !== null
    || readNutritionValue(nutriments, "energy-kj", "100g") !== null
    ? "g"
    : readNutritionValue(nutriments, "energy-kcal", "100ml") !== null
      || readNutritionValue(nutriments, "energy-kj", "100ml") !== null
      ? "ml"
      : null;
  if (!unit) return null;

  let calories = readNutritionValue(nutriments, "energy-kcal", `100${unit}`);
  if (calories === null) {
    const kilojoules = readNutritionValue(nutriments, "energy-kj", `100${unit}`);
    if (kilojoules === null) return null;
    calories = kilojoules / 4.184;
  }

  const protein = readNutritionValue(nutriments, "proteins", `100${unit}`);
  const carbs = readNutritionValue(nutriments, "carbohydrates", `100${unit}`);
  const fat = readNutritionValue(nutriments, "fat", `100${unit}`);
  if (protein === null || carbs === null || fat === null) return null;

  const brand = typeof product.brands === "string" ? product.brands.split(",")[0]?.trim() : "";
  const quantity = typeof product.quantity === "string" ? product.quantity.trim() : "";
  const label = [name, brand, quantity].filter(Boolean).join(" · ");

  return {
    id: `openfoodfacts-${code}`,
    name: label,
    foodName: name,
    calories: Math.round(calories),
    protein,
    carbs,
    fat,
    unit,
  };
}

export async function searchOpenFoodFacts(query, page = 1, signal) {
  const params = new URLSearchParams({
    search_terms: query,
    page: String(page),
    page_size: String(PAGE_SIZE),
    fields: "code,product_name,brands,nutriments,quantity",
  });
  const response = await fetch(`${API_URL}?${params}`, {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const products = Array.isArray(data.products) ? data.products : [];

  return {
    products: deduplicateFoods(products.map(normalizeOpenFoodFactsProduct).filter(Boolean)),
    total: Number(data.count) || 0,
    page: Number(data.page) || page,
    pageCount: Number(data.page_count) || Math.ceil((Number(data.count) || 0) / PAGE_SIZE),
  };
}
