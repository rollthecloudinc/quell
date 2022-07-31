import { Injectable } from '@angular/core';
import { Observable, of, } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { PluginDef, PluginDiscovery, PluginManager} from '@rollthecloudinc/plugin';
import { Param, ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { ValidationPlugin, ValidationValidator } from '../models/validation.models';
import { ValidationParamsEditorComponent } from '../components/validation-params-editor/validation-params-editor.component';
import { AbstractControl, FormControl, Validators } from '@angular/forms';

export class CoreValidationDiscovery implements PluginDiscovery  {
  constructor(
    private pluginManager: PluginManager<ValidationPlugin<string>, string>,
    private paramEvaluatorService: ParamEvaluatorService,
    private attributesSerializerService: AttributeSerializerService
  ) {
  }
  loadPlugins(pluginDef: PluginDef, ids: Array<any> = []): Observable<boolean> {
    return of(false).pipe(
      tap(() => this.pluginManager.register(this.makeRequired())),
      tap(() => this.pluginManager.register(this.makeMin())),
      map(() => true)
    );
  }
  protected makeRequired(): ValidationPlugin {
    return new ValidationPlugin<string>({ id: 'required', title: 'Required', editor: ValidationParamsEditorComponent, builder: () => of((c: AbstractControl) => of(Validators.required(c))) });
  }
  protected makeMin(): ValidationPlugin {
    return new ValidationPlugin<string>({
      id: 'min', 
      title: 'min', 
      editor: ValidationParamsEditorComponent, 
      builder: ({ v, serialized }: { v: ValidationValidator, serialized: boolean }) => 
        of(
          (c: AbstractControl) => of(undefined).pipe(
            map(() => ({ paramNames: v.paramSettings.paramsString ? v.paramSettings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [] })),
            switchMap(({ paramNames }) => this.paramEvaluatorService.paramValues(v.paramSettings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())).pipe(
              map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
            )),
            map(p => Validators.min(+((p as any).min))(serialized ? new FormControl(this.attributesSerializerService.deserializeAsObject(c.value).value) : c))
          )
        ) 
    });
  }
}