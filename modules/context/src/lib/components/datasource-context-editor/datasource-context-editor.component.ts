import { Component, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AttributeSerializerService } from '@ng-druid/attributes';
import { Datasource, DatasourceFormComponent } from 'datasource';
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
    private fb: FormBuilder, 
    public controlContainer: ControlContainer,
    private attributeSerializer: AttributeSerializerService
  ) { }

  ngOnInit(): void {
    (this.controlContainer.control as FormGroup).addControl('adaptor', this.fb.control('datasource', Validators.required));
    (this.controlContainer.control as FormGroup).addControl('datasource', this.fb.control(''));
    (this.controlContainer.control as FormGroup).addControl('_proxy', this.fb.control(''));
    this.proxyControlSub = (this.controlContainer.control as FormGroup).get('_proxy').valueChanges.pipe(
      map(v => v ? new Datasource({ ...v, settings: this.attributeSerializer.serialize(v.settings, 'settings').attributes }) : new Datasource()),
      tap(ds => this.controlContainer.control.get('datasource').setValue(ds))
    ).subscribe();
  }

}
