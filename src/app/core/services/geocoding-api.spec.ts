import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { GeocodingApi } from './geocoding-api';
import { GeocodingResult } from '../models/weather.model';
import { environment } from '../../../environments/environment.development';

describe('GeocodingApi', () => {
  let service: GeocodingApi;
  let httpTesting: HttpTestingController;

  const mockResults: GeocodingResult[] = [
    {
      name: 'Karachi',
      country: 'PK',
      state: 'Sindh',
      lat: 24.8607,
      lon: 67.0011,
    },
    {
      name: 'Karachi',
      country: 'US',
      state: 'Texas',
      lat: 29.7386,
      lon: -95.2263,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(GeocodingApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a request to the geocoding endpoint', () => {
    service.search('Karachi').subscribe();

    const request = httpTesting.expectOne(
      (req) => req.url === `${environment.weatherBaseUrl}/geo/1.0/direct`,
    );

    expect(request.request.method).toBe('GET');

    request.flush(mockResults);
  });

  it('should send the query, limit, and API key parameters', () => {
    service.search('Karachi').subscribe();

    const request = httpTesting.expectOne(
      (req) => req.url === `${environment.weatherBaseUrl}/geo/1.0/direct`,
    );

    expect(request.request.params.get('q')).toBe('Karachi');
    expect(request.request.params.get('limit')).toBe('5');
    expect(request.request.params.get('appid')).toBe(environment.weatherApiKey);

    request.flush(mockResults);
  });

  it('should return the geocoding results', () => {
    let result: GeocodingResult[] | undefined;

    service.search('Karachi').subscribe((data) => {
      result = data;
    });

    const request = httpTesting.expectOne(
      (req) => req.url === `${environment.weatherBaseUrl}/geo/1.0/direct`,
    );

    request.flush(mockResults);

    expect(result).toEqual(mockResults);
    expect(result?.length).toBe(2);
    expect(result?.[0].name).toBe('Karachi');
    expect(result?.[0].country).toBe('PK');
    expect(result?.[0].lat).toBe(24.8607);
    expect(result?.[0].lon).toBe(67.0011);
  });

  it('should return an empty array when no locations match', () => {
    let result: GeocodingResult[] | undefined;

    service.search('NoMatchingCity123').subscribe((data) => {
      result = data;
    });

    const request = httpTesting.expectOne(
      (req) => req.url === `${environment.weatherBaseUrl}/geo/1.0/direct`,
    );

    request.flush([]);

    expect(result).toEqual([]);
  });
});
