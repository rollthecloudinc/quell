import { Component, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RestSourceFormComponent } from '../rest-source-form/rest-source-form.component';

@Component({
  selector: 'classifieds-ui-context-editor',
  //templateUrl: './context-editor.component.html',
  styleUrls: ['./context-editor.component.scss'],
  template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-rest-source-form formControlName="rest"></classifieds-ui-rest-source-form></ng-container>`
})
export class ContextEditorComponent implements OnInit {

  @ViewChild(RestSourceFormComponent, { static: true }) restSourceFormComp: RestSourceFormComponent;

  constructor(private fb: FormBuilder, public controlContainer: ControlContainer) { }

  ngOnInit(): void {
    (this.controlContainer.control as FormGroup).addControl('adaptor', this.fb.control('rest', Validators.required));
    (this.controlContainer.control as FormGroup).addControl('rest', this.fb.control(''));
  }

}
