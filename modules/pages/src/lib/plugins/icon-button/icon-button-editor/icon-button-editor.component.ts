import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { Pane } from '@rollthecloudinc/panels';
import { InlineContext } from '@rollthecloudinc/context';
import { IconButtonContentHandler } from '../../../handlers/icon-button-content.handler';
import { IconButton } from '../../../models/plugin.models';

@Component({
  selector: 'classifieds-ui-icon-button-editor',
  templateUrl: './icon-button-editor.component.html',
  styleUrls: ['./icon-button-editor.component.scss'],
  standalone: false
})
export class IconButtonEditorComponent implements OnInit {

  contentForm = this.fb.group({
    iconName: this.fb.control('', Validators.required),
    ariaLabel: this.fb.control('', Validators.required),
    action: this.fb.control('')
  });

  iconButton: IconButton;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private dialogData: {
      panelFormGroup: UntypedFormGroup;
      pane: Pane;
      panelIndex: number;
      paneIndex: number;
      contexts: Array<InlineContext>;
    },
    private dialogRef: MatDialogRef<IconButtonEditorComponent>,
    private fb: UntypedFormBuilder,
    private attributeSerializer: AttributeSerializerService,
    private handler: IconButtonContentHandler
  ) { }

  ngOnInit(): void {
    if (this.dialogData.pane !== undefined) {
      this.handler.toObject(this.dialogData.pane.settings).subscribe(button => {
        this.iconButton = button;
        this.contentForm.patchValue({
          iconName: button.iconName,
          ariaLabel: button.ariaLabel,
          action: button.action
        });
      });
    }
  }

  onSubmit() {
    const button = new IconButton({
      iconName: this.contentForm.get('iconName').value,
      ariaLabel: this.contentForm.get('ariaLabel').value,
      action: this.contentForm.get('action').value
    });

    let paneIndex = this.dialogData.paneIndex;
    const panes = this.dialogData.panelFormGroup.get('panes') as any;

    if (paneIndex === undefined) {
      panes.push(this.fb.group({
        contentPlugin: new UntypedFormControl('icon_button'),
        name: new UntypedFormControl(''),
        label: new UntypedFormControl(''),
        rule: new UntypedFormControl(''),
        settings: this.fb.array([])
      }));
      paneIndex = panes.length - 1;
    }

    const paneForm = panes.at(paneIndex);
    const settingsCtrl = paneForm.get('settings') as any;
    settingsCtrl.clear();

    const controls = this.handler.buildSettings(button)
      .map(s => this.attributeSerializer.convertToGroup(s));

    controls.forEach(c => settingsCtrl.push(c));

    this.dialogRef.close();
  }
}