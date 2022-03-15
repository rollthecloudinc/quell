import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeSerializerService } from '@ng-druid/attributes';
import { InlineContext } from '@ng-druid/context';
import { Pane } from '@ng-druid/panels';

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
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: FormGroup; panelIndex: number; contexts: Array<InlineContext>; },
    private dialogRef: MatDialogRef<FormlyRepeatingEditorComponent>,
    private fb: FormBuilder,
    private attributeSerializer: AttributeSerializerService
  ) {
  }

  ngOnInit(): void {
  }

  submit() {
    (this.data.panelFormGroup.get('settings') as FormArray).clear();
    this.attributeSerializer.serialize(this.formGroup.value, 'root').attributes.forEach(a => {
      console.log('formly repeating editor form');
      console.log(this.attributeSerializer.convertToGroup(a));
      (this.data.panelFormGroup.get('settings') as FormArray).push(this.attributeSerializer.convertToGroup(a));
    });
  }

}