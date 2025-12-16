import { Component, OnInit } from '@angular/core';
import { FormElementEditorComponent } from '../form-element-editor/form-element-editor.component';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'druid-forms-form-range-editor',
    templateUrl: './form-range-editor.component.html',
    styleUrls: ['./form-range-editor.component.scss'],
    standalone: false
})
export class FormRangeEditorComponent extends FormElementEditorComponent implements OnInit {

 ngOnInit() {
    super.ngOnInit()

    this.formGroup.addControl('min', new FormControl(''))
    this.formGroup.addControl('max', new FormControl(''))
    this.formGroup.addControl('step', new FormControl(''))

    if (this.data.pane) {
      this.handler.toObject(this.data.pane.settings).subscribe(i => {
        console.log('form range editor', i);
        this.formGroup.get('min').patchValue(i.min);
        this.formGroup.get('max').patchValue(i.max);
        this.formGroup.get('step').patchValue(i.step);
      });
    }
 }

}