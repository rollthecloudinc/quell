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
      tap(() => this.pluginManager.register(this.makeRequiredTrue())),
      tap(() => {
        this.pluginManager.register(this.makeMin());
        this.pluginManager.register(this.makeMax());
        this.pluginManager.register(this.makeMinLength());
        this.pluginManager.register(this.makeMaxLength());
      }),
      map(() => this.pluginManager.register(this.makeEmail())),
      map(() => this.pluginManager.register(this.makePattern())),
      map(() => this.pluginManager.register(this.nullValidator())),
      map(() => true)
    );
  }
  protected makeRequired(): ValidationPlugin {
    return new ValidationPlugin<string>({ id: 'required', title: 'Required', errorMessage: 'Field is required', editor: ValidationParamsEditorComponent, builder: ({ serialized }) => of((c: AbstractControl) => of(Validators.required( serialized ? new FormControl(this.attributesSerializerService.deserializeAsObject(c.value).value) : c ))) });
  }
  protected makeRequiredTrue(): ValidationPlugin {
    return new ValidationPlugin<string>({ id: 'required_true', title: 'Required True', errorMessage: 'Field is required', editor: ValidationParamsEditorComponent, builder: ({ serialized }) => of((c: AbstractControl) => of(Validators.requiredTrue( serialized ? new FormControl(this.attributesSerializerService.deserializeAsObject(c.value).value) : c ))) });
  }
  protected makeEmail(): ValidationPlugin {
    return new ValidationPlugin<string>({ id: 'email', title: 'Email', errorMessage: 'Invalid email', editor: ValidationParamsEditorComponent, builder: ({ serialized }) => of((c: AbstractControl) => of(Validators.email( serialized ? new FormControl(this.attributesSerializerService.deserializeAsObject(c.value).value) : c ))) });
  }
  protected nullValidator(): ValidationPlugin {
    return new ValidationPlugin<string>({ id: 'null', title: 'Null', errorMessage: 'nota', editor: ValidationParamsEditorComponent, builder: ({ serialized }) => of((c: AbstractControl) => of(Validators.nullValidator( serialized ? new FormControl(this.attributesSerializerService.deserializeAsObject(c.value).value) : c ))) });
  }
  protected makeMin(): ValidationPlugin {
    return new ValidationPlugin<string>({
      id: 'min', 
      title: 'Min', 
      errorMessage: 'Field min [.min]',
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
  protected makeMax(): ValidationPlugin {
    return new ValidationPlugin<string>({
      id: 'max', 
      title: 'Max', 
      errorMessage: 'Field max [.max]',
      editor: ValidationParamsEditorComponent, 
      builder: ({ v, serialized }: { v: ValidationValidator, serialized: boolean }) => 
        of(
          (c: AbstractControl) => of(undefined).pipe(
            map(() => ({ paramNames: v.paramSettings.paramsString ? v.paramSettings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [] })),
            switchMap(({ paramNames }) => this.paramEvaluatorService.paramValues(v.paramSettings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())).pipe(
              map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
            )),
            map(p => Validators.max(+((p as any).max))(serialized ? new FormControl(this.attributesSerializerService.deserializeAsObject(c.value).value) : c))
          )
        ) 
    });
  }
  protected makeMinLength(): ValidationPlugin {
    return new ValidationPlugin<string>({
      id: 'min_length', 
      title: 'Min Length', 
      errorMessage: 'minimum of [.min] characters',
      editor: ValidationParamsEditorComponent, 
      builder: ({ v, serialized }: { v: ValidationValidator, serialized: boolean }) => 
        of(
          (c: AbstractControl) => of(undefined).pipe(
            map(() => ({ paramNames: v.paramSettings.paramsString ? v.paramSettings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [] })),
            switchMap(({ paramNames }) => this.paramEvaluatorService.paramValues(v.paramSettings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())).pipe(
              map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
            )),
            map(p => Validators.minLength(+((p as any).minLength))(serialized ? new FormControl(this.attributesSerializerService.deserializeAsObject(c.value).value) : c))
          )
        ) 
    });
  }
  protected makeMaxLength(): ValidationPlugin {
    return new ValidationPlugin<string>({
      id: 'max_length', 
      title: 'Max Length', 
      errorMessage: 'Maximum of [.min] characters',
      editor: ValidationParamsEditorComponent, 
      builder: ({ v, serialized }: { v: ValidationValidator, serialized: boolean }) => 
        of(
          (c: AbstractControl) => of(undefined).pipe(
            map(() => ({ paramNames: v.paramSettings.paramsString ? v.paramSettings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [] })),
            switchMap(({ paramNames }) => this.paramEvaluatorService.paramValues(v.paramSettings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())).pipe(
              map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
            )),
            map(p => Validators.maxLength(+((p as any).maxLength))(serialized ? new FormControl(this.attributesSerializerService.deserializeAsObject(c.value).value) : c))
          )
        ) 
    });
  }
  protected makePattern(): ValidationPlugin {
    return new ValidationPlugin<string>({
      id: 'pattern', 
      title: 'Pattern', 
      errorMessage: 'Must match pattern',
      editor: ValidationParamsEditorComponent, 
      builder: ({ v, serialized }: { v: ValidationValidator, serialized: boolean }) => 
        of(
          (c: AbstractControl) => of(undefined).pipe(
            map(() => ({ paramNames: v.paramSettings.paramsString ? v.paramSettings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [] })),
            switchMap(({ paramNames }) => this.paramEvaluatorService.paramValues(v.paramSettings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())).pipe(
              map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
            )),
            map(p => Validators.pattern(((p as any).pattern))(serialized ? new FormControl(this.attributesSerializerService.deserializeAsObject(c.value).value) : c))
          )
        ) 
    });
  }
}