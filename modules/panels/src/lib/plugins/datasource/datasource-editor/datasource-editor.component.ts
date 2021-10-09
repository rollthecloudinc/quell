import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeSerializerService } from 'attributes';
import { InlineContext } from 'context';
import { Subject } from 'rxjs';
import { Pane } from '../../../models/panels.models';
@Component({
  selector: 'classifieds-ui-datasource-editor',
  templateUrl: './datasource-editor.component.html',
  styleUrls: ['./datasource-editor.component.scss']
})
export class DatasourceEditorComponent implements OnInit {

  bindableOptions: Array<string> = [];

  formGroup = this.fb.group({
    source: this.fb.control('')
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: FormGroup; pane: Pane; panelIndex: number; paneIndex: number; contexts: Array<InlineContext>; contentAdded: Subject<[number, number]> },
    private fb: FormBuilder,
    private attributeSerializer: AttributeSerializerService 
  ) { }

  ngOnInit(): void {
    this.bindableOptions = (this.data.panelFormGroup.get('panes') as FormArray).controls.reduce<Array<string>>((p, c) => (c.get('name').value ? [ ...p, c.get('name').value ] : [ ...p ]), []);
  }

  onSubmit() {
    const sourceSettings = this.attributeSerializer.serialize(this.formGroup.value.source, 'source')
    const paneForm = (this.data.panelFormGroup.get('panes') as FormArray).at(this.data.paneIndex);
    if(this.data.paneIndex === undefined) {
      (this.data.panelFormGroup.get('panes') as FormArray).push(this.fb.group({
        contentPlugin: 'datasource',
        name: new FormControl(''),
        label: new FormControl(''),
        rule: new FormControl(''),
        settings: this.fb.array(sourceSettings.attributes.map(a => this.attributeSerializer.convertToGroup(a)))
      }));
      console.log(this.data.panelFormGroup.get('panes').value);
    } else {
      (paneForm.get('settings') as FormArray).clear();
      sourceSettings.attributes.forEach(a => (paneForm.get('settings') as FormArray).push(this.attributeSerializer.convertToGroup(a)));
    }
  }

}
