import { Component, Directive, Input, OnInit, AfterViewInit } from "@angular/core";
import { ControlContainer, FormArray, FormControl } from "@angular/forms";
import { AttributeSerializerService, AttributeValue } from '@ng-druid/attributes';
import { SelectOption } from '@ng-druid/datasource';
import { FormSettings } from "../models/form.models";
import { BehaviorSubject, combineLatest, iif, Observable, Subject } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { OptionsResolverService } from "../services/options-resolver.services";
import { Pane } from '@ng-druid/panels';
import { InlineContext } from '@ng-druid/context';
import { TokenizerService } from "@ng-druid/token";

@Directive({
  selector: '[druid-forms-form-element-base]'
})
export abstract class FormElementBase implements OnInit, AfterViewInit {

  @Input()
  tokens: Map<string, any>;

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

  @Input()
  set contexts(contexts: Array<InlineContext>) {
    this.contexts$.next(contexts);
  }

  @Input()
  set resolvedContext(resolvedContext: any) {
    this.resolvedContext$.next(resolvedContext);
  }

  readonly formControl = new FormControl('');

  private readonly formControlValueChangesSub = this.formControl.valueChanges.pipe(
    tap(value => console.log('serialized form value', this.attributeSerializer.serialize(value, 'value'))),
    tap(value => this.controlContainer.control.get('settings').setValue([ this.attributeSerializer.serialize(value, 'value') ]))
  ).subscribe();

  readonly formSettings$ = new BehaviorSubject<FormSettings>(undefined);
  readonly settings$ = new BehaviorSubject<Array<AttributeValue>>([]);
  readonly options$ = new BehaviorSubject<Array<SelectOption>>([]);
  init$ = new Subject();
  afterViewInit$ = new Subject();
  readonly panes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly originPanes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly contexts$ = new BehaviorSubject<Array<InlineContext>>([]);
  readonly resolvedContext$ = new BehaviorSubject<any>(undefined);

  protected readonly settingsSub = this.settings$.pipe(
    map(settings => settings ? this.settingsToObject(this.attributeSerializer.deserializeAsObject(settings)) : undefined),
    tap(s => this.formSettings$.next(s))
  ).subscribe();

  protected readonly loadOptionsSub = combineLatest([
    this.formSettings$,
    this.panes$,
    this.originPanes$,
    this.contexts$,
    this.init$
  ]).pipe(
    map(([settings, panes, originPanes, contexts]) => ({ settings, metadata: new Map<string, any>([ [ 'panes', [ ...(panes && Array.isArray(panes) ? panes : []), ...(originPanes && Array.isArray(originPanes) ? originPanes : []) ] ], [ 'contexts', contexts ] ]) })),
    switchMap(({ settings, metadata }) => this.optionsResolver.resolveElementOptions(settings, metadata)),
    tap(options => this.options$.next(options))
  ).subscribe();

  renderContentSub = combineLatest([
    this.formSettings$,
    this.resolvedContext$,
    this.afterViewInit$
  ]).pipe(
    map(([ settings ]) => ({ settings })),
    switchMap(({ settings }) => this.resolveContexts().pipe(
      map(tokens => ({ settings, tokens }))
    )),
    tap(({ settings, tokens }) => {
      if(tokens !== undefined) {
        this.tokens = tokens;
      }
      if (settings.value && settings.value !== null && settings.value !== '') {
        const value = this.replaceTokens(settings.value);
        this.formControl.setValue(value);
        const extraTokens = this.tokenizerService.discoverTokens(value, true);
        if (extraTokens.length !== 0) {
          this.formControl.setValue(this.tokenizerService.replaceTokens(settings.value, new Map<string, any>(Array.from(extraTokens).map(k => [k, '']))));
        }
      } else {
        this.formControl.setValue('');
      }
    })
  ).subscribe();

  constructor(
    protected attributeSerializer: AttributeSerializerService,
    protected optionsResolver: OptionsResolverService,
    protected tokenizerService: TokenizerService,
    public controlContainer?: ControlContainer
  ) {}

  ngOnInit() {
    this.init$.next(undefined);
  }

  ngAfterViewInit() {
    this.afterViewInit$.next(undefined);
  }

  settingsToObject(s: any): FormSettings {
    return new FormSettings(s);
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