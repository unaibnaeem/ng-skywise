import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

@Component({
  standalone: true,
  template: '<p>Home test page</p>',
})
class HomeTestPage {}

@Component({
  standalone: true,
  template: '<p>Favorites test page</p>',
})
class FavoritesTestPage {}

@Component({
  standalone: true,
  template: '<p>Weather test page</p>',
})
class WeatherTestPage {}

const testRoutes: Routes = [
  { path: '', component: HomeTestPage },
  { path: 'favorites', component: FavoritesTestPage },
  { path: 'weather/:lat/:lon', component: WeatherTestPage },
  { path: '**', redirectTo: '' },
];

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the Skywise app header', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Skywise');
  });

  it('should register the home route', () => {
    const router = TestBed.inject(Router);
    expect(router.config.some((route) => route.path === '')).toBeTrue();
  });

  it('should register the favorites route', () => {
    const router = TestBed.inject(Router);
    expect(
      router.config.some((route) => route.path === 'favorites'),
    ).toBeTrue();
  });

  it('should register the weather details route', () => {
    const router = TestBed.inject(Router);
    expect(
      router.config.some((route) => route.path === 'weather/:lat/:lon'),
    ).toBeTrue();
  });

  it('should redirect unknown paths to home', () => {
    const router = TestBed.inject(Router);
    const wildcardRoute = router.config.find((route) => route.path === '**');

    expect(wildcardRoute).toBeDefined();
    expect(wildcardRoute?.redirectTo).toBe('');
  });

  it('should render the router outlet inside the page shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('main.page-shell')).not.toBeNull();
    expect(
      compiled.querySelector('main.page-shell router-outlet'),
    ).not.toBeNull();
  });
});

describe('Route navigation', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(testRoutes)],
    }).compileComponents();
  });

  it('should navigate to the home route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', HomeTestPage);

    expect(harness.routeNativeElement?.textContent).toContain('Home test page');
  });

  it('should navigate to the favorites route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/favorites', FavoritesTestPage);

    expect(harness.routeNativeElement?.textContent).toContain(
      'Favorites test page',
    );
  });

  it('should navigate to the weather details route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/weather/24.86/67.01', WeatherTestPage);

    expect(harness.routeNativeElement?.textContent).toContain(
      'Weather test page',
    );
  });

  it('should redirect an unknown URL to home', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/unknown-path', HomeTestPage);

    expect(harness.routeNativeElement?.textContent).toContain('Home test page');
  });
});
