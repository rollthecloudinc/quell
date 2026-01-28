import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { Pane } from '@rollthecloudinc/panels';
import { InlineContext } from '@rollthecloudinc/context';
import { LinkContentHandler } from '../../../handlers/link-content.handler';
import { Subject } from 'rxjs';
import { QLink } from '../../../models/plugin.models';

@Component({
    selector: 'classifieds-ui-link-editor',
    templateUrl: './link-editor.component.html',
    styleUrls: ['./link-editor.component.scss'],
    standalone: false
})
export class LinkEditorComponent implements OnInit {

  contexts: Array<string> = [];

  contentForm = this.fb.group({
    text: this.fb.control('',[ Validators.required ]),
    url: this.fb.control('',[ Validators.required ])
  });

  link: QLink;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: { panelFormGroup: UntypedFormGroup; pane: Pane; panelIndex: number; paneIndex: number; contexts: Array<InlineContext>; contentAdded: Subject<[number, number]> },
    private dialogRef: MatDialogRef<LinkEditorComponent>,
    private fb: UntypedFormBuilder,
    private attributeSerializer: AttributeSerializerService,
    private handler: LinkContentHandler
  ) { }

  ngOnInit(): void {
    if(this.dialogData.pane !== undefined) {
        this.handler.toObject(this.dialogData.pane.settings).subscribe((link: QLink) => {
            this.link = link;
            this.contentForm.get('text').patchValue(this.link.text);
            this.contentForm.get('url').patchValue(this.link.url);
        });
    }
  }

  onSubmit() {
    let paneIndex: number;
    if(this.dialogData.paneIndex === undefined) {
        (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).push(this.fb.group({
            contentPlugin: new UntypedFormControl('link'),
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
    const url = this.contentForm.get('url').value;

    const link = new QLink({ text, url });

    (paneForm.get('settings') as UntypedFormArray).clear();
    const controls = this.handler.buildSettings(link).map(s => this.attributeSerializer.convertToGroup(s));
    controls.forEach(c => (paneForm.get('settings') as UntypedFormArray).push(c));

    this.dialogRef.close();
  }

}
