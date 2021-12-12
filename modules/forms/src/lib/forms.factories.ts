import { ContentPlugin } from "content"
import { StylePlugin } from "panels";
import { FormInputComponent } from './components/form-input/form-input.component';
import { FormSelectComponent } from './components/form-select/form-select.component';
import { FormInputHandler } from "./handlers/form-input.handler";
import { FormSelectHandler } from "./handlers/form-select.handler";
import { FormSectionComponent } from './components/form-section/form-section.component';

export const formInputPluginFactory = ({ handler }: { handler: FormInputHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_input',
    title: 'Form Input',
    selectionComponent: undefined,
    editorComponent: undefined,
    renderComponent: FormInputComponent,
    handler
  })
}

export const formSelectPluginFactory = ({ handler }: { handler: FormSelectHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_select',
    title: 'Form Select',
    selectionComponent: undefined,
    editorComponent: undefined,
    renderComponent: FormSelectComponent,
    handler
  })
}

export const formSectionStylePluginFactory = () => {
  return new StylePlugin<string>({ id: 'form_section', name: 'form_section', title: 'Form Section', editorComponent: undefined, renderComponent: FormSectionComponent });
};