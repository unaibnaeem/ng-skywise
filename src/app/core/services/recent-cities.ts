import { Injectable, signal } from '@angular/core';

import { City } from '../models/weather.model';

const STORAGE_KEY = 'skywise-recent-cities';
const MAX_RECENT_CITIES = 6;

@Injectable({
  providedIn: 'root',
})
export class RecentCities {
  private readonly cities = signal<City[]>(this.loadCities());

  readonly recentCities = this.cities.asReadonly();

  add(city: City): void {
    const key = (item: City) => `${item.lat.toFixed(4)},${item.lon.toFixed(4)}`;

    const updated = [
      city,
      ...this.cities().filter((item) => key(item) !== key(city)),
    ].slice(0, MAX_RECENT_CITIES);

    this.cities.set(updated);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      //
    }
  }

  private loadCities(): City[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return [];
      }

      const parsed: unknown = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter(
          (item): item is City =>
            typeof item?.name === 'string' &&
            typeof item?.country === 'string' &&
            typeof item?.lat === 'number' &&
            typeof item?.lon === 'number',
        )
        .slice(0, MAX_RECENT_CITIES);
    } catch {
      return [];
    }
  }
}
