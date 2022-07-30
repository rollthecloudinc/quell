import { Injectable } from '@angular/core';
import { Observable, of, } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PluginDef, PluginDiscovery, PluginManager} from '@rollthecloudinc/plugin';
import { Param, ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { ValidationPlugin } from '../models/validation.models';
import { ValidationParamsEditorComponent } from '../components/validation-params-editor/validation-params-editor.component';
import { AbstractControl, Validators } from '@angular/forms';

export class CoreValidationDiscovery implements PluginDiscovery  {
  constructor(
    private pluginManager: PluginManager<ValidationPlugin<string>, string>
    //private paramsEvaluatorService: ParamEvaluatorService
  ) {
  }
  loadPlugins(pluginDef: PluginDef, ids: Array<any> = []): Observable<boolean> {
    return of(false).pipe(
      tap(() => this.pluginManager.register(this.makeRequired())),
      map(() => true)
    );
  }
  protected makeRequired(): ValidationPlugin {
    return new ValidationPlugin<string>({ id: 'required', title: 'Required', editor: ValidationParamsEditorComponent, builder: () => of((c: AbstractControl) => of(Validators.required(c))) });
  }
  /*protected makeMin(): ValidationPlugin {
    return new ValidationPlugin<string>({ id: 'min', title: 'min', editor: ValidationParamsEditorComponent, builder: ({ params }: { params: Array<Param> }) => of((c: AbstractControl) => this.paramsEvaluatorService.paramValues(params).pipe(map(p => Validators.min(p.min)(c)))) });
  }*/
}
