import { ContentPlugin } from '@rollthecloudinc/content'
import { FormlyFieldContentHandler } from "./handlers/formly-field-content.handler";
import { FormlyFieldEditorComponent } from './components/formly-field-editor/formly-field-editor.component';
import { FormlyFieldRendererComponent } from './components/formly-field-renderer/formly-field-renderer.component';
import { FormlyFieldSelectorComponent } from './components/formly-field-selector/formly-field-selector.component';
import { StylePlugin } from '@rollthecloudinc/panels';
import { FormlyRepeatingRendererComponent } from "./components/formly-repeating-renderer/formly-repeating-renderer.component";
import { FormlyRepeatingEditorComponent } from './components/formly-repeating-editor/formly-repeating-editor.component';

export const formlyFieldContentPluginFactory = (handler: FormlyFieldContentHandler) => {
  return new ContentPlugin<string>({
    id: 'formly_field',
    title: 'Formly Field',
    selectionComponent: FormlyFieldSelectorComponent,
    editorComponent: FormlyFieldEditorComponent,
    renderComponent: FormlyFieldRendererComponent,
    handler
  })
}

export const formlyRepeatingStyleFactory = () => {
  return new StylePlugin<string>({ id: 'formly_repeating', name: 'formly_repeating', title: 'Formly Repeating', editorComponent: FormlyRepeatingEditorComponent, renderComponent: FormlyRepeatingRendererComponent });
};