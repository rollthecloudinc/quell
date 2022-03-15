import { Component, OnInit, Input } from '@angular/core';
import { AttributeValue } from '@ng-druid/attributes';
import { InlineContext } from '@ng-druid/context';
import { Pane } from '../../models/panels.models';

@Component({
  selector: 'classifieds-ui-panel-style-renderer-base',
  template: ''
})
export class PanelStyleRendererBaseComponent {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  panes: Array<Pane> = [];

  @Input()
  originPanes: Array<Pane>;

  @Input()
  originMappings: Array<number> = [];

  @Input()
  contexts: Array<InlineContext>;

  @Input()
  ancestory: Array<number> = [];

  mergeContexts(contexts: Array<InlineContext>): Array<InlineContext> {
    if(contexts === undefined && this.contexts === undefined) {
      return undefined;
    } else if(contexts !== undefined && this.contexts !== undefined) {
      return [ ...contexts, ...this.contexts ];
    } else if(contexts !== undefined) {
      return contexts;
    } else {
      return this.contexts;
    }
    //return [ ...( this.contexts !== undefined ? this.contexts.map(c => new InlineContext(c)) : [] ), ...( contexts !== undefined ? contexts.map(c => new InlineContext(c)) : [] ) ];
  }

}
