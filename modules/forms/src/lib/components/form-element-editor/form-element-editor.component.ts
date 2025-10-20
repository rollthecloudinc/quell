import { Component, OnInit, Inject, Input } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormControl, UntypedFormArray, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { ContentPlugin } from '@rollthecloudinc/content';
import { InlineContext } from '@rollthecloudinc/context';
import { Rest, DatasourceOptions, mockDatasourceOptions, mockRest } from '@rollthecloudinc/datasource';
import { FormValidation } from '@rollthecloudinc/ordain';
import { Pane } from '@rollthecloudinc/panels';
import { FormElementHandler } from '../../handlers/form-element.handler';
import { FormSettings } from '../../models/form.models';

@Component({
    selector: 'druid-forms-form-element-editor',
    templateUrl: './form-element-editor.component.html',
    styleUrls: ['./form-element-editor.component.scss'],
    standalone: false
})
export class FormElementEditorComponent implements OnInit {

  // contexts: Array<InlineContext>;

  // rest = mockRest;
  datasourceOptions = mockDatasourceOptions;
  validation: FormValidation = new FormValidation({ validators: [] });
  protected paneIndex: number;
  protected pane: Pane;

  @Input() bindableOptions: Array<string> = [];

  formGroup = this.fb.group({
    // type: this.fb.control('', [ Validators.required ]),
    // key: this.fb.control('', [ Validators.required ]),
    value: this.fb.control('',),
    /*options: this.fb.group({
      label: this.fb.control('')
    }),*/
    // rest: this.fb.control(''),
    datasourceOptions: this.fb.control(''),
    validation: this.fb.control(''),
    datasourceBinding: this.fb.group({
      id: this.fb.control(''),
      type: this.fb.control('pane')
    })
  });

  get paneGroup(): AbstractControl {
    return (this.data.panelFormGroup.get('panes') as UntypedFormArray).at(this.paneIndex);
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: UntypedFormGroup; pane: Pane; paneIndex: number; contexts: Array<InlineContext>, plugin: ContentPlugin },
    private dialogRef: MatDialogRef<FormElementEditorComponent>,
    private fb: UntypedFormBuilder,
    private handler: FormElementHandler,
    private attributeSerializer: AttributeSerializerService
  ) {
    // this.contexts = data.contexts;
    this.paneIndex = data.paneIndex;
    this.pane = data.pane;
  }

  ngOnInit(): void {
    if (this.data.pane) {
      this.handler.toObject(this.data.pane.settings).subscribe(i => {
        // this.formGroup.get('type').setValue(i.type);
        // this.formGroup.get('key').setValue(i.key);
        this.formGroup.get('value').setValue(i.value);
        // this.formGroup.get('options').setValue(i.options ? i.options : { label: '' });
        // this.rest = i.rest ? new Rest({ ...i.rest, params: [] }) : mockRest;
        this.datasourceOptions = i.datasourceOptions ? i.datasourceOptions : mockDatasourceOptions;
        this.validation = i.validation ? new FormValidation(i.validation) : new FormValidation({ validators: [] });
        // this.formGroup.get('datasourceOptions').setValue(i.datasourceOptions ? i.datasourceOptions : mockDatasourceOptions);
        this.formGroup.get('datasourceBinding').get('id').setValue( i.datasourceBinding && i.datasourceBinding.id && i.datasourceBinding.id !== null ? i.datasourceBinding.id : '' );
        // setTimeout(() => this.rest = i.rest ? i.rest : mockRest);
      });
    } else {
      (this.data.panelFormGroup.get('panes') as UntypedFormArray).push(this.fb.group({
        contentPlugin: this.data.plugin.id,
        name: new UntypedFormControl(''),
        label: new UntypedFormControl(''),
        rule: new UntypedFormControl(''),
        settings: this.fb.array([])
      }));
      this.paneIndex = (this.data.panelFormGroup.get('panes') as UntypedFormArray).length - 1;
      this.pane = new Pane((this.data.panelFormGroup.get('panes') as UntypedFormArray).at(this.paneIndex).value);
    }

    this.bindableOptions = (this.data.panelFormGroup.get('panes') as UntypedFormArray).controls.reduce<Array<string>>((p, c) => (c.get('name').value ? [ ...p, c.get('name').value ] : [ ...p ]), []);
    // this.contexts = this.data.contexts.map(c => c.name);
    /*if (this.data.panelIndex !== undefined) {
      const settings = (this.data.panelFormGroup.get('panes') as FormArray).at(this.data.paneIndex).get('settings').value.map(s => new AttributeValue(s));
      this.datasourceHandler.toObject(settings).subscribe(ds => {
        this.datasource = ds;
      });
    }*/
  }

  submit() {
    console.log(this.formGroup.value);
    const instance = new FormSettings(this.formGroup.value);
    console.log(instance);
    // this.paneGroup.get('name').setValue(instance.key);
    // this.paneGroup.get('label').setValue(instance.key);
    (this.paneGroup.get('settings') as UntypedFormArray).clear();
    const controls = this.handler.buildSettings(instance).map(s => this.attributeSerializer.convertToGroup(s));
    controls.forEach(c => (this.paneGroup.get('settings') as UntypedFormArray).push(c));
    this.dialogRef.close();
  }

}