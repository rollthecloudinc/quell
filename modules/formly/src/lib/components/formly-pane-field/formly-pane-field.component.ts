
import { Component, OnChanges, Input, SimpleChanges, forwardRef, OnInit, ComponentRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup,FormControl, Validator, Validators, AbstractControl, ValidationErrors, FormArray, FormBuilder } from "@angular/forms";
import { FormlyFieldConfig } from '@ngx-formly/core';
import { JSONPath } from 'jsonpath-plus';
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { BehaviorSubject, combineLatest, forkJoin, iif, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { FormlyFieldContentHandler } from '../../handlers/formly-field-content.handler';
import { FormlyAutocompleteComponent } from '../formly-autocomplete/formly-autocomplete.component';
import { FormlyHandlerHelper } from '../../services/formly-handler-helper.service';
import { InlineContext } from 'context';
import { FormlyFieldInstance } from '../../models/formly.models';
import { DatasourceApiService } from 'datasource';
import { UrlGeneratorService } from 'durl';
import { Pane, DatasourceContentHandler, PanelResolverService } from 'panels';
import { TokenizerService } from 'token';

@Component({
  selector: 'classifieds-ui-formly-pane-field',
  templateUrl: './formly-pane-field.component.html',
  styleUrls: ['./formly-pane-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormlyPaneFieldComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormlyPaneFieldComponent),
      multi: true
    },
  ]
})
export class FormlyPaneFieldComponent implements ControlValueAccessor, Validator, OnInit, AfterViewInit {

  @Input()
  contexts: Array<InlineContext> = [];

  @Input()
  tokens: Map<string, any>;

  @Input()
  set resolvedContext(resolvedContext: any) {
    this.resolvedContext$.next(resolvedContext);
  }

  @Input()
  set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  @Input()
  set panes(panes: Array<Pane>) {
    this.panes$.next(panes);
  }

  @Input()
  set originPanes(originPanes: Array<Pane>) {
    this.originPanes$.next(originPanes);
  }

  @Output()
  searchChange = new EventEmitter<string>();

  @Output()
  valueChange = new EventEmitter<any>();

  settingsFormArray = this.fb.array([]);
  proxyGroup = this.fb.group({});

  init$ = new Subject();
  afterViewInit$ = new Subject();
  resolvedContext$ = new BehaviorSubject<any>(undefined);
  settings$ = new BehaviorSubject<Array<AttributeValue>>([]);
  readonly panes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly originPanes$ = new BehaviorSubject<Array<Pane>>([]);
  // snippet$ = new BehaviorSubject<Snippet>(undefined);

  bridgeSub = this.proxyGroup.valueChanges.pipe(
    debounceTime(500)
  ).subscribe(v => {
    //console.log('proxy value', v);
    this.valueChange.emit(v.value);
    this.settingsFormArray.clear();
    const newGroup = this.attributeSerializer.convertToGroup(this.attributeSerializer.serialize(v.value, 'value'));
    this.settingsFormArray.push(newGroup);
  });

  renderContentSub = combineLatest([
    this.settings$,
    this.resolvedContext$,
    this.afterViewInit$
  ]).pipe(
    switchMap(([settings, _]) => this.handler.toObject(settings)),
    switchMap(i => this.resolveContexts().pipe(
      map<Map<string, any>, [FormlyFieldInstance, Map<string, any> | undefined]>(tokens => [i, tokens])
    ))
  ).subscribe(([instance, tokens]) => {
    if(tokens !== undefined) {
      this.tokens = tokens;
    }
    // this.settingsFormArray.clear();
    if (instance.value && instance.value !== null && instance.value !== '') {
      this.model = { value: this.replaceTokens(instance.value) };
      // const extraTokens = this.tokenizerService.discoverTokens(this.model.value);
      // console.log('extra tokens', extraTokens);
      /*const newGroup = this.attributeSerializer.convertToGroup(this.attributeSerializer.serialize(instance.value, 'value'));
      this.settingsFormArray.push(newGroup);*/
    } else {
      this.model = {};
    }
  });

  settingsSub = combineLatest([
    this.settings$,
    this.panes$,
    this.originPanes$,
    this.init$
  ]).pipe(
    map(([settings, panes, originPanes]) => ({ settings, metadata: new Map<string, any>([ [ 'panes', [ ...(panes && Array.isArray(panes) ? panes : []), ...(originPanes && Array.isArray(originPanes) ? originPanes : []) ] ], [ 'contexts', this.contexts ] ]) })),
    switchMap(({ settings, metadata }) => this.handler.buildFieldConfig(settings, metadata).pipe(
      switchMap(f => this.handler.toObject(settings).pipe(
        map<FormlyFieldInstance, [FormlyFieldConfig, FormlyFieldInstance]>(i => [f, i])
      )),
      map<[FormlyFieldConfig, FormlyFieldInstance], [FormlyFieldConfig, FormlyFieldInstance]>(([f, i]) => [{
        ...f,
        hooks: {
          afterViewInit: (field: FormlyFieldConfig) => {
            this.formlyHookAfterViewInit(field);
          }
        }
      }, i]),
      map<[FormlyFieldConfig, FormlyFieldInstance], [FormlyFieldConfig, FormlyFieldInstance]>(([f, i]) => [{
        ...f,
        templateOptions: {
          ...f.templateOptions,
          ...(i.type === 'autocomplete' ? { filter: this.makeFilterFunction({ i, metadata }) } : {}),
          change: (field, e) => {
            // console.log('value change', field.form.controls.value.value);
          }
        }
      }, i]))
    ),
    tap(([f, i]) => {
      this.fields = [ { ...f } ];
    })
  ).subscribe();

  public onTouched: () => void = () => {};

  fields: FormlyFieldConfig[] = [];
  model: any = {};

  constructor(
    private fb: FormBuilder,
    private attributeSerializer: AttributeSerializerService,
    private handler: FormlyFieldContentHandler,
    private formlyHandlerHelper: FormlyHandlerHelper,
    private urlGeneratorService: UrlGeneratorService ,
    private datasourceApi: DatasourceApiService,
    private datasourceHandler: DatasourceContentHandler,
    private panelResolver: PanelResolverService,
    private tokenizerService: TokenizerService
  ) { }

  ngOnInit(): void {
    this.init$.next();
  }

  ngAfterViewInit() {
    this.afterViewInit$.next();
  }

  writeValue(val: any): void {
    if (val) {
      setTimeout(() => this.settingsFormArray.setValue(val, { emitEvent: false }));
    }
  }

  registerOnChange(fn: any): void {
    this.settingsFormArray.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.settingsFormArray.disable()
    } else {
      this.settingsFormArray.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return null; //this.attributesForm.valid ? null : { invalidForm: {valid: false, message: "attributes are invalid"}};
  }

  formlyHookAfterViewInit(field: FormlyFieldConfig) {
    if (field.type === 'autocomplete') {
      const target: ComponentRef<FormlyAutocompleteComponent> = (field as any)._componentRefs.find(ref => ref.instance instanceof FormlyAutocompleteComponent);
      target.instance.formControl.valueChanges.pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap(s => this.searchChange.emit(s))
      ).subscribe();
    }
  }

  makeFilterFunction({ i, metadata }: { i: FormlyFieldInstance, metadata: Map<string, any> }): (term: string) => Observable<Array<any>> {
    //const metadata = new Map<string, any>([ [ 'panes', [ ...(this.panes && Array.isArray(this.panes) ? this.panes : []), ...(this.originPanes && Array.isArray(this.originPanes) ? this.originPanes : []) ] ], [ 'contexts', this.contexts ] ]);
    const dataPane = (metadata.get('panes') as Array<Pane>).find(p => p.name === i.datasourceBinding.id);
    return (term: string) => of([]).pipe(
      switchMap(s => this.searchChange.pipe(
        filter(v => v === term)
      )),
      switchMap(() => iif(
        () => !!i.datasourceBinding,
        i.datasourceBinding ? this.panelResolver.dataPanes(metadata.get('panes') as Array<Pane>).pipe(
          switchMap(dataPanes => dataPane ? this.datasourceHandler.fetchDynamicData(dataPane.settings, new Map<string, any>([ ...metadata, [ 'dataPanes', dataPanes ] ])) : of([])),
          map(d => d.results)
        ): of([]),
        !i.datasourceBinding ? this.urlGeneratorService.getUrl(i.rest.url, i.rest.params, new Map<string, any>([ [ 'contexts', this.contexts ] ])).pipe(
          switchMap(s => this.datasourceApi.getData(`${s}`))
        ) : of([])
      )),
      map((d => i.datasourceOptions && i.datasourceOptions.query !== '' ? JSONPath({ path: i.datasourceOptions.query, json: d }) : d)),
      switchMap(data => this.formlyHandlerHelper.mapDataOptions(i, data))
    );
  }

  replaceTokens(v: string): string {
    if(this.tokens !== undefined) {
      this.tokens.forEach((value, key) => {
        v = v.split(`[${key}]`).join(`${value}`)
      });
    }
    return v;
  }

  resolveContexts(): Observable<undefined | Map<string, any>> {
    return new Observable(obs => {
      let tokens = new Map<string, any>();
      if(this.resolvedContext$.value) {
        for(const name in this.resolvedContext$.value) {
          tokens = new Map<string, any>([ ...tokens, ...this.tokenizerService.generateGenericTokens(this.resolvedContext$.value[name], name === '_root' ? '' : name) ]);
        }
      }
      obs.next(tokens);
      obs.complete();
    });
  }

}

