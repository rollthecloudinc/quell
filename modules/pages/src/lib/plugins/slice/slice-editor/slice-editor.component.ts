import { Component, OnInit, Inject } from '@angular/core';
import { AttributeValue } from 'attributes';
import { InlineContext } from 'context';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SliceContentHandler } from '../../../handlers/slice-content.handler';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Pane } from '../../../models/page.models';
import { DataSlice } from '../../../models/plugin.models';

@Component({
  selector: 'classifieds-ui-slice-editor',
  templateUrl: './slice-editor.component.html',
  styleUrls: ['./slice-editor.component.scss']
})
export class SliceEditorComponent implements OnInit {

  panelFormGroup: FormGroup;

  contexts: Array<InlineContext> = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: FormGroup; pane: Pane; paneIndex: number; contexts: Array<InlineContext> },
    private dialogRef: MatDialogRef<SliceEditorComponent>,
    private fb: FormBuilder,
    private handler: SliceContentHandler
  ) {
    this.contexts = this.data.contexts;
   }

  ngOnInit(): void {
  }

  submitted(dataSlice: DataSlice) {
    (this.data.panelFormGroup.get('panes') as FormArray).push(this.fb.group({
      contentPlugin: 'slice',
      name: new FormControl(''),
      label: new FormControl(''),
      rule: new FormControl(''),
      settings: this.fb.array(this.handler.buildSettings(dataSlice).map(s => this.convertToGroup(s)))
    }));
    this.dialogRef.close();
  }

  convertToGroup(setting: AttributeValue): FormGroup {

    const fg = this.fb.group({
      name: new FormControl(setting.name, Validators.required),
      type: new FormControl(setting.type, Validators.required),
      displayName: new FormControl(setting.displayName, Validators.required),
      value: new FormControl(setting.value, Validators.required),
      computedValue: new FormControl(setting.value, Validators.required),
      attributes: new FormArray([])
    });

    if(setting.attributes && setting.attributes.length > 0) {
      setting.attributes.forEach(s => {
        (fg.get('attributes') as FormArray).push(this.convertToGroup(s));
      })
    }

    return fg;

  }

}
