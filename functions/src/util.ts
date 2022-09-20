export const wordsFromName = (name: string): string[] => {
  const normalized = name.replaceAll(/\W+/g, ' ').trim().toLowerCase();
  return normalized.split(' ');
};
