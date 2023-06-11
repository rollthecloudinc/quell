import { Component, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { Datasource, DatasourceFormComponent } from '@rollthecloudinc/datasource';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'classifieds-ui-datasource-context-editor',
  //templateUrl: './context-editor.component.html',
  // styleUrls: ['./datasource-editor.component.scss'],
  template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-datasource-form formControlName="_proxy"></classifieds-ui-datasource-form></ng-container>`
})
export class DatasourceContextEditorComponent implements OnInit {

  private proxyControlSub: Subscription;
  // datasource = new Datasource();

  @ViewChild(DatasourceFormComponent, { static: true }) datasourceFormComp: DatasourceFormComponent;

  constructor(
    private fb: UntypedFormBuilder, 
    public controlContainer: ControlContainer,
    private attributeSerializer: AttributeSerializerService
  ) { }

  ngOnInit(): void {
    (this.controlContainer.control as UntypedFormGroup).addControl('adaptor', this.fb.control('datasource', Validators.required));
    (this.controlContainer.control as UntypedFormGroup).addControl('datasource', this.fb.control(''));
    (this.controlContainer.control as UntypedFormGroup).addControl('_proxy', this.fb.control(''));
    this.proxyControlSub = (this.controlContainer.control as UntypedFormGroup).get('_proxy').valueChanges.pipe(
      map(v => v ? new Datasource({ ...v, settings: this.attributeSerializer.serialize(v.settings, 'settings').attributes }) : new Datasource()),
      tap(ds => this.controlContainer.control.get('datasource').setValue(ds))
    ).subscribe();
  }

}
