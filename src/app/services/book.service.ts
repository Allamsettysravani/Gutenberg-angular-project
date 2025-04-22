import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookResponse, BookFormats } from '../interfaces/book.interface';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly API_URL = 'http://skunkworks.ignitesol.com:8000';

  constructor(private http: HttpClient) { }

  getBooks(params: {
    topic?: string;
    search?: string;
    page?: string;
  }): Observable<BookResponse> {
    const queryParams = new URLSearchParams();
    
    // Handle topic (category/genre) filter
    if (params.topic) {
      queryParams.append('topic', params.topic);
    }

    // Handle search across title, author, subjects and bookshelves
    if (params.search) {
      queryParams.append('search', params.search);
    }

    // Handle pagination
    if (params.page) {
      queryParams.append('page', params.page);
    }
    
    // Always ensure we get books with proper covers
    queryParams.append('mime_type', 'image/jpeg');

    // Ensure we get books with viewable formats (non-zip)
    queryParams.append('mime_type', 'text/html');
    queryParams.append('mime_type', 'application/pdf');
    queryParams.append('mime_type', 'text/plain');

    const url = `${this.API_URL}/books?${queryParams.toString()}`;
    return this.http.get<BookResponse>(url);
  }

  getBookViewUrl(formats: BookFormats): string {
    // Helper to get first non-zip URL for a format
    const getNonZipUrl = (format: string | string[] | undefined): string => {
      if (!format) return '';
      
      const urls = Array.isArray(format) ? format : [format];
      const nonZipUrl = urls.find(url => 
        !url.endsWith('.zip') && 
        !url.includes('.zip.') && 
        !url.includes('.zip?')
      );
      
      return nonZipUrl || '';
    };

    // Check formats in priority order: HTML > PDF > TXT
    const htmlUrl = getNonZipUrl(formats['text/html']);
    if (htmlUrl) return htmlUrl;

    const pdfUrl = getNonZipUrl(formats['application/pdf']);
    if (pdfUrl) return pdfUrl;

    const txtUrl = getNonZipUrl(formats['text/plain']);
    if (txtUrl) return txtUrl;

    // No viewable version available
    return '';
  }
}
