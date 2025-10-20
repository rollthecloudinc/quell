import { Component, OnInit, Input, Inject, Optional, Output, EventEmitter } from '@angular/core';
import { ControlContainer, UntypedFormBuilder, Validators } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { AttributeValue, AttributeSerializerService, ValueComputerService } from '@rollthecloudinc/attributes';
import { InlineContext } from '@rollthecloudinc/context';
import { Pane } from '@rollthecloudinc/panels';
import { debounceTime } from 'rxjs/operators';
import { FormlyFieldContentHandler } from '../../handlers/formly-field-content.handler';

@Component({
    selector: 'classifieds-formly-field-renderer',
    templateUrl: './formly-field-renderer.component.html',
    styleUrls: ['./formly-field-renderer.component.scss'],
    standalone: false
})
export class FormlyFieldRendererComponent implements OnInit {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  contexts: Array<InlineContext> = [];

  @Input()
  panes: Array<Pane> = [];

  @Input()
  originPanes: Array<Pane> = [];

  @Input()
  appearance = 'legacy';

  @Input()
  name: string;

  @Input()
  label: string;

  @Input()
  displayType: string;

  @Input()
  resolvedContext = {};

  @Input()
  state: any = {};

  @Input()
  tokens: Map<string, any>;

  @Output()
  stateChange = new EventEmitter<any>();

  fields: FormlyFieldConfig[] = [];
  model: any = {};

  constructor(
    private fb: UntypedFormBuilder,
    private handler: FormlyFieldContentHandler,
    private attributeSerializer: AttributeSerializerService,
    @Optional() public controlContainer?: ControlContainer
  ) { }

  ngOnInit(): void {
    this.handler.toObject(this.settings).subscribe(instance => {
      this.fields = [ { key: instance.key, type: instance.type } ];
    });
  }

  private input;
  onSearchChange(input: string) {
    this.input = input;
    this.state = { value: this.value, autocomplete: { input } };
    this.stateChange.emit({ value: this.value, autocomplete: { input } });
  }

  private value;
  onValueChange(value: any) {
    this.value = value;
    this.state = { value, autocomplete: { input: this.input } };
    this.stateChange.emit({ value, autocomplete: { input: this.input } });
  }

}
