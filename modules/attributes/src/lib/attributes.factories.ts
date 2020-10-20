import { TextWidgetComponent } from './widgets/text-widget/text-widget.component';
import { AttributeWidget, Attribute, AttributeTypes } from './models/attributes.models';
import { MinMaxWidgetComponent } from './widgets/min-max-widget/min-max-widget.component';
// import { YmmSelectorComponent } from './widgets/ymm-selector/ymm-selector.component';
// import { CitySelectorComponent } from './widgets/city-selector/city-selector.component';

export const textFactory = () => {
  const schema = new Attribute({
    name: '',
    type: AttributeTypes.Text,
    label: '',
    required: false,
    widget: 'text',
    options: {},
    attributes: []
  });
  return new AttributeWidget({ name: 'text', component: TextWidgetComponent, schema });
};

export const minmaxFactory = () => {
  return new AttributeWidget({ name: 'minmax', component: MinMaxWidgetComponent, schema: undefined });
};

/*export const ymmFactory = () => {
  const schema = new Attribute({
    name: '',
    type: AttributeTypes.Complex,
    label: '',
    required: false,
    widget: 'ymm_selector',
    options: {},
    attributes: [
      new Attribute({
        name: 'year',
        type: AttributeTypes.Number,
        label: 'Year',
        required: false,
        widget: '',
        options: {},
        attributes: []
      }),
      new Attribute({
        name: 'make',
        type: AttributeTypes.Text,
        label: 'Make',
        required: false,
        widget: '',
        options: {},
        attributes: []
      }),
      new Attribute({
        name: 'model',
        type: AttributeTypes.Text,
        label: 'Model',
        required: false,
        widget: '',
        options: {},
        attributes: []
      })
    ]
  });
  return new AttributeWidget({ name: 'ymm_selector', component: YmmSelectorComponent, schema });
};*/

/*export const cityFactory = () => {
  const schema = new Attribute({
    name: '',
    type: AttributeTypes.Complex,
    label: '',
    required: false,
    widget: 'city_selector',
    options: {},
    attributes: []
  });
  return new AttributeWidget({ name: 'city_selector', component: CitySelectorComponent, schema });
};*/
