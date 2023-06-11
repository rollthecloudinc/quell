import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";
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
    private fb: UntypedFormBuilder
  ) { 
    this.contexts = data.contexts;
    this.interactions = data.interactions;
  }

  submit() {
    const payload = new InteractionsFormPayload(this.interactionsForm.value);
    console.log('interactions payload', payload);
    this.dialogRef.close(payload);
  }

}