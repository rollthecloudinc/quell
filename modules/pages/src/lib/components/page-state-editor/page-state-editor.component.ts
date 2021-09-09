import { Component, OnInit } from '@angular/core';
import { ControlContainer, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'classifieds-ui-page-state-editor',
  //templateUrl: './context-editor.component.html',
  styleUrls: ['./page-state-editor.component.scss'],
  templateUrl: './page-state-editor.component.html'
  // template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-rest-source-form formControlName="rest"></classifieds-ui-rest-source-form></ng-container>`
})
export class PageStateEditorComponent implements OnInit {

  constructor(private fb: FormBuilder, public controlContainer: ControlContainer) { }

  ngOnInit(): void {
  }

}
