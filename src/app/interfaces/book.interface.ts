export interface Book {
  id: number;
  title: string;
  authors: Author[];
  formats: BookFormats;
  download_count: number;
  bookshelves: string[];
  subjects: string[];
}

export interface Author {
  name: string;
  birth_year?: number;
  death_year?: number;
}

// Define known MIME types
type MimeType = 'text/html' | 'application/pdf' | 'text/plain' | 'image/jpeg';

// Interface for book formats with index signature
export interface BookFormats {
  [key: string]: string | string[] | undefined;
  'text/html'?: string | string[];
  'application/pdf'?: string | string[];
  'text/plain'?: string | string[];
  'image/jpeg'?: string | string[];
}

export interface BookResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
} 