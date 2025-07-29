import { Component, OnInit, Inject } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormControl, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttributeWidget, Attribute, AttributeValue, ATTRIBUTE_WIDGET, AttributeTypes } from '@rollthecloudinc/attributes';
import { Pane } from '@rollthecloudinc/panels';
import { AttributeContentHandler } from '../../../handlers/attribute-content.handler';

@Component({
  selector: 'classifieds-ui-attribute-editor',
  templateUrl: './attribute-editor.component.html',
  styleUrls: ['./attribute-editor.component.scss']
})
export class AttributeEditorComponent implements OnInit {

  widget: AttributeWidget;

  attributes: Array<Attribute> = [];
  attributeValues: Array<AttributeValue> = [];

  attributesFormGroup = this.fb.group({
    name: new UntypedFormControl(''),
    label: new UntypedFormControl(''),
    attributes: new UntypedFormControl('')
  });

  get name() {
    return this.attributesFormGroup.get('name');
  }

  get label() {
    return this.attributesFormGroup.get('label');
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: UntypedFormGroup; pane: Pane; paneIndex: number;  },
    @Inject(ATTRIBUTE_WIDGET) attributeWidgets: Array<AttributeWidget>,
    private dialogRef: MatDialogRef<AttributeEditorComponent>,
    private fb: UntypedFormBuilder,
    private handler: AttributeContentHandler
  ) {
    const widgetSetting = this.data.pane.settings.find(s => s.name === 'widget');
    this.widget = attributeWidgets.find(w => w.name === widgetSetting.value);
  }

  ngOnInit(): void {
    const value = this.data.pane.settings.find(s => s.name === 'value');
    this.attributes = [new Attribute({ ...this.widget.schema, widget: this.widget.name, label: 'Value', name: 'value' })];
    const name = (this.data.panelFormGroup.get('panes') as UntypedFormArray).at(this.data.paneIndex).get('name').value;
    const label = (this.data.panelFormGroup.get('panes') as UntypedFormArray).at(this.data.paneIndex).get('label').value;
    this.attributesFormGroup.get('name').setValue(name);
    this.attributesFormGroup.get('label').setValue(label);
    if(value !== undefined) {
      this.attributeValues = this.handler.valueSettings(this.data.pane.settings);
      console.log(this.attributeValues);
    } else {
      this.attributeValues = [new AttributeValue({
        name: 'value',
        type: this.widget.schema.type,
        displayName: 'Value',
        value: '',
        computedValue: '',
        intValue: 0,
        attributes: []
      })];
    }
  }

  submit() {
    const name = this.name.value;
    const label = this.label.value;
    (this.data.panelFormGroup.get('panes') as UntypedFormArray).at(this.data.paneIndex).get('name').setValue(name);
    (this.data.panelFormGroup.get('panes') as UntypedFormArray).at(this.data.paneIndex).get('label').setValue(label);
    const pane = new Pane({ name, label, contentPlugin: 'attribute', settings: this.attributesFormGroup.get('attributes').value === '' ? [] : this.attributesFormGroup.get('attributes').value });
    if(pane.settings.length !== 0) {
      this.handler.rendererSnippet(this.data.pane.settings).subscribe(r => {
        const renderer = r !== undefined ? this.handler.rendererOverrideSettings(r) : [];
        const formArray = ((this.data.panelFormGroup.get('panes') as UntypedFormArray).at(this.data.paneIndex).get('settings') as UntypedFormArray);
        formArray.clear();
        [ ...this.handler.widgetSettings(this.widget), ...pane.settings, ...renderer].forEach(s => formArray.push(this.convertToGroup(s)));
        this.dialogRef.close();
      });
    } else {
      this.dialogRef.close();
    }
  }

  convertToGroup(setting: AttributeValue): UntypedFormGroup {

    const fg = this.fb.group({
      name: new UntypedFormControl(setting.name, Validators.required),
      type: new UntypedFormControl(setting.type, Validators.required),
      displayName: new UntypedFormControl(setting.displayName, Validators.required),
      value: new UntypedFormControl(setting.value, Validators.required),
      computedValue: new UntypedFormControl(setting.value, Validators.required),
      attributes: new UntypedFormArray([])
    });

    if(setting.attributes && setting.attributes.length > 0) {
      setting.attributes.forEach(s => {
        (fg.get('attributes') as UntypedFormArray).push(this.convertToGroup(s));
      })
    }

    return fg;

  }

}
