import { Injectable, signal } from '@angular/core';
import { City } from '../models/weather.model';

const STORAGE_KEY = 'skywise-favorites';

@Injectable({
  providedIn: 'root',
})
export class Favorites {
  private readonly cities = signal<City[]>(this.loadCities());

  readonly favoriteCities = this.cities.asReadonly();

  isFavorite(lat: number, lon: number): boolean {
    return this.cities().some(
      (city) =>
        Math.abs(city.lat - lat) < 0.0001 && Math.abs(city.lon - lon) < 0.0001,
    );
  }

  toggle(city: City): void {
    if (this.isFavorite(city.lat, city.lon)) {
      this.remove(city.lat, city.lon);
      return;
    }

    this.save([...this.cities(), city]);
  }

  remove(lat: number, lon: number): void {
    this.save(
      this.cities().filter(
        (city) =>
          Math.abs(city.lat - lat) >= 0.0001 ||
          Math.abs(city.lon - lon) >= 0.0001,
      ),
    );
  }

  private save(cities: City[]): void {
    this.cities.set(cities);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
    } catch {
      //
    }
  }

  private loadCities(): City[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];

      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (item): item is City =>
          typeof item?.name === 'string' &&
          typeof item?.country === 'string' &&
          typeof item?.lat === 'number' &&
          typeof item?.lon === 'number',
      );
    } catch {
      return [];
    }
  }
}
