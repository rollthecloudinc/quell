import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { Pane } from '@rollthecloudinc/panels';
import { TimelineNav } from '../../../models/plugin.models';
import { TimelineNavContentHandler } from '../../../handlers/timeline-nav-content.handler';

@Component({
  selector: 'classifieds-ui-timeline-nav-editor',
  templateUrl: './timeline-nav-editor.component.html',
  styleUrls: ['./timeline-nav-editor.component.scss'],
  standalone: false
})
export class TimelineNavEditorComponent implements OnInit {

  contentForm: UntypedFormGroup = this.fb.group({
    group: this.fb.control('')
  });

  nav: TimelineNav;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private dialogData: { panelFormGroup: UntypedFormGroup; pane: Pane; paneIndex?: number },
    private dialogRef: MatDialogRef<TimelineNavEditorComponent>,
    private fb: UntypedFormBuilder,
    private serializer: AttributeSerializerService,
    private handler: TimelineNavContentHandler
  ) {}

  ngOnInit(): void {
    if (this.dialogData.pane) {
      this.handler.toObject(this.dialogData.pane.settings).subscribe(nav => {
        this.nav = nav;
        this.contentForm.get('group')?.patchValue(nav.group);
      });
    }
  }

  onSubmit() {
    const panesArray = this.dialogData.panelFormGroup.get('panes') as UntypedFormArray;

    let paneIndex = this.dialogData.paneIndex;
    if (paneIndex === undefined) {
      panesArray.push(this.fb.group({
        contentPlugin: new UntypedFormControl('timeline_nav'),
        name: new UntypedFormControl(''),
        label: new UntypedFormControl(''),
        rule: new UntypedFormControl(''),
        settings: new UntypedFormArray([])
      }));
      paneIndex = panesArray.length - 1;
    }

    const nav = new TimelineNav({
      group: this.contentForm.get('group')?.value || '__default__'
    });

    const paneForm = panesArray.at(paneIndex);
    const settingsArray = paneForm.get('settings') as UntypedFormArray;

    settingsArray.clear();

    const controlGroups = this.handler.buildSettings(nav).map(a => this.serializer.convertToGroup(a));
    controlGroups.forEach(c => settingsArray.push(c));

    this.dialogRef.close();
  }
}