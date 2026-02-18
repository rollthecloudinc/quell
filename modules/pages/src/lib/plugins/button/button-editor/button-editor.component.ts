import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { Pane } from '@rollthecloudinc/panels';
import { InlineContext } from '@rollthecloudinc/context';
import { ButtonContentHandler } from '../../../handlers/button-content.handler';
import { Subject } from 'rxjs';
import { QButton } from '../../../models/plugin.models';
import { Param, ParamSettings } from '@rollthecloudinc/dparam';

@Component({
    selector: 'classifieds-ui-button-editor',
    templateUrl: './button-editor.component.html',
    styleUrls: ['./button-editor.component.scss'],
    standalone: false
})
export class ButtonEditorComponent implements OnInit {


  contexts: Array<InlineContext> = [];

  paramSettings = new ParamSettings()

  contentForm = this.fb.group({
    text: this.fb.control('', [ Validators.required ]),
    action: this.fb.control(''),
    appearance: this.fb.control(''),
    params: this.fb.control('')
  });

  button: QButton;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: { panelFormGroup: UntypedFormGroup; pane: Pane; panelIndex: number; paneIndex: number; contexts: Array<InlineContext>; contentAdded: Subject<[number, number]> },
    private dialogRef: MatDialogRef<ButtonEditorComponent>,
    private fb: UntypedFormBuilder,
    private attributeSerializer: AttributeSerializerService,
    private handler: ButtonContentHandler
  ) { 
    this.contexts = dialogData.contexts;
  }

  ngOnInit(): void {
    if(this.dialogData.pane !== undefined) {
        this.handler.toObject(this.dialogData.pane.settings).subscribe((button: QButton) => {
            this.button = button;
            this.contentForm.get('text').patchValue(this.button.text);
            if (this.button.appearance) {
              this.contentForm.get('appearance').patchValue(this.button.appearance);
            }
            if (this.button.action) {
                this.contentForm.get('action').patchValue(this.button.action);
            }
            if (this.button.paramsString) {
              this.paramSettings = new ParamSettings({
                paramsString: this.button.paramsString,
                params: this.button.params,});
            }
        });
    }
  }

  onSubmit() {
    let paneIndex: number;
    if(this.dialogData.paneIndex === undefined) {
        (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).push(this.fb.group({
            contentPlugin: new UntypedFormControl('button'),
            name: new UntypedFormControl(''),
            label: new UntypedFormControl(''),
            rule: new UntypedFormControl(''),
            settings: new UntypedFormArray([])
        }));
        paneIndex = (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).length - 1;
    } else {
        paneIndex = this.dialogData.paneIndex;
    }

    const paneForm = (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).at(paneIndex);
    const text = this.contentForm.get('text').value;
    const appearance = this.contentForm.get('appearance').value;
    const action = this.contentForm.get('action').value;
    const params = this.contentForm.get('params').value;
  
    console.log('button editor params', params);

    const button = new QButton({ text, action, appearance, paramsString: params?.paramsString || '', params: params?.params || [] });
    console.log('constructed button', button);

    (paneForm.get('settings') as UntypedFormArray).clear();
    const controls = this.handler.buildSettings(button).map(s => this.attributeSerializer.convertToGroup(s));
    controls.forEach(c => (paneForm.get('settings') as UntypedFormArray).push(c));

    this.dialogRef.close();
  }

  fill() {
    this.contentForm.patchValue({
      text: 'My Button',
      appearance: 'outlined'
    })
  }

}