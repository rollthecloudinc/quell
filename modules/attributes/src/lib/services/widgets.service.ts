import { Injectable, Inject } from '@angular/core';
import { ATTRIBUTE_WIDGET } from '../attribute.tokens';
import { AttributeWidget } from '../models/attributes.models';

@Injectable()
export class WidgetsService {
  constructor(@Inject(ATTRIBUTE_WIDGET) private widgets: Array<AttributeWidget>) { }
  get(widget: string): AttributeWidget {
    return this.widgets.find(w => w.name === widget);
  }
}
