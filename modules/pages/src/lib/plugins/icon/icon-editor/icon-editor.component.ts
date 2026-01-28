import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { Pane } from '@rollthecloudinc/panels';
import { InlineContext } from '@rollthecloudinc/context';
import { IconContentHandler } from '../../../handlers/icon-content.handler';
import { Subject } from 'rxjs';
import { QIcon } from '../../../models/plugin.models';

@Component({
    selector: 'classifieds-ui-icon-editor',
    templateUrl: './icon-editor.component.html',
    styleUrls: ['./icon-editor.component.scss'],
    standalone: false
})
export class IconEditorComponent implements OnInit {

  contexts: Array<string> = [];

  contentForm = this.fb.group({
    iconName: this.fb.control('', [ Validators.required ]),
    label: this.fb.control(''),
    category: this.fb.control('', [ Validators.required ])
  });

  icon: QIcon;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: { panelFormGroup: UntypedFormGroup; pane: Pane; panelIndex: number; paneIndex: number; contexts: Array<InlineContext>; contentAdded: Subject<[number, number]> },
    private dialogRef: MatDialogRef<IconEditorComponent>,
    private fb: UntypedFormBuilder,
    private attributeSerializer: AttributeSerializerService,
    private handler: IconContentHandler
  ) { }

  ngOnInit(): void {
    if(this.dialogData.pane !== undefined) {
        this.handler.toObject(this.dialogData.pane.settings).subscribe((icon: QIcon) => {
            this.icon = icon;
            this.contentForm.get('iconName').patchValue(this.icon.iconName);
            this.contentForm.get('label').patchValue(this.icon.label);
            this.contentForm.get('category').patchValue(this.icon.category);
        });
    }
  }

  onSubmit() {
    let paneIndex: number;
    if(this.dialogData.paneIndex === undefined) {
        (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).push(this.fb.group({
            contentPlugin: new UntypedFormControl('icon'),
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
    const iconName = this.contentForm.get('iconName').value;
    const label = this.contentForm.get('label').value;
    const category = this.contentForm.get('category').value;

    const icon = new QIcon({ iconName, label, category });

    (paneForm.get('settings') as UntypedFormArray).clear();
    const controls = this.handler.buildSettings(icon).map(s => this.attributeSerializer.convertToGroup(s));
    controls.forEach(c => (paneForm.get('settings') as UntypedFormArray).push(c));

    this.dialogRef.close();
  }

}
