import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PanelPage } from '../../models/page.models';
import { PropertiesFormPayload } from '../../models/form.models';

@Component({
  selector: 'classifieds-ui-properties-dialog',
  templateUrl: './properties-dialog.component.html',
  styleUrls: ['./properties-dialog.component.scss']
})
export class PropertiesDialogComponent implements OnInit {

  propertiesForm = this.fb.group({
    name: this.fb.control(this.data.props.name),
    title: this.fb.control(this.data.props.title),
    path: this.fb.control(this.data.props.path),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { props: PropertiesFormPayload },
    private dialogRef: MatDialogRef<PropertiesDialogComponent>,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
  }

  submit() {
    this.dialogRef.close(new PropertiesFormPayload(this.propertiesForm.value));
  }

}
