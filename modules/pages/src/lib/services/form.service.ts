import { Injectable } from '@angular/core';
import { AttributeSerializerService } from 'attributes';
import { PanelPageForm, PanelPageFormPane } from '../models/form.models';

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
      for(let j = 0; j < len2; j++) {
        value = { ...value, [form.panels[i].panes[j].name]: this.serializeFormPane(form.panels[i].panes[j]) };
      }
    }
    return value;
  }
  serializeFormPane(pane: PanelPageFormPane): any {
    return this.attributeSerializer.deserializeAsObject(pane.settings, true);
  }
}
