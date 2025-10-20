import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { InlineContext } from '@rollthecloudinc/context';
import { ContextStateFormComponent } from '../context-state-form/context-state-form.component';

@Component({
    selector: 'classifieds-ui-context-state-editor',
    //templateUrl: './context-editor.component.html',
    styleUrls: ['./context-state-editor.component.scss'],
    template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-context-state-form formControlName="data" [context]="context"></classifieds-ui-context-state-form></ng-container>`,
    standalone: false
})
export class ContextStateEditorComponent implements OnInit {

  @Input()
  context: InlineContext;

  @ViewChild(ContextStateFormComponent, { static: true }) contextStateFormComp: ContextStateFormComponent;

  constructor(
    private fb: UntypedFormBuilder, 
    public controlContainer: ControlContainer
  ) { }

  ngOnInit(): void {
    (this.controlContainer.control as UntypedFormGroup).addControl('adaptor', this.fb.control('data', Validators.required));
    (this.controlContainer.control as UntypedFormGroup).addControl('data', this.fb.control(''));
  }

}
