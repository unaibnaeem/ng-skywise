import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { GeocodingResult } from '../models/weather.model';

import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class GeocodingApi {
  private http = inject(HttpClient);

  search(query: string) {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', 5)
      .set('appid', environment.weatherApiKey);

    return this.http.get<GeocodingResult[]>(
      `${environment.weatherBaseUrl}/geo/1.0/direct`,
      { params },
    );
  }
}
