import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { WeatherApi } from './weather-api';
import { environment } from '../../../environments/environment.development';
import { CurrentWeather, ForecastResponse } from '../models/weather.model';

describe('WeatherApi', () => {
  let service: WeatherApi;
  let httpMock: HttpTestingController;

  const lat = 24.8607;
  const lon = 67.0011;
  const baseUrl = environment.weatherBaseUrl;

  const mockWeather: CurrentWeather = {
    name: 'Karachi',
    main: {
      temp: 30,
      feels_like: 33,
      humidity: 70,
      pressure: 1005,
    },
    weather: [
      {
        description: 'clear sky',
        icon: '01d',
        main: 'Clear',
      },
    ],
    wind: { speed: 3.5 },
    clouds: { all: 0 },
    visibility: 10000,
    sys: {
      country: 'PK',
      sunrise: 1761000000,
      sunset: 1761040000,
    },
    coord: { lat, lon },
  };

  const mockForecast: ForecastResponse = {
    list: [
      {
        dt: 1761000000,
        main: {
          temp: 30,
          temp_min: 28,
          temp_max: 32,
          humidity: 70,
        },
        weather: [
          {
            description: 'clear sky',
            icon: '01d',
            main: 'Clear',
          },
        ],
        dt_txt: '2026-10-27 12:00:00',
      },
    ],
    city: {
      name: 'Karachi',
      country: 'PK',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(WeatherApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request current weather with the correct parameters', () => {
    service.getCurrent(lat, lon).subscribe();

    const request = httpMock.expectOne(
      (req) => req.url === `${baseUrl}/data/2.5/weather`,
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('lat')).toBe(String(lat));
    expect(request.request.params.get('lon')).toBe(String(lon));
    expect(request.request.params.get('units')).toBe('metric');
    expect(request.request.params.get('appid')).toBe(environment.weatherApiKey);

    request.flush(mockWeather);
  });

  it('should return current weather data from the response', () => {
    service.getCurrent(lat, lon).subscribe((weather) => {
      expect(weather).toEqual(mockWeather);
    });

    const request = httpMock.expectOne(
      (req) => req.url === `${baseUrl}/data/2.5/weather`,
    );

    request.flush(mockWeather);
  });

  it('should request the forecast with the correct parameters', () => {
    service.getForecast(lat, lon).subscribe();

    const request = httpMock.expectOne(
      (req) => req.url === `${baseUrl}/data/2.5/forecast`,
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('lat')).toBe(String(lat));
    expect(request.request.params.get('lon')).toBe(String(lon));
    expect(request.request.params.get('units')).toBe('metric');
    expect(request.request.params.get('appid')).toBe(environment.weatherApiKey);

    request.flush(mockForecast);
  });

  it('should return forecast data from the response', () => {
    service.getForecast(lat, lon).subscribe((forecast) => {
      expect(forecast).toEqual(mockForecast);
    });

    const request = httpMock.expectOne(
      (req) => req.url === `${baseUrl}/data/2.5/forecast`,
    );

    request.flush(mockForecast);
  });
});
