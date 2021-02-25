import { LayoutPlugin } from './models/layout.models';
import { Attribute, AttributeTypes } from 'attributes';
import { GridlessLayoutEditorComponent } from './components/gridless-layout-editor/gridless-layout-editor.component';
import { GridlessLayoutRendererComponent } from './components/gridless-layout-renderer/gridless-layout-renderer.component';
import { SplitLayoutEditorComponent } from './components/split-layout-editor/split-layout-editor.component';
import { FlexLayoutRendererComponent } from './components/flex-layout-renderer/flex-layout-renderer.component';
import { GridLayoutEditorComponent } from './components/grid-layout-editor/grid-layout.editor.component';

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
  return new LayoutPlugin<string>({ id: 'split', title: 'Split', editor: SplitLayoutEditorComponent, renderer: FlexLayoutRendererComponent, settings });
};

export const gridLayoutFactory = (): LayoutPlugin<string>  => {
  return new LayoutPlugin<string>({ id: 'grid', title: 'Grid', editor: GridLayoutEditorComponent, renderer: undefined, settings: new Map<string, Array<Attribute>>() });
};

export const gridlessLayoutFactory = (): LayoutPlugin<string>  => {
  return new LayoutPlugin<string>({ id: 'gridless', title: 'Gridless', editor: GridlessLayoutEditorComponent, renderer: GridlessLayoutRendererComponent, settings: new Map<string, Array<Attribute>>() });
};
