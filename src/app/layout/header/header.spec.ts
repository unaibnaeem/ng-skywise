import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { Header } from './header';
import { Favorites } from '../../core/services/favorites';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let favoritesService: Favorites;
  let originalTheme: string | null;
  let originalDarkClass: boolean;

  beforeEach(async () => {
    originalTheme = localStorage.getItem('skywise-theme');
    originalDarkClass = document.documentElement.classList.contains('dark');

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    favoritesService = TestBed.inject(Favorites);
    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (originalTheme === null) {
      localStorage.removeItem('skywise-theme');
    } else {
      localStorage.setItem('skywise-theme', originalTheme);
    }

    document.documentElement.classList.toggle('dark', originalDarkClass);
  });

  function createComponent() {
    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    localStorage.setItem('skywise-theme', 'light');

    createComponent();

    expect(component).toBeTruthy();
  });

  it('should initialize dark mode when the saved theme is dark', () => {
    localStorage.setItem('skywise-theme', 'dark');

    createComponent();

    expect(component.isDark()).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
  });

  it('should initialize light mode when the saved theme is light', () => {
    localStorage.setItem('skywise-theme', 'light');

    createComponent();

    expect(component.isDark()).toBeFalse();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
  });

  it('should use the system preference when no theme is saved', () => {
    localStorage.removeItem('skywise-theme');

    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
    } as MediaQueryList);

    createComponent();

    expect(component.isDark()).toBeTrue();
    expect(window.matchMedia).toHaveBeenCalledWith(
      '(prefers-color-scheme: dark)',
    );
  });

  it('should toggle from light to dark and save the preference', () => {
    localStorage.setItem('skywise-theme', 'light');

    createComponent();
    component.toggleTheme();

    expect(component.isDark()).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
    expect(localStorage.getItem('skywise-theme')).toBe('dark');
  });

  it('should toggle from dark to light and save the preference', () => {
    localStorage.setItem('skywise-theme', 'dark');

    createComponent();
    component.toggleTheme();

    expect(component.isDark()).toBeFalse();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
    expect(localStorage.getItem('skywise-theme')).toBe('light');
  });

  it('should return the number of favorite cities', () => {
    localStorage.setItem('skywise-theme', 'light');

    createComponent();

    expect(component.favoriteCount()).toBe(
      favoritesService.favoriteCities().length,
    );
  });
});
