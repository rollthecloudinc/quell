import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PanelPropsFormPayload } from '../../models/form.models';

@Component({
  selector: 'classifieds-ui-panel-props-dialog',
  templateUrl: './panel-props-dialog.component.html',
  styleUrls: ['./panel-props-dialog.component.scss']
})
export class PanelPropsDialogComponent implements OnInit {

  propsForm = this.fb.group({
    name: this.fb.control(this.data.props.name),
    label: this.fb.control(this.data.props.label),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { props: PanelPropsFormPayload },
    private dialogRef: MatDialogRef<PanelPropsDialogComponent>,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
  }

  submit() {
    this.dialogRef.close(new PanelPropsFormPayload(this.propsForm.value));
  }

}
