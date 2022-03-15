import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PanelPage, PageBuilderFacade } from '@ng-druid/panels';
import { take } from 'rxjs/operators';
import { InlineContext } from '@ng-druid/context';
import { PageStateFormComponent } from '../page-state-form/page-state-form.component';

@Component({
  selector: 'classifieds-ui-page-state-editor',
  //templateUrl: './context-editor.component.html',
  styleUrls: ['./page-state-editor.component.scss'],
  template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-page-state-form formControlName="data" [panelPage]="panelPage" [context]="context"></classifieds-ui-page-state-form></ng-container>`
})
export class PageStateEditorComponent implements OnInit {

  @Input()
  context: InlineContext;

  panelPage: PanelPage;

  @ViewChild(PageStateFormComponent, { static: true }) restSourceFormComp: PageStateFormComponent;

  constructor(
    private fb: FormBuilder, 
    private pageBuilderFacade: PageBuilderFacade,
    public controlContainer: ControlContainer
  ) { }

  ngOnInit(): void {
    (this.controlContainer.control as FormGroup).addControl('adaptor', this.fb.control('data', Validators.required));
    (this.controlContainer.control as FormGroup).addControl('data', this.fb.control(''));
    this.pageBuilderFacade.getPage$.pipe(
      take(1)
    ).subscribe(pp => {
      this.panelPage = pp;
    });
  }

}
