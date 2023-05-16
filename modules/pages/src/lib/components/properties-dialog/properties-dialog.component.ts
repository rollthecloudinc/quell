import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PropertiesFormPayload } from '@rollthecloudinc/panels';

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
    cssFile: this.fb.control(this.data.props.cssFile),
    readUserIds: this.fb.array([
      this.fb.group({
        userId: this.fb.control(this.data.props.readUserIds && this.data.props.readUserIds.length > 0 ? this.data.props.readUserIds[0] : '')
      })
    ])
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { props: PropertiesFormPayload },
    private dialogRef: MatDialogRef<PropertiesDialogComponent>,
    private fb: UntypedFormBuilder,
  ) { }

  ngOnInit(): void {
  }

  submit() {
    this.dialogRef.close(new PropertiesFormPayload({ ...this.propertiesForm.value, readUserIds: this.propertiesForm.value.readUserIds.map(id => id.userId) }));
  }

}
