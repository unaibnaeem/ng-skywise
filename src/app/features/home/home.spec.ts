import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Home } from './home';
import { WeatherApi } from '../../core/services/weather-api';
import { RecentCities } from '../../core/services/recent-cities';

import { City, CurrentWeather } from '../../core/models/weather.model';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let recentCitiesSignal: ReturnType<typeof signal<City[]>>;
  let getCurrentSpy: jasmine.Spy;

  const london: City = {
    name: 'London',
    country: 'GB',
    lat: 51.5072,
    lon: -0.1276,
  };

  const paris: City = {
    name: 'Paris',
    country: 'FR',
    lat: 48.8566,
    lon: 2.3522,
  };

  const londonWeather = {
    name: 'London',
    coord: {
      lat: 51.5072,
      lon: -0.1276,
    },
    main: {
      temp: 18,
      feels_like: 17,
      temp_min: 16,
      temp_max: 20,
      pressure: 1012,
      humidity: 65,
    },
    weather: [{ main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
    wind: { speed: 3 },
    clouds: { all: 40 },
    visibility: 10000,
    sys: { country: 'GB', sunrise: 0, sunset: 0 },
    dt: 0,
    timezone: 0,
  } as CurrentWeather;

  beforeEach(async () => {
    recentCitiesSignal = signal<City[]>([]);
    getCurrentSpy = jasmine.createSpy('getCurrent').and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        {
          provide: RecentCities,
          useValue: {
            recentCities: recentCitiesSignal,
          },
        },
        {
          provide: WeatherApi,
          useValue: {
            getCurrent: getCurrentSpy,
          },
        },
      ],
    }).compileComponents();
  });

  function createComponent() {
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
  });

  it('should have no weather cards when there are no recent cities', () => {
    createComponent();

    expect(component.cityWeather()).toEqual([]);
    expect(getCurrentSpy).not.toHaveBeenCalled();
  });

  it('should initialize recent cities with loading state', () => {
    recentCitiesSignal.set([london, paris]);

    getCurrentSpy.and.returnValue(of(null));

    createComponent();

    expect(component.cityWeather().length).toBe(2);
    expect(component.cityWeather().every((item) => item.loading)).toBeFalse();
    expect(getCurrentSpy).toHaveBeenCalledTimes(2);
    expect(getCurrentSpy).toHaveBeenCalledWith(london.lat, london.lon);
    expect(getCurrentSpy).toHaveBeenCalledWith(paris.lat, paris.lon);
  });

  it('should store returned weather for the matching city', () => {
    recentCitiesSignal.set([london]);
    getCurrentSpy.and.returnValue(of(londonWeather));

    createComponent();

    expect(component.cityWeather()).toEqual([
      {
        city: london,
        weather: londonWeather,
        loading: false,
      },
    ]);
  });

  it('should handle a weather request error without throwing', () => {
    recentCitiesSignal.set([london]);
    getCurrentSpy.and.returnValue(
      throwError(() => new Error('Weather request failed')),
    );

    expect(() => createComponent()).not.toThrow();

    expect(component.cityWeather()).toEqual([
      {
        city: london,
        weather: null,
        loading: false,
      },
    ]);
  });
});
