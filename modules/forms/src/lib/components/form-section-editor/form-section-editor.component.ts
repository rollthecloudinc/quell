import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { InlineContext } from '@rollthecloudinc/context';

@Component({
    selector: 'classifieds-form-section-editor',
    templateUrl: './form-section-editor.component.html',
    styleUrls: ['./form-section-editor.component.scss'],
    standalone: false
})
export class FormSectionEditorComponent implements OnInit {

  contexts: Array<InlineContext> = [];
  formGroup = this.fb.group({
    valuesMapping: this.fb.control('')
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: UntypedFormGroup; panelIndex: number; contexts: Array<InlineContext>; },
    private dialogRef: MatDialogRef<FormSectionEditorComponent>,
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