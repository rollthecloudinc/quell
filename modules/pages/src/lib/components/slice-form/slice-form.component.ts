import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataSlice } from '../../models/plugin.models';
import { InlineContext } from '../../models/context.models';

@Component({
  selector: 'classifieds-ui-slice-form',
  templateUrl: './slice-form.component.html',
  styleUrls: ['./slice-form.component.scss']
})
export class SliceFormComponent implements OnInit {

  @Input()
  contexts: Array<InlineContext> = [];

  @Output()
  submitted = new EventEmitter<DataSlice>();

  sliceForm = this.fb.group({
    context: this.fb.control('', Validators.required),
    query: this.fb.control('', Validators.required),
    plugin: this.fb.control('', Validators.required)
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  submit() {
    const dataSlice = new DataSlice(this.sliceForm.value);
    this.submitted.emit(dataSlice);
  }

}
