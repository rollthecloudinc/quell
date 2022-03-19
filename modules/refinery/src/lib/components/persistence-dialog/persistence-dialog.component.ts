import { Component, Inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AttributeSerializerService } from "@ng-druid/attributes";
import { PersistenceFormPayload } from "../../models/refinery.models";

@Component({
  selector: 'classifieds-ui-persistence-dialog',
  templateUrl: './persistence-dialog.component.html',
  styleUrls: ['./persistence-dialog.component.scss']
})
export class PersistenceDialogComponent {

  persistenceForm = this.fb.group({
    dataduct: this.fb.control('')
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { payload: PersistenceFormPayload },
    private dialogRef: MatDialogRef<PersistenceDialogComponent>,
    private fb: FormBuilder,
    private attributeSerializer: AttributeSerializerService
  ) { }


  submit() {
    const data = this.persistenceForm.value;
    console.log('persistence form', data);
    const settings = this.attributeSerializer.serialize(data.dataduct.settings, 'settings');
    console.log('persistence settings', settings);
    this.dialogRef.close(new PersistenceFormPayload({ ...this.persistenceForm.value, dataduct: { ...data.dataduct, settings: settings.attributes } }));
  }

}