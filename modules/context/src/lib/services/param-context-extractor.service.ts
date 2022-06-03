import { Injectable } from "@angular/core";
import { Param, ParamPluginManager } from '@rollthecloudinc/dparam';
import { forkJoin, iif, Observable, of } from "rxjs";
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ParamContextExtractorService {

  constructor(
    private ppm: ParamPluginManager
  ) {}

  extractContexts(params: Array<Param>): Observable<Array<string>> {
    return forkJoin(params.map(param => this.ppm.getPlugin(param.mapping.type).pipe(
      switchMap(p => iif(
        () => !!p && !!p.usedContexts,
        p ? p.usedContexts ? p.usedContexts({ param, metadata: new Map<string, any>([]) }) : of([]) : of([]),
        of([])
      ))
    ))).pipe(
      map(c => c.reduce((p, c) => [ ...p, ...c.filter(v => !p.includes(v)) ], []))
    );
  }

}