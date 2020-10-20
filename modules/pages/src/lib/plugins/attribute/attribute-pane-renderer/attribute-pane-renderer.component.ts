import { Component, OnInit, Input, Inject, Optional } from '@angular/core';
import { ControlContainer, FormBuilder, Validators } from '@angular/forms';
import { ATTRIBUTE_WIDGET, AttributeValue, AttributeWidget, Attribute, AttributeTypes } from '@classifieds-ui/attributes';
import { AttributeContentHandler } from '../../../handlers/attribute-content.handler';
import { Snippet } from '../../../models/plugin.models';
import { TokenizerService } from '@classifieds-ui/token';

@Component({
  selector: 'classifieds-ui-attribute-pane-renderer',
  templateUrl: './attribute-pane-renderer.component.html',
  styleUrls: ['./attribute-pane-renderer.component.scss']
})
export class AttributePaneRendererComponent implements OnInit {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  appearance = 'legacy';

  @Input()
  name: string;

  @Input()
  label: string;

  attributes:  Array<Attribute> = [];
  attributeValues: Array<AttributeValue>;

  rendererOverride: Snippet;
  rendererSettings: Array<AttributeValue>;

  tokens: Map<string, any>;

  /*passThruForm = this.fb.group({
    name: this.fb.control('value', Validators.required),
    type: this.fb.control(AttributeTypes.Complex, Validators.required),
    displayName: this.fb.control('Value', Validators.required),
    value: this.fb.control(''),
    attributes: this.fb.control('')
  });*/

  constructor(
    @Inject(ATTRIBUTE_WIDGET) private widgets: Array<AttributeWidget>,
    private handler: AttributeContentHandler,
    private tokenizerService: TokenizerService,
    private fb: FormBuilder,
    @Optional() public controlContainer?: ControlContainer
  ) { }

  ngOnInit(): void {
    this.attributes = [ new Attribute({ ...this.widgets.find(w => w.name === this.settings.find(s => s.name === 'widget').value).schema, name: 'value', label: 'Value' }) ];
    this.attributeValues = this.handler.valueSettings(this.settings);
    this.tokens = this.tokenizerService.generateTokens(this.attributeValues);
    this.handler.rendererSnippet(this.settings).subscribe(snippet => {
      this.rendererOverride = snippet;
      if(snippet !== undefined) {
        this.rendererSettings = this.handler.rendererOverrideSettings(snippet)[0].attributes;
      }
    });
    /*this.passThruForm.valueChanges.subscribe(v => {
      console.log(v);
      this.controlContainer.control.setValue({
        ...this.controlContainer.control.value,
        settings: [v]
      });
    });*/
  }

}
