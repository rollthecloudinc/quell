import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { InlineContext } from 'context';
import { Datasource } from 'datasource';
import { DatasourceContentHandler } from '../../../handlers/datasource-content.handler';
import { Subject } from 'rxjs';
import { Pane } from '../../../models/panels.models';
@Component({
  selector: 'classifieds-ui-datasource-editor',
  templateUrl: './datasource-editor.component.html',
  styleUrls: ['./datasource-editor.component.scss']
})
export class DatasourceEditorComponent implements OnInit {

  datasource: Datasource = new Datasource();

  bindableOptions: Array<string> = [];
  contexts: Array<string> = [];

  formGroup = this.fb.group({
    source: this.fb.control('')
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: FormGroup; pane: Pane; panelIndex: number; paneIndex: number; contexts: Array<InlineContext>; contentAdded: Subject<[number, number]> },
    private dialogRef: MatDialogRef<DatasourceEditorComponent>,
    private fb: FormBuilder,
    private attributeSerializer: AttributeSerializerService,
    private datasourceHandler: DatasourceContentHandler
  ) { }

  ngOnInit(): void {
    const panesArray = this.data.panelFormGroup.get('panes') as FormArray;
    this.bindableOptions = panesArray.controls.reduce<Array<string>>((p, c) => (c.get('name').value ? [ ...p, c.get('name').value ] : [ ...p ]), []);
    this.contexts = this.data.contexts.map(c => c.name);
    if (this.data.panelIndex !== undefined && this.data.paneIndex < panesArray.length) {
      const settings = panesArray.at(this.data.paneIndex).get('settings').value.map(s => new AttributeValue(s));
      this.datasourceHandler.toObject(settings).subscribe(ds => {
        this.datasource = ds;
      });
    }
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
    this.dialogRef.close();
  }

}
