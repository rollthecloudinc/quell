import { Component, Directive, Input, OnInit } from "@angular/core";
import { ControlContainer, FormArray, FormControl } from "@angular/forms";
import { AttributeSerializerService, AttributeValue } from "attributes";
import { SelectOption } from "datasource";
import { FormSettings } from "../models/form.models";
import { BehaviorSubject, combineLatest, iif, Subject } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { OptionsResolverService } from "../services/options-resolver.services";
import { Pane } from "panels";
import { InlineContext } from "context";

@Directive({
  selector: '[druid-forms-form-element-base]'
})
export abstract class FormElementBase implements OnInit {

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

  readonly formControl = new FormControl('');

  private readonly formControlValueChangesSub = this.formControl.valueChanges.pipe(
    tap(value => this.controlContainer.control.get('settings').setValue([ this.attributeSerializer.serialize(value, 'value') ]))
  ).subscribe();

  readonly formSettings$ = new BehaviorSubject<FormSettings>(undefined);
  readonly settings$ = new BehaviorSubject<Array<AttributeValue>>([]);
  readonly options$ = new BehaviorSubject<Array<SelectOption>>([]);
  init$ = new Subject();
  readonly panes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly originPanes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly contexts$ = new BehaviorSubject<Array<InlineContext>>([]);

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

  constructor(
    protected attributeSerializer: AttributeSerializerService,
    protected optionsResolver: OptionsResolverService,
    public controlContainer?: ControlContainer
  ) {}

  ngOnInit() {
    this.init$.next();
  }

  settingsToObject(s: any): FormSettings {
    return new FormSettings(s);
  }

}