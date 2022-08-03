import { Observable, of, } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PluginDef, PluginDiscovery, PluginManager} from '@rollthecloudinc/plugin';
import { ValidationPlugin, ValidationValidator } from '../models/validation.models';
import { ValidationParamsEditorComponent } from '../components/validation-params-editor/validation-params-editor.component';
import { AbstractControl, Validators } from '@angular/forms';
import { FormsValidationUtils } from '../services/forms-validation-utils.service';

export class CoreValidationDiscovery implements PluginDiscovery  {
  constructor(
    private pluginManager: PluginManager<ValidationPlugin<string>, string>,
    private formsValidationUtils: FormsValidationUtils
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
    return new ValidationPlugin<string>({ id: 'required', title: 'Required', errorMessage: 'Field is required', editor: ValidationParamsEditorComponent, builder: ({ serialized }) => of((c: AbstractControl) => of(Validators.required( this.formsValidationUtils.rebuildControl({ c, serialized }) ))) });
  }
  protected makeRequiredTrue(): ValidationPlugin {
    return new ValidationPlugin<string>({ id: 'required_true', title: 'Required True', errorMessage: 'Field is required', editor: ValidationParamsEditorComponent, builder: ({ serialized }) => of((c: AbstractControl) => of(Validators.requiredTrue( this.formsValidationUtils.rebuildControl({ c, serialized }) ))) });
  }
  protected makeEmail(): ValidationPlugin {
    return new ValidationPlugin<string>({ id: 'email', title: 'Email', errorMessage: 'Invalid email', editor: ValidationParamsEditorComponent, builder: ({ serialized }) => of((c: AbstractControl) => of(Validators.email( this.formsValidationUtils.rebuildControl({ c, serialized }) ))) });
  }
  protected nullValidator(): ValidationPlugin {
    return new ValidationPlugin<string>({ id: 'null', title: 'Null', errorMessage: 'nota', editor: ValidationParamsEditorComponent, builder: ({ serialized }) => of((c: AbstractControl) => of(Validators.nullValidator( this.formsValidationUtils.rebuildControl({ c, serialized }) ))) });
  }
  protected makeMin(): ValidationPlugin {
    return new ValidationPlugin<string>({
      id: 'min', 
      title: 'Min', 
      errorMessage: 'Field min [.min]',
      editor: ValidationParamsEditorComponent, 
      builder: ({ v, serialized }: { v: ValidationValidator, serialized: boolean }) => 
        of(
          (c: AbstractControl) => this.formsValidationUtils.resolveParams({ v }).pipe(
            map(p => Validators.min(+((p as any).min))(this.formsValidationUtils.rebuildControl({ c, serialized })))
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
          (c: AbstractControl) => this.formsValidationUtils.resolveParams({ v }).pipe(
            map(p => Validators.max(+((p as any).max))(this.formsValidationUtils.rebuildControl({ c, serialized })))
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
          (c: AbstractControl) => this.formsValidationUtils.resolveParams({ v }).pipe(
            map(p => Validators.minLength(+((p as any).minLength))(this.formsValidationUtils.rebuildControl({ c, serialized })))
          )
        ) 
    });
  }
  protected makeMaxLength(): ValidationPlugin {
    return new ValidationPlugin<string>({
      id: 'max_length', 
      title: 'Max Length', 
      errorMessage: 'Maximum of [.max] characters',
      editor: ValidationParamsEditorComponent, 
      builder: ({ v, serialized }: { v: ValidationValidator, serialized: boolean }) => 
        of(
          (c: AbstractControl) => this.formsValidationUtils.resolveParams({ v }).pipe(
            map(p => Validators.maxLength(+((p as any).maxLength))(this.formsValidationUtils.rebuildControl({ c, serialized })))
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
          (c: AbstractControl) => this.formsValidationUtils.resolveParams({ v }).pipe(
            map(p => Validators.pattern((new RegExp((p as any).pattern)))(this.formsValidationUtils.rebuildControl({ c, serialized })))
          )
        ) 
    });
  }
}