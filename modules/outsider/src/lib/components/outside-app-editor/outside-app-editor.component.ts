import { Component, OnInit, Inject, Input } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormControl, UntypedFormArray, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { ContentPlugin } from '@rollthecloudinc/content';
import { InlineContext } from '@rollthecloudinc/context';
import { Pane } from '@rollthecloudinc/panels';
import { OutsideAppContentHandler } from '../../handlers/outside-app-content.handler';
import { OutsideAppSettings } from '../../models/outsider.models';

@Component({
  selector: 'druid-outsider-outside-app-editor',
  templateUrl: './outside-app-editor.component.html',
  styleUrls: ['./outside-app-editor.component.scss']
})
export class OutsideAppEditorComponent implements OnInit {

  protected paneIndex: number;
  protected pane: Pane;

  @Input() bindableOptions: Array<string> = [];

  formGroup = this.fb.group({
    type: this.fb.control('module', [ Validators.required ]),
    remoteEntry: this.fb.control('', [ Validators.required ]),
    exposedModule: this.fb.control('', [ Validators.required ]),
    componentName: this.fb.control('', [ Validators.required ]),
    remoteName: this.fb.control('',)
  });

  get paneGroup(): AbstractControl {
    return (this.data.panelFormGroup.get('panes') as UntypedFormArray).at(this.paneIndex);
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: UntypedFormGroup; pane: Pane; paneIndex: number; contexts: Array<InlineContext>, plugin: ContentPlugin },
    private dialogRef: MatDialogRef<OutsideAppEditorComponent>,
    private fb: UntypedFormBuilder,
    private handler: OutsideAppContentHandler,
    private attributeSerializer: AttributeSerializerService
  ) {
    this.paneIndex = data.paneIndex;
    this.pane = data.pane;
  }

  ngOnInit(): void {
    if (this.data.pane) {
      this.handler.toObject(this.data.pane.settings).subscribe(o => {
        this.formGroup.get('type').setValue(o.type && o.type !== '' ? o.type : 'module');
        this.formGroup.get('remoteEntry').setValue(o.remoteEntry);
        this.formGroup.get('exposedModule').setValue(o.exposedModule);
        this.formGroup.get('componentName').setValue(o.componentName);
        this.formGroup.get('remoteName').setValue(o.remoteName);
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
  }

  submit() {
    console.log(this.formGroup.value);
    const instance = new OutsideAppSettings(this.formGroup.value);
    console.log(instance);
    (this.paneGroup.get('settings') as UntypedFormArray).clear();
    const controls = this.handler.buildSettings(instance).map(s => this.attributeSerializer.convertToGroup(s));
    controls.forEach(c => (this.paneGroup.get('settings') as UntypedFormArray).push(c));
    this.dialogRef.close();
  }

}