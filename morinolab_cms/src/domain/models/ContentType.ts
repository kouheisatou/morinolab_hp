import fs from 'node:fs';

// Dynamic content type detection from contents directory
export function getAvailableContentTypes(contentsRoot: string): string[] {
  try {
    if (!fs.existsSync(contentsRoot)) {
      return [];
    }

    return fs
      .readdirSync(contentsRoot, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .filter((dirent) => !dirent.name.startsWith('.')) // Exclude hidden directories like .DS_Store
      .map((dirent) => dirent.name)
      .sort();
  } catch (error) {
    console.warn('Failed to read contents directory:', error);
    return [];
  }
}

// Default fallback content types (for type safety)
export const DEFAULT_CONTENT_TYPES = [
  'award',
  'lecture',
  'member',
  'membertype',
  'news',
  'publication',
  'tags',
  'theme',
] as const;

export type ContentType = (typeof DEFAULT_CONTENT_TYPES)[number] | string;
