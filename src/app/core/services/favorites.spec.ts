import { TestBed } from '@angular/core/testing';

import { Favorites } from './favorites';
import { City } from '../models/weather.model';

describe('Favorites', () => {
  let service: Favorites;

  const testCity: City = {
    name: 'Karachi',
    country: 'PK',
    lat: 24.8607,
    lon: 67.0011,
  };

  beforeEach(() => {
    localStorage.removeItem('skywise-favorites');

    TestBed.configureTestingModule({});
    service = TestBed.inject(Favorites);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty favorites list', () => {
    expect(service.favoriteCities()).toEqual([]);
  });

  it('should add a city to favorites', () => {
    service.toggle(testCity);

    expect(service.favoriteCities()).toEqual([testCity]);
  });

  it('should identify a city as a favorite', () => {
    service.toggle(testCity);

    expect(service.isFavorite(testCity.lat, testCity.lon)).toBeTrue();
  });

  it('should remove a city from favorites', () => {
    service.toggle(testCity);
    service.remove(testCity.lat, testCity.lon);

    expect(service.favoriteCities()).toEqual([]);
  });

  it('should toggle a city off when it is already a favorite', () => {
    service.toggle(testCity);
    service.toggle(testCity);

    expect(service.favoriteCities()).toEqual([]);
  });

  it('should save favorites to localStorage', () => {
    service.toggle(testCity);

    const saved = JSON.parse(localStorage.getItem('skywise-favorites') ?? '[]');

    expect(saved).toEqual([testCity]);
  });

  it('should load saved favorites from localStorage', () => {
    localStorage.setItem('skywise-favorites', JSON.stringify([testCity]));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(Favorites);

    expect(service.favoriteCities()).toEqual([testCity]);
  });

  it('should handle invalid JSON in localStorage', () => {
    localStorage.setItem('skywise-favorites', '{invalid json');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(Favorites);

    expect(service.favoriteCities()).toEqual([]);
  });
});
