import { Component, inject, signal } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { catchError, of } from "rxjs";

import { RecentCities } from "../../core/services/recent-cities";
import { WeatherApi } from "../../core/services/weather-api";

import { City, CurrentWeather } from "../../core/models/weather.model";

interface RecentCityWeather {
  city: City;
  weather: CurrentWeather | null;
  loading: boolean;
}

@Component({
  selector: "app-home",
  imports: [RouterLink, DecimalPipe],
  templateUrl: "./home.html",
  styleUrl: "./home.css",
})
export class Home {
  private recentCitiesService = inject(RecentCities);
  private weatherApi = inject(WeatherApi);

  recentCities = this.recentCitiesService.recentCities;
  cityWeather = signal<RecentCityWeather[]>([]);

  constructor() {
    this.loadRecentWeather();

    this.recentCitiesService.recentCities().forEach(() => {});
  }

  private loadRecentWeather(): void {
    const cities = this.recentCities();

    if (cities.length === 0) {
      this.cityWeather.set([]);
      return;
    }

    this.cityWeather.set(
      cities.map((city) => ({ city, weather: null, loading: true })),
    );

    cities.forEach((city) => {
      this.weatherApi
        .getCurrent(city.lat, city.lon)
        .pipe(catchError(() => of(null)))
        .subscribe((weather) => {
          this.cityWeather.update((items) =>
            items.map((item) =>
              item.city.lat === city.lat && item.city.lon === city.lon
                ? { ...item, weather, loading: false }
                : item,
            ),
          );
        });
    });
  }
}
