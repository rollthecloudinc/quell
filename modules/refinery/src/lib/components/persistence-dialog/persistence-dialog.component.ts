import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";
import { AttributeSerializerService } from "@rollthecloudinc/attributes";
import { InlineContext } from '@rollthecloudinc/context';
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

  contexts: Array<InlineContext> = [];
  persistence = new PersistenceFormPayload();

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { persistence: PersistenceFormPayload, contexts: Array<InlineContext> },
    private dialogRef: MatDialogRef<PersistenceDialogComponent>,
    private fb: UntypedFormBuilder,
    private attributeSerializer: AttributeSerializerService
  ) { 
    this.contexts = data.contexts;
    this.persistence = data.persistence;
  }


  submit() {
    const data = this.persistenceForm.value;
    console.log('persistence form', data);
    const settings = this.attributeSerializer.serialize(data.dataduct.settings, 'settings');
    console.log('persistence settings', settings);
    this.dialogRef.close(new PersistenceFormPayload({ ...this.persistenceForm.value, dataduct: { ...data.dataduct, settings: settings.attributes } }));
  }

}