import { ContentPlugin } from "content"
import { StylePlugin } from "panels";
import { FormInputComponent } from './components/form-input/form-input.component';
import { FormSelectComponent } from './components/form-select/form-select.component';
import { FormElementHandler } from "./handlers/form-element.handler";
import { FormSectionComponent } from './components/form-section/form-section.component';
import { FormTextareaComponent } from './components/form-textarea/form-textarea.component';
import { FormElementEditorComponent } from "./components/form-element-editor/form-element-editor.component";

export const formInputPluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_input',
    title: 'Form Input',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormInputComponent,
    handler
  })
}

export const formSelectPluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_select',
    title: 'Form Select',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormSelectComponent,
    handler
  })
}

export const formTextareaPluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_textarea',
    title: 'Form Textarea',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormTextareaComponent,
    handler
  })
}

export const formSectionStylePluginFactory = () => {
  return new StylePlugin<string>({ id: 'form_section', name: 'form_section', title: 'Form Section', editorComponent: undefined, renderComponent: FormSectionComponent });
};