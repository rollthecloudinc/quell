import { ParamPlugin } from "../models/param-plugin.models";
import { Param } from "../models/param.models";
import { ParamPluginManager } from '../services/param-plugin-manager.service';
import { iif, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ParamEvaluatorService {

  constructor(
    private paramPluginManager: ParamPluginManager
  ) {}

  paramValue(param: Param, metadata: Map<string, any>): Observable<string> {
    return this.paramPluginManager.getPlugins().pipe(
      map<Map<string, ParamPlugin<string>>, Array<ParamPlugin<string>>>(plugins => Array.from(plugins).map(([_, p]) => p)),
      map(plugins => plugins.find(p => (p.condition && p.condition({ param, metadata }) || (!p.condition && p.id === param.mapping.type)))),
      switchMap<ParamPlugin<string>, Observable<any>>(p => iif(
        () => !!p,
        p ? p.evalParam({ param, metadata }) : of(/*param.mapping.value*/),
        of(param.mapping.value)
      ))
    );
  }

}