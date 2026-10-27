import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Favorites as FavoritesService } from '../../core/services/favorites';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites {
  private favoritesService = inject(FavoritesService);

  favoriteCities = this.favoritesService.favoriteCities;

  removeFavorite(lat: number, lon: number): void {
    this.favoritesService.remove(lat, lon);
  }
}
