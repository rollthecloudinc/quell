import { ContentPlugin } from '@rollthecloudinc/content'
import { StylePlugin } from '@rollthecloudinc/panels';
import { FormInputComponent } from './components/form-input/form-input.component';
import { FormSelectComponent } from './components/form-select/form-select.component';
import { FormElementHandler } from "./handlers/form-element.handler";
import { FormSectionComponent } from './components/form-section/form-section.component';
import { FormTextareaComponent } from './components/form-textarea/form-textarea.component';
import { FormElementEditorComponent } from "./components/form-element-editor/form-element-editor.component";
import { FormRadiogroupComponent } from "./components/form-radiogroup/form-radiogroup.component";
import { FormSliderComponent } from "./components/form-slider/form-slider.component";
import { FormToggleComponent } from "./components/form-toggle/form-toggle.component";
import { FormCheckboxComponent } from "./components/form-checkbox/form-checkbox.component";
import { FormDatepickerComponent } from "./components/form-datepicker/form-datepicker.component";
import { FormAutocompleteComponent } from "./components/form-autocomplete/form-autocomplete.component";
import { FormMediaComponent } from './components/form-media/form-media.component';
import { FormHiddenComponent } from './components/form-hidden/form-hidden.component';
import { FormSectionEditorComponent } from './components/form-section-editor/form-section-editor.component';
import { FormListboxComponent } from './components/form-listbox/form-listbox.component';

export const formInputPluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_input',
    title: 'Form Input',
    cls: 'form-input',
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
    cls: 'form-select',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormSelectComponent,
    handler
  })
}

export const formListboxPluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_listbox',
    title: 'Form Listbox',
    cls: 'form-listbox',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormListboxComponent,
    handler
  })
}

export const formRadiogroupPluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_radiogroup',
    title: 'Form Radiogroup',
    cls: 'form-radiogroup',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormRadiogroupComponent,
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

export const formSliderPluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_slider',
    title: 'Form Slider',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormSliderComponent,
    handler
  })
}

export const formTogglePluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_toggle',
    title: 'Form Toggle',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormToggleComponent,
    handler
  })
}

export const formCheckboxPluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_checkbox',
    title: 'Form Checkbox',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormCheckboxComponent,
    handler
  })
}

export const formDatepickerPluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_datepicker',
    title: 'Form Datepicker',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormDatepickerComponent,
    handler
  })
}

export const formAutocompletePluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_autocomplete',
    title: 'Form Autocomplete',
    cls: 'form-autocomplete',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormAutocompleteComponent,
    handler
  })
}

export const formMediaPluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_media',
    title: 'Form Media',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormMediaComponent,
    handler
  })
}

export const formHiddenPluginFactory = ({ handler }: { handler: FormElementHandler }) => {
  return new ContentPlugin<string>({
    id: 'form_hidden',
    title: 'Form Hidden',
    selectionComponent: undefined,
    editorComponent: FormElementEditorComponent,
    renderComponent: FormHiddenComponent,
    handler
  })
}

export const formSectionStylePluginFactory = () => {
  return new StylePlugin<string>({ id: 'form_section', name: 'form_section', title: 'Form Section', editorComponent: FormSectionEditorComponent, renderComponent: FormSectionComponent });
};