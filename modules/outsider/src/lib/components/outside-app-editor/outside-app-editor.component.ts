import { Component, OnInit, Inject, Input } from '@angular/core';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeSerializerService } from 'attributes';
import { ContentPlugin } from 'content';
import { InlineContext } from 'context';
import { Pane } from 'panels';
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
    remoteEntry: this.fb.control('', [ Validators.required ]),
    moduleName: this.fb.control('', [ Validators.required ])
  });

  get paneGroup(): AbstractControl {
    return (this.data.panelFormGroup.get('panes') as FormArray).at(this.paneIndex);
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: FormGroup; pane: Pane; paneIndex: number; contexts: Array<InlineContext>, plugin: ContentPlugin },
    private dialogRef: MatDialogRef<OutsideAppEditorComponent>,
    private fb: FormBuilder,
    private handler: OutsideAppContentHandler,
    private attributeSerializer: AttributeSerializerService
  ) {
    this.paneIndex = data.paneIndex;
    this.pane = data.pane;
  }

  ngOnInit(): void {
    if (this.data.pane) {
      this.handler.toObject(this.data.pane.settings).subscribe(o => {
        this.formGroup.get('remoteEntry').setValue(o.remoteEntry);
        this.formGroup.get('moduleName').setValue(o.moduleName);
      });
    } else {
      (this.data.panelFormGroup.get('panes') as FormArray).push(this.fb.group({
        contentPlugin: this.data.plugin.id,
        name: new FormControl(''),
        label: new FormControl(''),
        rule: new FormControl(''),
        settings: this.fb.array([])
      }));
      this.paneIndex = (this.data.panelFormGroup.get('panes') as FormArray).length - 1;
      this.pane = new Pane((this.data.panelFormGroup.get('panes') as FormArray).at(this.paneIndex).value);
    }

    this.bindableOptions = (this.data.panelFormGroup.get('panes') as FormArray).controls.reduce<Array<string>>((p, c) => (c.get('name').value ? [ ...p, c.get('name').value ] : [ ...p ]), []);
  }

  submit() {
    console.log(this.formGroup.value);
    const instance = new OutsideAppSettings(this.formGroup.value);
    console.log(instance);
    (this.paneGroup.get('settings') as FormArray).clear();
    const controls = this.handler.buildSettings(instance).map(s => this.attributeSerializer.convertToGroup(s));
    controls.forEach(c => (this.paneGroup.get('settings') as FormArray).push(c));
    this.dialogRef.close();
  }

}