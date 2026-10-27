import { TestBed } from '@angular/core/testing';

import { RecentCities } from './recent-cities';
import { City } from '../models/weather.model';
import { inject } from '@angular/core';

describe('RecentCities', () => {
  let service: RecentCities;

  const karachi: City = {
    name: 'Karachi',
    country: 'PK',
    lat: 24.8607,
    lon: 67.0011,
  };

  const lahore: City = {
    name: 'Lahore',
    country: 'PK',
    lat: 31.5204,
    lon: 74.3587,
  };

  beforeEach(() => {
    localStorage.removeItem('skywise-recent-cities');

    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentCities);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty recent cities list', () => {
    expect(service.recentCities()).toEqual([]);
  });

  it('should add a city to recent cities', () => {
    service.add(karachi);

    expect(service.recentCities()).toEqual([karachi]);
  });

  it('should put the newest city first', () => {
    service.add(karachi);
    service.add(lahore);

    expect(service.recentCities()).toEqual([lahore, karachi]);
  });

  it('should not duplicate a city with the same coordinates', () => {
    service.add(karachi);
    service.add(karachi);

    expect(service.recentCities().length).toBe(1);
  });

  it('should move a previously visited city to the front', () => {
    service.add(karachi);
    service.add(lahore);
    service.add(karachi);

    expect(service.recentCities()).toEqual([karachi, lahore]);
  });

  it('should keep only the six most recent cities', () => {
    const cities: City[] = Array.from({ length: 7 }, (_, i) => ({
      name: `City ${i + 1}`,
      country: 'PK',
      lat: 10 + i,
      lon: 60 + i,
    }));

    cities.forEach((city) => service.add(city));

    expect(service.recentCities().length).toBe(6);
    expect(service.recentCities()[0]).toEqual(cities[6]);
    expect(service.recentCities()).not.toContain(cities[0]);
  });

  it('should save recent cities to localStorage', () => {
    service.add(karachi);

    const saved = JSON.parse(
      localStorage.getItem('skywise-recent-cities') ?? '[]',
    );

    expect(saved).toEqual([karachi]);
  });

  it('should load saved recent cities from localStorage', () => {
    localStorage.setItem(
      'skywise-recent-cities',
      JSON.stringify([karachi, lahore]),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentCities);

    expect(service.recentCities()).toEqual([karachi, lahore]);
  });

  it('should handle invalid JSON in localStorage', () => {
    localStorage.setItem('skywise-recent-cities', '{invalid json');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentCities);

    expect(service.recentCities()).toEqual([]);
  });

  it('should ignore invalid city entries when loading saved data', () => {
    localStorage.setItem(
      'skywise-recent-cities',
      JSON.stringify([
        karachi,
        { name: 'Invalid City', lat: 'wrong coordinates' },
      ]),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentCities);

    expect(service.recentCities()).toEqual([karachi]);
  });
});
