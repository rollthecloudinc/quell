import { Injectable } from '@angular/core';
import { AttributeSerializerService } from '@ng-druid/attributes';
import { PanelPageForm, PanelPageFormPane } from '../models/form.models';
import { pluralize } from 'inflected';
@Injectable({
  providedIn: 'root'
})
export class FormService {
  constructor(private attributeSerializer: AttributeSerializerService) { }
  serializeForm(form: PanelPageForm): any {
    const len = form.panels.length;
    let value = {};
    for(let i = 0; i < len; i++) {
      const len2 = form.panels[i].panes.length;
      // const dsPanes = form.panels[i].panes.map(p => p.contentPlugin === 'datasource' ? this.attributeSerializer.deserializeAsObject(p.settings) : undefined).filter(s => s !== undefined).map(s => s.settings.renderer.contentBindings.map(b => b.id)).reduce((p, c) => [...p, ...c],[]);
      const dsValues = new Map<string, Array<any>>();
      for(let j = 0; j < len2; j++) {
        const serializedValue = this.serializeFormPane(form.panels[i].panes[j]);
        if (form.panels[i].panes[j].name && form.panels[i].panes[j].name !== null && (value[form.panels[i].panes[j].name] || form.panels[i].panes[j].name === pluralize(form.panels[i].panes[j].name) )) {
          if (!dsValues.has(form.panels[i].panes[j].name)) {
            dsValues.set(form.panels[i].panes[j].name, typeof(value[form.panels[i].panes[j].name]) !== 'undefined' ? [ value[form.panels[i].panes[j].name] ] : [] );
          }
          const arrayValues = dsValues.get(form.panels[i].panes[j].name);
          dsValues.set(form.panels[i].panes[j].name, [ ...arrayValues, serializedValue ]);
        } else {
          if (form.panels[i].panes[j].name && form.panels[i].panes[j].name !== '') {
            value = { ...value, [form.panels[i].panes[j].name]: serializedValue };
          } else {
            value = { ...value, ...serializedValue };
          }
        }
      }
      Array.from(dsValues).forEach(([k, v]) => value[k] = v);
    }
    return value;
  }
  serializeFormPane(pane: PanelPageFormPane): any {
    if (pane.contentPlugin === 'panel') {
      return this.serializeForm(new PanelPageForm(this.attributeSerializer.deserializeAsObject(pane.settings, true)));
    } else {
      const value = this.attributeSerializer.deserializeAsObject(pane.settings, true);
      return value !== undefined ? value.value : undefined;
    }
  }
}
