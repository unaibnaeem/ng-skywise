import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  forkJoin,
  map,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
  of,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { WeatherApi } from '../../core/services/weather-api';
import { RecentCities } from '../../core/services/recent-cities';
import { Favorites } from '../../core/services/favorites';

import { DailyForecast } from '../../core/models/weather.model';

@Component({
  selector: 'app-weather-details',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './weather-details.html',
  styleUrl: './weather-details.css',
})
export class WeatherDetails {
  private route = inject(ActivatedRoute);
  private api = inject(WeatherApi);
  private recentCities = inject(RecentCities);
  private favoritesService = inject(Favorites);

  loading = signal(true);
  error = signal('');
  current = signal<any>(null);
  forecast = signal<any>(null);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => ({
          lat: Number(params.get('lat')),
          lon: Number(params.get('lon')),
        })),
        distinctUntilChanged((a, b) => a.lat === b.lat && a.lon === b.lon),
        tap(() => {
          this.loading.set(true);
          this.error.set('');
          this.current.set(null);
          this.forecast.set(null);
        }),
        switchMap(({ lat, lon }) => {
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            this.error.set('Invalid city coordinates.');
            this.loading.set(false);
            return of(null);
          }

          return forkJoin({
            current: this.api.getCurrent(lat, lon),
            forecast: this.api.getForecast(lat, lon),
          }).pipe(
            tap((data) => {
              this.recentCities.add({
                name: data.current.name,
                country: data.current.sys.country,
                lat,
                lon,
              });
            }),
            catchError(() => {
              this.error.set(
                'Could not load weather. Check your API key and try again.',
              );
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((data) => {
        if (data) {
          this.current.set(data.current);
          this.forecast.set(data.forecast);
        }

        this.loading.set(false);
      });
  }

  dailyForecast = computed<DailyForecast[]>(() => {
    const items = this.forecast()?.list ?? [];
    const days = new Map<string, any[]>();

    for (const item of items) {
      const date = item.dt_txt.slice(0, 10);

      if (!days.has(date)) {
        days.set(date, []);
      }

      days.get(date)!.push(item);
    }

    return Array.from(days.entries())
      .slice(0, 5)
      .map(([date, entries]) => {
        // Use the forecast closest to midday for the icon.
        const midday = entries.reduce((best, item) =>
          Math.abs(new Date(item.dt_txt).getHours() - 12) <
          Math.abs(new Date(best.dt_txt).getHours() - 12)
            ? item
            : best,
        );

        const temps = entries.map((item) => item.main.temp);

        return {
          date,
          day: new Date(`${date}T12:00:00`).toLocaleDateString('en', {
            weekday: 'short',
          }),
          icon: midday.weather[0].icon,
          description: midday.weather[0].description,
          min: Math.round(Math.min(...temps)),
          max: Math.round(Math.max(...temps)),
        };
      });
  });

  isFavorite = () => {
    const weather = this.current();

    if (!weather) return false;

    return this.favoritesService.isFavorite(
      weather.coord.lat,
      weather.coord.lon,
    );
  };

  toggleFavorite(): void {
    const weather = this.current();

    if (!weather) return;

    this.favoritesService.toggle({
      name: weather.name,
      country: weather.sys.country,
      lat: weather.coord.lat,
      lon: weather.coord.lon,
    });
  }
}
