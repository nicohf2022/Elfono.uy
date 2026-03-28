const normalizeText = (text = "") =>
  String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const normalizeSearchText = normalizeText;

export const splitWords = (text = "") =>
  normalizeText(text)
    .split(/\s+/)
    .filter(Boolean);

export const matchesGeneralSearch = (product, generalQuery) => {
  const q = normalizeText(generalQuery);
  if (!q) return true;

  const queryWords = splitWords(q);

  const searchableText = [
    product.name,
    product.category,
    product.description,
  ]
    .filter(Boolean)
    .map(normalizeText)
    .join(" ");

  return queryWords.every((word) => searchableText.includes(word));
};

export const modelMatchesSearch = (model, search) => {
  const modelWords = splitWords(model);
  const searchWords = splitWords(search);

  if (searchWords.length === 0) return false;
  if (searchWords.length > modelWords.length) return false;

  if (searchWords.length === 1) {
    return modelWords.includes(searchWords[0]);
  }

  const modelEnding = modelWords.slice(-searchWords.length);

  return searchWords.every((word, index) => modelEnding[index] === word);
};

export const getProductGeneralTokens = (product) => {
  return [
    ...splitWords(product.name || ""),
    ...splitWords(product.category || ""),
    ...splitWords(product.description || ""),
  ];
};

export const getRemainingModelQuery = (product, query) => {
  const queryWords = splitWords(query);
  const generalTokens = new Set(getProductGeneralTokens(product));

  const remainingWords = queryWords.filter((word) => !generalTokens.has(word));

  return remainingWords.join(" ");
};

export const getGeneralQuery = (product, query) => {
  const queryWords = splitWords(query);
  const generalTokens = new Set(getProductGeneralTokens(product));

  const generalWords = queryWords.filter((word) => generalTokens.has(word));

  return generalWords.join(" ");
};

export const hasGeneralProductWordsInQuery = (product, query) => {
  const queryWords = splitWords(query);
  const generalTokens = new Set(getProductGeneralTokens(product));

  return queryWords.some((word) => generalTokens.has(word));
};