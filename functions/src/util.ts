export const wordsFromName = (name: string): string[] => {
  const normalized = name
    .replaceAll('.', '') // clear out periods in case of abbreviations
    .replaceAll(/\W+/g, ' ') // clear out all non alpha chars
    .trim()
    .toLowerCase();
  return normalized.split(' ')
    // ignore common words
    .filter(word => word.length > 2 && word !== 'the');
};

export const difference = <T>(arr1: T[], arr2: T[]): T[] => arr1.filter(item => !arr2.includes(item));
