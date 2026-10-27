import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { signal } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

import { WeatherDetails } from './weather-details';
import { RecentCities } from '../../core/services/recent-cities';
import { WeatherApi } from '../../core/services/weather-api';
import { Favorites } from '../../core/services/favorites';

import {
  CurrentWeather,
  ForecastResponse,
} from '../../core/models/weather.model';

describe('WeatherDetails', () => {
  let component: WeatherDetails;
  let fixture: ComponentFixture<WeatherDetails>;
  let paramsSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let getCurrentSpy: jasmine.Spy;
  let getForecastSpy: jasmine.Spy;
  let addRecentSpy: jasmine.Spy;
  let isFavoriteSpy: jasmine.Spy;
  let toggleFavoriteSpy: jasmine.Spy;

  const currentWeather = {
    name: 'London',
    coord: { lat: 51.5072, lon: -0.1276 },
    sys: { country: 'GB', sunrise: 0, sunset: 0 },
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
    dt: 0,
    timezone: 0,
  } as CurrentWeather;

  const forecast = {
    list: [
      {
        dt: 1792929600,
        dt_txt: '2026-10-25 12:00:00',
        main: { temp: 18 },
        weather: [
          { main: 'Clouds', description: 'scattered clouds', icon: '03d' },
        ],
      },
      {
        dt: 1792940400,
        dt_txt: '2026-10-25 15:00:00',
        main: { temp: 20 },
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
      },
      {
        dt: 1793016000,
        dt_txt: '2026-10-26 12:00:00',
        main: { temp: 12 },
        weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
      },
    ],
  } as ForecastResponse;

  beforeEach(async () => {
    paramsSubject = new BehaviorSubject(
      convertToParamMap({ lat: '51.5072', lon: '-0.1276' }),
    );

    getCurrentSpy = jasmine
      .createSpy('getCurrent')
      .and.returnValue(of(currentWeather));

    getForecastSpy = jasmine
      .createSpy('getForecast')
      .and.returnValue(of(forecast));

    addRecentSpy = jasmine.createSpy('add');

    isFavoriteSpy = jasmine.createSpy('isFavorite').and.returnValue(false);
    toggleFavoriteSpy = jasmine.createSpy('toggle');

    await TestBed.configureTestingModule({
      imports: [WeatherDetails],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramsSubject.asObservable() },
        },
        {
          provide: WeatherApi,
          useValue: {
            getCurrent: getCurrentSpy,
            getForecast: getForecastSpy,
          },
        },
        {
          provide: RecentCities,
          useValue: {
            recentCities: signal([]),
            add: addRecentSpy,
          },
        },
        {
          provide: Favorites,
          useValue: {
            isFavorite: isFavoriteSpy,
            toggle: toggleFavoriteSpy,
          },
        },
      ],
    }).compileComponents();
  });

  function createComponent() {
    fixture = TestBed.createComponent(WeatherDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
  });

  it('should load current weather and forecast using route coordinates', () => {
    createComponent();

    expect(getCurrentSpy).toHaveBeenCalledWith(51.5072, -0.1276);
    expect(getForecastSpy).toHaveBeenCalledWith(51.5072, -0.1276);
    expect(component.current()).toEqual(currentWeather);
    expect(component.forecast()).toEqual(forecast);
    expect(component.loading()).toBeFalse();
    expect(component.error()).toBe('');
  });

  it('should add the successfully loaded city to recent cities', () => {
    createComponent();

    expect(addRecentSpy).toHaveBeenCalledWith({
      name: 'London',
      country: 'GB',
      lat: 51.5072,
      lon: -0.1276,
    });
  });

  it('should reload weather when route coordinates change', () => {
    createComponent();

    paramsSubject.next(convertToParamMap({ lat: '48.8566', lon: '2.3522' }));

    expect(getCurrentSpy).toHaveBeenCalledTimes(2);
    expect(getForecastSpy).toHaveBeenCalledTimes(2);
    expect(getCurrentSpy).toHaveBeenCalledWith(48.8566, 2.3522);
    expect(getForecastSpy).toHaveBeenCalledWith(48.8566, 2.3522);
  });

  it('should show an error for invalid coordinates', () => {
    paramsSubject.next(convertToParamMap({ lat: 'invalid', lon: 'invalid' }));

    createComponent();

    expect(component.error()).toBe('Invalid city coordinates.');
    expect(component.loading()).toBeFalse();
    expect(getCurrentSpy).not.toHaveBeenCalled();
    expect(getForecastSpy).not.toHaveBeenCalled();
  });

  it('should handle a weather API failure', () => {
    getCurrentSpy.and.returnValue(
      throwError(() => new Error('Request failed')),
    );

    createComponent();

    expect(component.error()).toBe(
      'Could not load weather. Check your API key and try again.',
    );
    expect(component.current()).toBeNull();
    expect(component.forecast()).toBeNull();
    expect(component.loading()).toBeFalse();
  });

  it('should group forecast entries by date', () => {
    createComponent();

    const days = component.dailyForecast();

    expect(days.length).toBe(2);
    expect(days[0].date).toBe('2026-10-25');
    expect(days[0].min).toBe(18);
    expect(days[0].max).toBe(20);
    expect(days[1].date).toBe('2026-10-26');
    expect(days[1].min).toBe(12);
    expect(days[1].max).toBe(12);
  });

  it('should report whether the current city is a favorite', () => {
    createComponent();

    expect(component.isFavorite()).toBeFalse();
    expect(isFavoriteSpy).toHaveBeenCalledWith(51.5072, -0.1276);

    isFavoriteSpy.and.returnValue(true);

    expect(component.isFavorite()).toBeTrue();
  });

  it('should toggle the current city as a favorite', () => {
    createComponent();

    component.toggleFavorite();

    expect(toggleFavoriteSpy).toHaveBeenCalledWith({
      name: 'London',
      country: 'GB',
      lat: 51.5072,
      lon: -0.1276,
    });
  });

  it('should not toggle a favorite when current weather is unavailable', () => {
    getCurrentSpy.and.returnValue(
      throwError(() => new Error('Request failed')),
    );

    createComponent();
    component.toggleFavorite();

    expect(toggleFavoriteSpy).not.toHaveBeenCalled();
  });
});
