import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Favorites } from '../../core/services/favorites';

import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, SearchBar],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private favoritesService = inject(Favorites);

  isDark = signal(false);

  constructor() {
    const saved = localStorage.getItem('skywise-theme');
    const dark = saved
      ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.isDark.set(dark);
    document.documentElement.classList.toggle('dark', dark);
  }

  favoriteCount = () => this.favoritesService.favoriteCities().length;

  toggleTheme() {
    const dark = !this.isDark();
    this.isDark.set(dark);
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('skywise-theme', dark ? 'dark' : 'light');
  }
}
