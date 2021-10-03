import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UrlGeneratorService, Param } from 'durl';

@Injectable({
  providedIn: 'root'
})
export class DatasourceHttpService {

  constructor(
    private urlGeneratorService: UrlGeneratorService
  ) {}

  getUrl(url, params: Array<Param>, metadata: Map<string, any>): Observable<string> {
    return this.urlGeneratorService.getUrl(url, params, metadata);
  } 

}
