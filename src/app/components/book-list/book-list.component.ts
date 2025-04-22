import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { BookService } from '../../services/book.service';
import { Book } from '../../interfaces/book.interface';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
  standalone: true,
  imports: [RouterLink, NgIf, NgFor]
})
export class BookListComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  loading = false;
  searchTerm = '';
  currentTopic = '';
  private nextPage: string | null = null;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.resetAndReload();
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentTopic = params['topic'] || '';
      this.resetAndReload();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.loading || !this.nextPage) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (windowHeight + scrollTop >= documentHeight - 100) {
      this.loadBooks();
    }
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }

  getCategoryName(): string {
    if (!this.currentTopic) return '';
    // Capitalize first letter and convert from slug to display name
    return this.currentTopic.charAt(0).toUpperCase() + this.currentTopic.slice(1);
  }

  private resetAndReload() {
    this.books = [];
    this.nextPage = null;
    this.loadBooks();
  }

  private loadBooks() {
    if (this.loading) return;
    this.loading = true;

    let page = '1';
    if (this.nextPage) {
      const url = new URL(this.nextPage);
      page = url.searchParams.get('page') || '1';
    }

    this.bookService.getBooks({
      topic: this.currentTopic,
      search: this.searchTerm,
      page: page
    }).subscribe({
      next: (response) => {
        this.books = [...this.books, ...response.results];
        this.nextPage = response.next;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        console.error('Failed to load books');
      }
    });
  }

  openBook(book: Book) {
    const viewUrl = this.bookService.getBookViewUrl(book.formats);
    if (viewUrl) {
      window.open(viewUrl, '_blank');
    } else {
      alert('No viewable version available');
    }
  }

  getAuthorName(book: Book): string {
    if (!book.authors || book.authors.length === 0) {
      return 'Unknown Author';
    }
    return book.authors[0].name;
  }
}
