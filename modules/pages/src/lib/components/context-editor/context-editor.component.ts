import { Component, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { RestSourceFormComponent } from '@rollthecloudinc/rest';

@Component({
    selector: 'classifieds-ui-context-editor',
    //templateUrl: './context-editor.component.html',
    styleUrls: ['./context-editor.component.scss'],
    template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-rest-source-form formControlName="rest"></classifieds-ui-rest-source-form></ng-container>`,
    standalone: false
})
export class ContextEditorComponent implements OnInit {

  @ViewChild(RestSourceFormComponent, { static: true }) restSourceFormComp: RestSourceFormComponent;

  constructor(private fb: UntypedFormBuilder, public controlContainer: ControlContainer) { }

  ngOnInit(): void {
    (this.controlContainer.control as UntypedFormGroup).addControl('adaptor', this.fb.control('rest', Validators.required));
    (this.controlContainer.control as UntypedFormGroup).addControl('rest', this.fb.control(''));
  }

}
