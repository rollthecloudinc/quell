import { Component, OnInit, Inject } from '@angular/core';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { Rest } from '@rollthecloudinc/datasource';
import { InlineContext } from '@rollthecloudinc/context';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { RestContentHandler } from '../../../handlers/rest-content-handler.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Pane } from '@rollthecloudinc/panels';

@Component({
    selector: 'classifieds-ui-rest-editor',
    templateUrl: './rest-editor.component.html',
    styleUrls: ['./rest-editor.component.scss'],
    standalone: false
})
export class RestEditorComponent implements OnInit {

  panelFormGroup: UntypedFormGroup;

  panes: Array<string> = [];

  rest: Rest;

  contexts: Array<InlineContext> = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: UntypedFormGroup; pane: Pane; panelIndex: number; paneIndex: number; contexts: Array<InlineContext>; contentAdded: Subject<[number, number]> },
    private dialogRef: MatDialogRef<RestEditorComponent>,
    private fb: UntypedFormBuilder,
    private handler: RestContentHandler
  ) {
    this.contexts = this.data.contexts;
  }

  ngOnInit(): void {
    this.panes = (this.data.panelFormGroup.get('panes') as UntypedFormArray).controls.reduce<Array<string>>((p, c) => (c.get('name').value ? [ ...p, c.get('name').value ] : [ ...p ]), []);
    if(this.data.pane !== undefined) {
      this.handler.toObject(this.data.pane.settings).subscribe((rest: Rest) => {
        this.rest = rest;
      });
    }
  }

  submitted(rest: Rest) {
    const panes = (this.data.panelFormGroup.get('panes') as UntypedFormArray);
    if(this.data.paneIndex === undefined) {
      panes.push(this.fb.group({
        contentPlugin: 'rest',
        name: new UntypedFormControl(''),
        label: new UntypedFormControl(''),
        rule: new UntypedFormControl(''),
        settings: this.fb.array(this.handler.buildSettings(rest).map(s => this.convertToGroup(s)))
      }));
      this.data.contentAdded.next([this.data.panelIndex, panes.length - 1]);
    } else {
      const paneForm = panes.at(this.data.paneIndex);
      (paneForm.get('settings') as UntypedFormArray).clear();
      this.handler.buildSettings(rest).forEach(s => {
        (paneForm.get('settings') as UntypedFormArray).push(this.convertToGroup(s))
      });
    }
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
