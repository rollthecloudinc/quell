import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as uuid from 'uuid';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { RestContentHandler } from '../../../handlers/rest-content-handler.service';
import { Subject } from 'rxjs';
import { switchMap, filter, tap } from 'rxjs/operators';
import { ControlContainer } from '@angular/forms';
import { SelectOption, SelectMapping } from '@rollthecloudinc/datasource';
import { Snippet } from '@rollthecloudinc/snippet';
import { InlineContext } from '@rollthecloudinc/context';

@Component({
    selector: 'classifieds-ui-rest-pane-renderer',
    templateUrl: './rest-pane-renderer.component.html',
    styleUrls: ['./rest-pane-renderer.component.scss'],
    standalone: false
})
export class RestPaneRendererComponent implements OnInit {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  name: string;

  @Input()
  label: string;

  @Input()
  displayType: string;

  @Input()
  contexts: Array<InlineContext> = [];

  @Input()
  state: any = {};

  @Output()
  stateChange = new EventEmitter<any>();

  tag = uuid.v4();

  options: Array<SelectOption>;

  searchChange$ = new Subject<string>();

  snippet: Snippet;

  selectMapping: SelectMapping;

  get renderType() {
    return this.restHandler.getRenderType(this.settings);
  }

  constructor(
    private restHandler: RestContentHandler,
    public controlContainer: ControlContainer
  ) { }

  ngOnInit(): void {
    this.restHandler.toObject(this.settings).pipe(
      tap(r => {
        this.snippet = r.renderer.data;
        this.selectMapping = new SelectMapping(JSON.parse(this.snippet.content));
      }),
      filter(() => this.renderType !== 'autocomplete'),
      switchMap(r => this.restHandler.buildSelectOptionItems(this.settings, new Map<string, any>([ ['tag', this.tag], [ 'snippet', r.renderer.data ], [ 'contexts', this.contexts ] ])))
    ).subscribe(options => {
      this.options = options;
    });
    this.searchChange$.pipe(
      tap(input=> {
        this.stateChange.emit({ autocomplete: { input } });
      }),
      switchMap(r => this.restHandler.buildSelectOptionItems(this.settings, new Map<string, any>([ ['tag', uuid.v4()], [ 'snippet', this.snippet ], [ 'contexts', this.contexts ] ])))
    ).subscribe(options => {
      this.options = options;
    });
  }

  onSearchChange(searchString: string) {
    this.searchChange$.next(searchString);
  }

}
