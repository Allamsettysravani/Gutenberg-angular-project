import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToGenre(genre: string): void {
    this.router.navigate(['/books'], { queryParams: { topic: genre.toLowerCase() } });
  }
}
