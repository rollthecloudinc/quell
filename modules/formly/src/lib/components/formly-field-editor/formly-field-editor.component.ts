import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeSerializerService } from 'attributes';
import { Pane } from 'panels';
import { FormlyFieldContentHandler } from '../../handlers/formly-field-content.handler';
import { FormlyFieldInstance } from '../../models/formly.models';
@Component({
  selector: 'classifieds-formly-field-editor',
  templateUrl: './formly-field-editor.component.html',
  styleUrls: ['./formly-field-editor.component.scss']
})
export class FormlyFieldEditorComponent implements OnInit {

  formGroup = this.fb.group({
    type: this.fb.control(this.data.instance.type, [ Validators.required ]),
    key: this.fb.control(this.data.instance.key, [ Validators.required ])
  });

  get paneGroup(): AbstractControl {
    return (this.data.panelFormGroup.get('panes') as FormArray).at(this.data.paneIndex);
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: FormGroup; pane: Pane; paneIndex: number; instance: FormlyFieldInstance },
    private dialogRef: MatDialogRef<FormlyFieldEditorComponent>,
    private fb: FormBuilder,
    private handler: FormlyFieldContentHandler,
    private attributeSerializer: AttributeSerializerService
  ) {}

  ngOnInit(): void {
  }

  submit() {
    const instance = new FormlyFieldInstance(this.formGroup.value);
    this.paneGroup.get('name').setValue(instance.key);
    this.paneGroup.get('label').setValue(instance.key);
    (this.paneGroup.get('settings') as FormArray).clear();
    const controls = this.handler.buildSettings(instance).map(s => this.attributeSerializer.convertToGroup(s));
    controls.forEach(c => (this.paneGroup.get('settings') as FormArray).push(c));
    this.dialogRef.close();
  }

}