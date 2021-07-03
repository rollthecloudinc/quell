import { Component, OnInit, Input, Inject, Optional } from '@angular/core';
import { ControlContainer, FormBuilder, Validators } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { AttributeValue } from 'attributes';
import { FormlyFieldContentHandler } from '../../handlers/formly-field-content.handler';

@Component({
  selector: 'classifieds-formly-field-renderer',
  templateUrl: './formly-field-renderer.component.html',
  styleUrls: ['./formly-field-renderer.component.scss']
})
export class FormlyFieldRendererComponent implements OnInit {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  appearance = 'legacy';

  @Input()
  name: string;

  @Input()
  label: string;

  @Input()
  displayType: string;

  fields: FormlyFieldConfig[] = [];
  model: any = {};

  constructor(
    private handler: FormlyFieldContentHandler,
    @Optional() public controlContainer?: ControlContainer
  ) { }

  ngOnInit(): void {
    this.handler.toObject(this.settings).subscribe(instance => {
      this.fields = [ { key: instance.key, type: instance.type } ];
    });
  }

}
