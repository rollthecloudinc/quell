import { Injectable } from '@angular/core';
import { Observable, of, } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PluginDef, PluginDiscovery, PluginManager} from '@rollthecloudinc/plugin';
import { ValidationPlugin } from '../models/validation.models';
import { ValidationParamsEditorComponent } from '../components/validation-params-editor/validation-params-editor.component';

export class CoreValidationDiscovery implements PluginDiscovery  {
  constructor(
    private pluginManager: PluginManager<ValidationPlugin<string>, string>) {
  }
  loadPlugins(pluginDef: PluginDef, ids: Array<any> = []): Observable<boolean> {
    return of(false).pipe(
      tap(() => this.pluginManager.register(this.makeRequired())),
      map(() => true)
    );
  }
  protected makeRequired(): ValidationPlugin {
    return new ValidationPlugin<string>({ id: 'required', title: 'Required', editor: ValidationParamsEditorComponent });
  }
}
