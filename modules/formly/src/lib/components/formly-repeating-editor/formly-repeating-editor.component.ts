import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { InlineContext } from '@rollthecloudinc/context';
import { Pane } from '@rollthecloudinc/panels';

@Component({
  selector: 'classifieds-formly-repeating-editor',
  templateUrl: './formly-repeating-editor.component.html',
  styleUrls: ['./formly-repeating-editor.component.scss']
})
export class FormlyRepeatingEditorComponent implements OnInit {

  contexts: Array<InlineContext> = [];
  formGroup = this.fb.group({
    valuesMapping: this.fb.control('')
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: UntypedFormGroup; panelIndex: number; contexts: Array<InlineContext>; },
    private dialogRef: MatDialogRef<FormlyRepeatingEditorComponent>,
    private fb: UntypedFormBuilder,
    private attributeSerializer: AttributeSerializerService
  ) {
  }

  ngOnInit(): void {
  }

  submit() {
    (this.data.panelFormGroup.get('settings') as UntypedFormArray).clear();
    this.attributeSerializer.serialize(this.formGroup.value, 'root').attributes.forEach(a => {
      console.log('formly repeating editor form');
      console.log(this.attributeSerializer.convertToGroup(a));
      (this.data.panelFormGroup.get('settings') as UntypedFormArray).push(this.attributeSerializer.convertToGroup(a));
    });
  }

}