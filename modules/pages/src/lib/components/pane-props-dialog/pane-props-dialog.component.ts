import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PanePropsFormPayload } from 'panels';

@Component({
  selector: 'classifieds-ui-pane-props-dialog',
  templateUrl: './pane-props-dialog.component.html',
  styleUrls: ['./pane-props-dialog.component.scss']
})
export class PanePropsDialogComponent implements OnInit {

  propsForm = this.fb.group({
    name: this.fb.control(this.data.props.name),
    label: this.fb.control(this.data.props.label),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { props: PanePropsFormPayload },
    private dialogRef: MatDialogRef<PanePropsDialogComponent>,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
  }

  submit() {
    this.dialogRef.close(new PanePropsFormPayload(this.propsForm.value));
  }

}
