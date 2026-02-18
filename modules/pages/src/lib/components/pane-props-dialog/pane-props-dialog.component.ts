import { Component, OnInit, Inject, inject, Injector } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PanePropsFormPayload, UIEditorRole } from '@rollthecloudinc/panels';
import { RegisterRole } from '@rollthecloudinc/utils';

@Component({
    selector: 'classifieds-ui-pane-props-dialog',
    templateUrl: './pane-props-dialog.component.html',
    styleUrls: ['./pane-props-dialog.component.scss'],
    standalone: false
})
@RegisterRole('editor')
export class PanePropsDialogComponent implements OnInit, UIEditorRole<{}> {

  public injector = inject<Injector>(Injector);

  propsForm = this.fb.group({
    name: this.fb.control(this.data.props.name),
    label: this.fb.control(this.data.props.label),
  });

  protected fillContent = {
    name: 'test',
    label: 'Test'
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { props: PanePropsFormPayload },
    private dialogRef: MatDialogRef<PanePropsDialogComponent>,
    private fb: UntypedFormBuilder,
  ) { }

  ngOnInit(): void {
  }

  submit() {
    this.dialogRef.close(new PanePropsFormPayload(this.propsForm.value));
  }

  fill() {
    this.propsForm.patchValue(this.fillContent)
  }

  setFillContent(content: any) {
    this.fillContent = content
  }

}
