import { Component, OnInit, Inject } from '@angular/core';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { InlineContext } from '@rollthecloudinc/context';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { SliceContentHandler } from '../../../handlers/slice-content.handler';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Pane } from '@rollthecloudinc/panels';
import { DataSlice } from '../../../models/plugin.models';

@Component({
  selector: 'classifieds-ui-slice-editor',
  templateUrl: './slice-editor.component.html',
  styleUrls: ['./slice-editor.component.scss']
})
export class SliceEditorComponent implements OnInit {

  panelFormGroup: UntypedFormGroup;

  contexts: Array<InlineContext> = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: UntypedFormGroup; pane: Pane; paneIndex: number; contexts: Array<InlineContext> },
    private dialogRef: MatDialogRef<SliceEditorComponent>,
    private fb: UntypedFormBuilder,
    private handler: SliceContentHandler
  ) {
    this.contexts = this.data.contexts;
   }

  ngOnInit(): void {
  }

  submitted(dataSlice: DataSlice) {
    (this.data.panelFormGroup.get('panes') as UntypedFormArray).push(this.fb.group({
      contentPlugin: 'slice',
      name: new UntypedFormControl(''),
      label: new UntypedFormControl(''),
      rule: new UntypedFormControl(''),
      settings: this.fb.array(this.handler.buildSettings(dataSlice).map(s => this.convertToGroup(s)))
    }));
    this.dialogRef.close();
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
