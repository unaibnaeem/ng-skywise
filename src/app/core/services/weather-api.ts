import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment.development';
import { CurrentWeather, ForecastResponse } from '../models/weather.model';

@Injectable({
  providedIn: 'root',
})
export class WeatherApi {
  private http = inject(HttpClient);
  private baseUrl = environment.weatherBaseUrl;

  private params(lat: number, lon: number): HttpParams {
    return new HttpParams()
      .set('lat', lat)
      .set('lon', lon)
      .set('units', 'metric')
      .set('appid', environment.weatherApiKey);
  }

  getCurrent(lat: number, lon: number) {
    return this.http.get<CurrentWeather>(`${this.baseUrl}/data/2.5/weather`, {
      params: this.params(lat, lon),
    });
  }

  getForecast(lat: number, lon: number) {
    return this.http.get<ForecastResponse>(
      `${this.baseUrl}/data/2.5/forecast`,
      { params: this.params(lat, lon) },
    );
  }
}
