import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DefaultDataServiceConfig } from '@ngrx/data';
import { Observable, of } from 'rxjs';
import { map, tap, delay, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DatasourceApiService {
  private cache = new Map<string, Array<any>>();
  constructor(private config: DefaultDataServiceConfig, private http: HttpClient) { }
  getData(url: string): Observable<Array<any>> {
    if(this.cache.has(url)) {
      return of(this.cache.get(url)).pipe(delay(0));
    } else {
      return this.http.get<Array<any>>(`${url}`).pipe(
        catchError(() => of([])),
        map(data => Array.isArray(data) ? data: [data]),
        tap(data => this.cache.set(url, data))
      );
    }
  }
  postData({ url, body = '' }: {url: string, body?: any} ): Observable<Array<any>> {
    return this.http.post<Array<any>>(`${url}`, body).pipe(
      map(data => Array.isArray(data) ? data: [data])
    );
  }
}
