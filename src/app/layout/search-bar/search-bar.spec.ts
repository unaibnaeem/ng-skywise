import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { SearchBar } from './search-bar';
import { GeocodingResult } from '../../core/models/weather.model';

describe('SearchBar', () => {
  let component: SearchBar;
  let fixture: ComponentFixture<SearchBar>;
  let httpTesting: HttpTestingController;
  let router: Router;

  const mockCities: GeocodingResult[] = [
    {
      name: 'Karachi',
      country: 'PK',
      state: 'Sindh',
      lat: 24.8607,
      lon: 67.0011,
    },
    {
      name: 'Lahore',
      country: 'PK',
      state: 'Punjab',
      lat: 31.5204,
      lon: 74.3587,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBar],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not search when the query has fewer than two characters', fakeAsync(() => {
    component.query.setValue('K');
    tick(300);

    expect(component.loading()).toBeFalse();
    expect(component.suggestions()).toEqual([]);
    expect(component.isOpen()).toBeFalse();
    httpTesting.expectNone((req) => req.url.includes('/geo/1.0/direct'));
  }));

  it('should search after the debounce delay', fakeAsync(() => {
    fixture.destroy();

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.query.setValue('Ka');
    tick(299);

    httpTesting.expectNone((req) => req.url.includes('/geo/1.0/direct'));

    tick(1);

    const request = httpTesting.expectOne((req) =>
      req.url.includes('/geo/1.0/direct'),
    );

    expect(request.request.params.get('q')).toBe('Ka');
    expect(component.loading()).toBeTrue();
    expect(component.isOpen()).toBeTrue();

    request.flush(mockCities);
    tick();

    expect(component.suggestions()).toEqual(mockCities);
    expect(component.loading()).toBeFalse();
  }));

  it('should trim whitespace from the search query', fakeAsync(() => {
    fixture.destroy();

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.query.setValue('  Karachi  ');
    tick(301);

    const request = httpTesting.expectOne((req) =>
      req.url.includes('/geo/1.0/direct'),
    );

    expect(request.request.params.get('q')).toBe('Karachi');
    request.flush([mockCities[0]]);
    tick();
  }));

  it('should display a city with its name, state, and country', () => {
    expect(component.displayCity(mockCities[0])).toBe('Karachi, Sindh, PK');
  });

  it('should display a city without a state', () => {
    const city: GeocodingResult = {
      name: 'Singapore',
      country: 'SG',
      lat: 1.3521,
      lon: 103.8198,
    };

    expect(component.displayCity(city)).toBe('Singapore, SG');
  });

  it('should move the active index down with ArrowDown', () => {
    component.suggestions.set(mockCities);

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    const preventDefault = spyOn(event, 'preventDefault');

    component.onKeydown(event);

    expect(component.activeIndex()).toBe(0);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('should wrap the active index when ArrowDown reaches the end', () => {
    component.suggestions.set(mockCities);
    component.activeIndex.set(1);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));

    expect(component.activeIndex()).toBe(0);
  });

  it('should wrap to the last suggestion with ArrowUp', () => {
    component.suggestions.set(mockCities);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));

    expect(component.activeIndex()).toBe(1);
  });

  it('should close suggestions when Escape is pressed', () => {
    component.isOpen.set(true);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(component.isOpen()).toBeFalse();
  });

  it('should navigate to the selected city coordinates', () => {
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.selectCity(mockCities[0]);

    expect(navigateSpy).toHaveBeenCalledWith(['/weather', 24.8607, 67.0011], {
      state: { city: mockCities[0] },
    });
    expect(component.isOpen()).toBeFalse();
    expect(component.suggestions()).toEqual([]);
    expect(component.query.value).toBe('');
  });

  it('should select the only suggestion when Enter is pressed', () => {
    const selectSpy = spyOn(component, 'selectCity');
    component.suggestions.set([mockCities[0]]);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(selectSpy).toHaveBeenCalledWith(mockCities[0]);
  });

  it('should select the active suggestion when Enter is pressed', () => {
    const selectSpy = spyOn(component, 'selectCity');
    component.suggestions.set(mockCities);
    component.activeIndex.set(1);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(selectSpy).toHaveBeenCalledWith(mockCities[1]);
  });

  it('should handle a geocoding API error', fakeAsync(() => {
    fixture.destroy();

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.query.setValue('Karachi');
    tick(301);

    const request = httpTesting.expectOne((req) =>
      req.url.includes('/geo/1.0/direct'),
    );

    request.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
    tick();

    expect(component.error()).toBe(
      'Unable to search cities. Check your connection.',
    );
    expect(component.suggestions()).toEqual([]);
    expect(component.loading()).toBeFalse();
  }));
});
