import { Component, OnInit, Output, EventEmitter, Input, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormArray, Validators } from '@angular/forms';
import { TokenizerService } from '@rollthecloudinc/token';
import { Rest } from '@rollthecloudinc/datasource';
import { Param } from '@rollthecloudinc/dparam';
import { InlineContext } from '@rollthecloudinc/context';
import { RestSourceFormComponent } from '@rollthecloudinc/rest';
import { Snippet } from '@rollthecloudinc/snippet';

@Component({
    selector: 'classifieds-ui-rest-form',
    templateUrl: './rest-form.component.html',
    styleUrls: ['./rest-form.component.scss'],
    standalone: false
})
export class RestFormComponent implements OnInit, AfterViewInit {

  @Input()
  panes: Array<string> = [];

  @Output()
  submitted = new EventEmitter<Rest>();

  @Input()
  contexts: Array<InlineContext> = [];

  @Input()
  set rest(rest: Rest) {
    if(rest!== undefined) {
      this._rest = rest;
      const defaultSelect = { value: '', label: '', id: '', multiple: '', limit: '' };
      this.restForm.setValue({
        renderer: {
          trackBy: '',
          query: '',
          ...rest.renderer,
          data: rest.renderer.data ? { ...rest.renderer.data, jsScript: ( rest.renderer.data.jsScript ? rest.renderer.data.jsScript : '' ) } : { content: '', contentType: '', jsScript: '' },
          select: ['pane', 'snippet'].findIndex(t => t === rest.renderer.type) > -1 ? defaultSelect : JSON.parse(rest.renderer.data.content),
          bindings: []
        },
        source: {
          url: '', // rest.url,
          params: [], // rest.params
          method: '',
          body: ''
        }
      });
      if(rest.renderer.type === 'pane') {
        this.bindings.clear();
        rest.renderer.bindings.forEach(b => {
          if(b.type === 'pane') {
            this.bindings.push(this.fb.group({
              id: this.fb.control(b.id, Validators.required),
              type: this.fb.control(b.type, Validators.required)
            }));
          }
        });
      }
      if(rest.renderer.type === 'pane') {
        this.restForm.get('renderer').get('data').disable();
      } else {
        this.restForm.get('renderer').get('data').enable();
      }
      setTimeout(() => {
        this.restSource = { url: rest.url, params: rest.params, method: rest.method ? rest.method : '', body: rest.body ? { ...rest.body, jsScript: ''  } : '' };
        this.sourceForm.refreshData$.next(undefined);
      });
    }
  }

  restSource: { url: string, params: Array<Param>, method?: string, body?: string | Snippet };

  @ViewChild(RestSourceFormComponent, {static: true}) sourceForm: RestSourceFormComponent;

  forms = [];

  snippetValidation = true;

  tokens: Map<string, any>;

  restForm = this.fb.group({
    source: this.fb.control(''),
    renderer: this.fb.group({
      type: 'snippet',
      query: this.fb.control(''),
      trackBy: this.fb.control(''),
      data: this.fb.control(''),
      bindings: this.fb.array([]),
      select: this.fb.group({
        value: this.fb.control(''),
        label: this.fb.control(''),
        id: this.fb.control(''),
        multiple: this.fb.control(''),
        limit: this.fb.control('')
      })
    })
  });

  private _rest: Rest;

  get rendererType() {
    return this.restForm.get('renderer').get('type');
  }

  get isSelectable() {
    return this.restForm.get('renderer').get('type').value && this.restForm.get('renderer').get('type').value !== 'snippet' && this.restForm.get('renderer').get('type').value !== 'pane';
  }

  get bindings() {
    return this.restForm.get('renderer').get('bindings') as UntypedFormArray;
  }

  get valid() {
    return this.restForm.valid;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private tokenizerService: TokenizerService
  ) {
  }

  ngOnInit(): void {
    console.log(this.contexts);
    this.restForm.get('renderer').get('type').valueChanges.subscribe(v => {
      if(this.rendererType.value === 'pane') {
        this.restForm.get('renderer').get('data').disable();
      } else {
        this.restForm.get('renderer').get('data').enable();
      }
      this.restForm.get('renderer').get('data').setValue({
        contentType: '',
        content: '',
        jsScript: ''
      });
    });
    this.restForm.get('renderer').get('select').valueChanges.subscribe(v => {
      this.restForm.get('renderer').get('data').setValue({
        contentType: 'application/json',
        content: JSON.stringify({ value: v.value, label: v.label , id: v.id, multiple: v.multiple, limit: v.limit }),
        jsScript: ''
      });
    });
  }

  ngAfterViewInit() {
    /*if(this.rest !== undefined) {
      console.log('rest next');
      this.sourceForm.refreshData$.next();
    }*/
  }

  onDataChange(data: any) {
    this.tokens = this.tokenizerService.generateGenericTokens(data[0]);
  }

  addPane() {
    this.bindings.push(this.fb.group({
      type: this.fb.control('pane', Validators.required),
      id: this.fb.control('', Validators.required)
    }));
  }

  submit() {
    const rest = new Rest({
      ...this.restForm.value,
      url: this.restForm.value.source.url,
      params: this.restForm.value.source.params,
      method: this.restForm.value.source.method,
      body: this.restForm.value.source.body
    });
    this.submitted.emit(rest);
  }

}
