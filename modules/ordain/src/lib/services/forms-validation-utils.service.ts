import { Injectable } from "@angular/core";
import { AbstractControl, FormControl } from "@angular/forms";
import { Param, ParamEvaluatorService } from "@rollthecloudinc/dparam";
import { AttributeSerializerService } from "@rollthecloudinc/attributes";
import { map, of, switchMap } from "rxjs";
import { ValidationValidator } from "../models/validation.models";

@Injectable({
  providedIn: 'root'
})
export class FormsValidationUtils {

  constructor(
    private paramEvaluatorService: ParamEvaluatorService,
    private attributesSerializerService: AttributeSerializerService
  ) {
  }

  resolveParams({ v }: { v: ValidationValidator }) {
    return of({}).pipe(
      map(() => ({ paramNames: v.paramSettings.paramsString ? v.paramSettings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [] })),
      switchMap(({ paramNames }) => this.paramEvaluatorService.paramValues(v.paramSettings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())).pipe(
        map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
      ))
    );
  }

  rebuildControl({ c, serialized }: { c: AbstractControl, serialized: boolean }) {
    return serialized ? new FormControl(this.attributesSerializerService.deserializeAsObject(c.value).value) : c;
  }

}