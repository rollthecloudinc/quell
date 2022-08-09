import { Component, Inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AttributeSerializerService } from "@rollthecloudinc/attributes";
import { InlineContext } from '@rollthecloudinc/context';
import { InteractionsFormPayload } from "../../models/interaction.models";

@Component({
  selector: 'druid-detour-interactions-dialog',
  templateUrl: './interactions-dialog.component.html',
  styleUrls: ['./interactions-dialog.component.scss']
})
export class InteractionsDialogComponent {

  interactionsForm = this.fb.group({
    interactions: this.fb.control('')
  });

  contexts: Array<InlineContext> = [];
  interactions = new InteractionsFormPayload();

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { interactions: InteractionsFormPayload, contexts: Array<InlineContext> },
    private dialogRef: MatDialogRef<InteractionsDialogComponent>,
    private fb: FormBuilder,
    private attributeSerializer: AttributeSerializerService
  ) { 
    this.contexts = data.contexts;
    this.interactions = data.interactions;
  }

  submit() {
    const data = this.interactionsForm.value;
    console.log('interactions form', data);
    // const settings = this.attributeSerializer.serialize(data.dataduct.settings, 'settings');
    // console.log('interactions settings', settings);
    // this.dialogRef.close(new InteractionsFormPayload({ ...this.interactionsForm.value, dataduct: { ...data.dataduct, settings: settings.attributes } }));
  }

}