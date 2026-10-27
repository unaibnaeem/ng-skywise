import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { GeocodingApi } from '../../core/services/geocoding-api';
import { GeocodingResult } from '../../core/models/weather.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-bar',
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  private api = inject(GeocodingApi);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  query = new FormControl('', { nonNullable: true });
  suggestions = signal<GeocodingResult[]>([]);
  loading = signal(false);
  error = signal('');
  activeIndex = signal(-1);
  isOpen = signal(false);

  constructor() {
    this.query.valueChanges
      .pipe(
        startWith(this.query.value),
        map((value) => value.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.activeIndex.set(-1);
          this.error.set('');
        }),
        switchMap((query) => {
          if (query.length < 2) {
            this.loading.set(false);
            this.suggestions.set([]);
            this.isOpen.set(false);
            return of([]);
          }

          this.loading.set(true);
          this.isOpen.set(true);

          return this.api.search(query).pipe(
            catchError(() => {
              this.error.set('Unable to search cities. Check your connection.');
              return of([]);
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.suggestions.set(results);
      });
  }

  onKeydown(event: KeyboardEvent) {
    const items = this.suggestions();

    if (event.key === 'ArrowDown' && items.length) {
      event.preventDefault();

      this.activeIndex.update((i) => (i + 1) % items.length);
    } else if (event.key === 'ArrowUp' && items.length) {
      event.preventDefault();

      this.activeIndex.update((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();

      if (this.activeIndex() >= 0 && items[this.activeIndex()]) {
        this.selectCity(items[this.activeIndex()]);
      } else if (items.length === 1) {
        this.selectCity(items[0]);
      }
    } else if (event.key === 'Escape') {
      this.isOpen.set(false);
    }
  }

  selectCity(city: GeocodingResult) {
    this.isOpen.set(false);
    this.suggestions.set([]);
    this.query.setValue('');

    this.router.navigate(['/weather', city.lat, city.lon], {
      state: { city },
    });
  }

  displayCity(city: GeocodingResult): string {
    return [city.name, city.state, city.country].filter(Boolean).join(', ');
  }
}
