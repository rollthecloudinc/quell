import { Type } from '@angular/core';
import { Plugin } from '@rollthecloudinc/plugin';
import { Attribute, AttributeValue } from '@rollthecloudinc/attributes';
import { UIRole } from '@rollthecloudinc/utils';

export interface LayoutEditorRole extends UIRole {
  open(): void
  close(): void
  toggle(): void
  openMenu(): void
  toggleMenu(): void
  closeMenu(): void
}

export interface UIRoleLayout extends UIRole {
  addRow(): void
}

export class LayoutPlugin<T = string> extends Plugin<T>  {
  renderer: Type<any>;
  editor: Type<any>;
  settings: Map<string, Array<Attribute>> = new Map<string, Array<Attribute>>();
  constructor(data?: LayoutPlugin<T>) {
    super(data)
    if(data.settings) {
      const attributes = [];
      this.renderer = data.renderer;
      this.editor = data.editor;
      data.settings.forEach((v, k) => {
        attributes.push([k, v.map(a => new Attribute(a))]);
      });
      this.settings = new Map<string, Array<Attribute>>(attributes);
    }
  }
}
