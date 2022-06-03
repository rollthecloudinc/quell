import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { InlineContext } from '@rollthecloudinc/context';
import { ContextModuleFormComponent } from '../context-module-form/context-module-form.component';

@Component({
  selector: 'classifieds-ui-context-module-editor',
  //templateUrl: './context-editor.component.html',
  styleUrls: ['./context-module-editor.component.scss'],
  template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-context-module-form formControlName="data" [context]="context"></classifieds-ui-context-module-form></ng-container>`
})
export class ContextModuleEditorComponent implements OnInit {

  @Input()
  context: InlineContext;

  @ViewChild(ContextModuleFormComponent, { static: true }) contextModuleFormComp: ContextModuleFormComponent;

  constructor(
    private fb: FormBuilder, 
    public controlContainer: ControlContainer
  ) { }

  ngOnInit(): void {
    (this.controlContainer.control as FormGroup).addControl('adaptor', this.fb.control('data', Validators.required));
    (this.controlContainer.control as FormGroup).addControl('data', this.fb.control(''));
  }

}
