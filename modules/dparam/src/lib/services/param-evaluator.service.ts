import { ParamPlugin } from "../models/param-plugin.models";
import { Param } from "../models/param.models";
import { ParamPluginManager } from '../services/param-plugin-manager.service';
import { forkJoin, iif, Observable, of } from "rxjs";
import { defaultIfEmpty, map, switchMap } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { TokenizerService } from "token";

@Injectable({
  providedIn: 'root'
})
export class ParamEvaluatorService {

  constructor(
    private paramPluginManager: ParamPluginManager,
    private tokenizerService: TokenizerService
  ) {}

  paramValue(param: Param, metadata: Map<string, any>): Observable<string> {
    return this.paramPluginManager.getPlugins().pipe(
      map<Map<string, ParamPlugin<string>>, Array<ParamPlugin<string>>>(plugins => Array.from(plugins).map(([_, p]) => p)),
      map(plugins => plugins.find(p => (p.condition && p.condition({ param, metadata }) || (!p.condition && p.id === param.mapping.type)))),
      switchMap<ParamPlugin<string>, Observable<any>>(p => iif(
        () => !!p,
        p ? p.evalParam({ param, metadata }) : of(/*param.mapping.value*/),
        of(param.mapping.value)
      )),
      map(v => param.mapping.value && typeof(v) === 'string' && this.tokenizerService.discoverTokens(v).length === 0 ? v : param.mapping.testValue)
    );
  }

  paramValues(params: Map<string, Param>): Observable<Map<string, string>> {
    return forkJoin(
      Array.from(params.keys()).map(name => this.paramValue(params.get(name), new Map<string, any>()).pipe(
        map<string, [string, string]>(v => [ name, v ])
      ))
    ).pipe(
      map(groups => groups.reduce((p, c) => new Map<string, string>([ ...p, c ]), new Map<string, string>())),
      defaultIfEmpty(new Map<string, string>())
    );
  }

}

