import { LayoutPlugin } from './models/layout.models';
import { Attribute, AttributeTypes } from 'attributes';

export const splitLayoutFactory = (): LayoutPlugin<string>  => {
  const settings = new Map<string, Array<Attribute>>([
    [
      'row',
      [new Attribute({
        name: 'expanded',
        type: AttributeTypes.Bool,
        label: 'Expanded',
        required: false,
        widget: 'text',
        options: {},
        attributes: []
      })]
    ]
  ]);
  return new LayoutPlugin<string>({ id: 'split', title: 'Split', settings });
};

export const gridLayoutFactory = (): LayoutPlugin<string>  => {
  return new LayoutPlugin<string>({ id: 'grid', title: 'Grid', settings: new Map<string, Array<Attribute>>() });
};

export const gridlessLayoutFactory = (): LayoutPlugin<string>  => {
  return new LayoutPlugin<string>({ id: 'gridless', title: 'Gridless', settings: new Map<string, Array<Attribute>>() });
};
