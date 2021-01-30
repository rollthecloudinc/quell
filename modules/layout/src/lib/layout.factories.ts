import { LayoutPlugin } from './models/layout.models';
import { Attribute, AttributeTypes } from 'attributes';

export const splitLayoutFactory = (): LayoutPlugin<string>  => {
  const settings = new Map<string, Array<Attribute>>([
    [
      'row',
      [
        new Attribute({
          name: 'flexGrow',
          type: AttributeTypes.Text,
          label: 'Flex Grow',
          required: false,
          widget: 'text',
          options: {},
          attributes: []
        }),
        new Attribute({
          name: 'flexShrink',
          type: AttributeTypes.Text,
          label: 'Flex Shrink',
          required: false,
          widget: 'text',
          options: {},
          attributes: []
        }),
        new Attribute({
          name: 'flexBasis',
          type: AttributeTypes.Text,
          label: 'Flex Basis',
          required: false,
          widget: 'text',
          options: {},
          attributes: []
        }),
        new Attribute({
          name: 'height',
          type: AttributeTypes.Text,
          label: 'Height',
          required: false,
          widget: 'text',
          options: {},
          attributes: []
        }),
      ]
    ],
    [
      'column',
      [
        new Attribute({
          name: 'height',
          type: AttributeTypes.Text,
          label: 'Height',
          required: false,
          widget: 'text',
          options: {},
          attributes: []
        }),
      ]
    ],
    /*[
      'global',
      [new Attribute({
        name: 'expanded',
        type: AttributeTypes.Bool,
        label: 'Expanded',
        required: false,
        widget: 'text',
        options: {},
        attributes: []
      })]
    ]*/
  ]);
  return new LayoutPlugin<string>({ id: 'split', title: 'Split', settings });
};

export const gridLayoutFactory = (): LayoutPlugin<string>  => {
  return new LayoutPlugin<string>({ id: 'grid', title: 'Grid', settings: new Map<string, Array<Attribute>>() });
};

export const gridlessLayoutFactory = (): LayoutPlugin<string>  => {
  return new LayoutPlugin<string>({ id: 'gridless', title: 'Gridless', settings: new Map<string, Array<Attribute>>() });
};
