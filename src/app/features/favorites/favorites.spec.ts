import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { Favorites } from './favorites';
import { Favorites as FavoritesService } from '../../core/services/favorites';
import { City } from '../../core/models/weather.model';

describe('Favorites', () => {
  let component: Favorites;
  let fixture: ComponentFixture<Favorites>;
  let favoriteCitiesSignal: ReturnType<typeof signal<City[]>>;
  let removeSpy: jasmine.Spy;

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

  beforeEach(async () => {
    favoriteCitiesSignal = signal<City[]>([]);
    removeSpy = jasmine.createSpy('remove');

    await TestBed.configureTestingModule({
      imports: [Favorites],
      providers: [
        provideRouter([]),
        {
          provide: FavoritesService,
          useValue: {
            favoriteCities: favoriteCitiesSignal,
            remove: removeSpy,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Favorites);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose favorite cities from the service', () => {
    favoriteCitiesSignal.set([london, paris]);

    expect(component.favoriteCities()).toEqual([london, paris]);
  });

  it('should expose an empty list when there are no favorites', () => {
    expect(component.favoriteCities()).toEqual([]);
  });

  it('should remove a favorite using its coordinates', () => {
    component.removeFavorite(london.lat, london.lon);

    expect(removeSpy).toHaveBeenCalledOnceWith(london.lat, london.lon);
  });

  it('should reflect updates to the favorites signal', () => {
    favoriteCitiesSignal.set([london]);

    expect(component.favoriteCities()).toEqual([london]);

    favoriteCitiesSignal.set([paris]);

    expect(component.favoriteCities()).toEqual([paris]);
  });
});
