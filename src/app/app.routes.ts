import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites').then((m) => m.Favorites),
  },
  {
    path: 'weather/:lat/:lon',
    loadComponent: () =>
      import('./features/weather-details/weather-details').then(
        (m) => m.WeatherDetails,
      ),
  },
  { path: '**', redirectTo: '' },
];
