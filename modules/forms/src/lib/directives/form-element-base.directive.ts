import { Directive, Input, OnInit, AfterViewInit } from "@angular/core";
import { ControlContainer, UntypedFormControl } from "@angular/forms";
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { ValidationPluginManager } from "@rollthecloudinc/ordain";
import { SelectOption } from '@rollthecloudinc/datasource';
import { FormSettings } from "../models/form.models";
import { BehaviorSubject, combineLatest, forkJoin, Subject } from "rxjs";
import { defaultIfEmpty, distinctUntilChanged, filter, map, switchMap, take, tap, delay } from "rxjs/operators";
import { OptionsResolverService } from "../services/options-resolver.services";
import { Pane } from '@rollthecloudinc/panels';
import { InlineContext } from '@rollthecloudinc/context';
import { TokenizerService } from "@rollthecloudinc/token";
import { FormsContextHelperService } from "../services/forms-context-helper.service";
import * as uuid from 'uuid';
@Directive({
    selector: '[druid-forms-form-element-base]',
    standalone: false
})
export abstract class FormElementBase implements OnInit, AfterViewInit {

  @Input()
  tokens: Map<string, any>;

  @Input()
  set label(label: string) {
    this.label$.next(label);
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

  @Input()
  set contexts(contexts: Array<InlineContext>) {
    this.contexts$.next(contexts);
  }

  @Input()
  set resolvedContext(resolvedContext: any) {
    this.resolvedContext$.next(resolvedContext);
  }

  @Input()
  ancestory: Array<number> [];

  readonly formControl = new UntypedFormControl('');

  private readonly formControlValueChangesSub = this.formControl.valueChanges.pipe(
    tap(value => console.log('serialized form value', this.attributeSerializer.serialize(value, 'value'))),
    tap(value => this.controlContainer.control.get('settings').setValue([ this.attributeSerializer.serialize(value, 'value') ])),
  ).subscribe();

  /*private readonly formControlStatusChangesSub = this.formControl.statusChanges.pipe(
    //distinctUntilChanged(),
    //tap(() => this.controlContainer.control.get('settings').setErrors(this.formControl.errors)),
  ).subscribe();*/

  readonly formSettings$ = new BehaviorSubject<FormSettings>(undefined);
  readonly settings$ = new BehaviorSubject<Array<AttributeValue>>([]);
  readonly options$ = new BehaviorSubject<Array<SelectOption>>([]);
  init$ = new Subject();
  afterViewInit$ = new Subject();
  readonly panes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly originPanes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly contexts$ = new BehaviorSubject<Array<InlineContext>>([]);
  readonly resolvedContext$ = new BehaviorSubject<any>(undefined);
  readonly value$ = new Subject<any>();
  readonly label$ = new BehaviorSubject<string>(undefined)

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
   map(([ settings, resolvedContext ]) => ({ settings, resolvedContext })),
    switchMap(({ settings, resolvedContext }) => this.formsContextHelper.resolveContexts({ resolvedContext }).pipe(
      map(tokens => ({ settings, tokens }))
    )),
    switchMap(({ settings, tokens }) => forkJoin(settings.validation && settings.validation.validators ? settings.validation.validators.map(v => this.vpm.getPlugin(v.validator).pipe(switchMap(p => p.builder({ v, serialized: false }).pipe(map(vf => ({ v, vf })))))) : []).pipe(
      map(validators => ({ settings, tokens, validators })),
      defaultIfEmpty({ settings, tokens, validators: [] })
    )),
    switchMap(({ settings, tokens, validators }) => forkJoin(settings.validation && settings.validation.validators ? settings.validation.validators.map(v => this.vpm.getPlugin(v.validator).pipe(switchMap(p => p.builder({ v, serialized: true }).pipe(map(vf => ({ v, vf })))))) : []).pipe(
      map(validatorsSerialized => ({ settings, tokens, validators, validatorsSerialized })),
      defaultIfEmpty({ settings, tokens, validators, validatorsSerialized: [] })
    )),
    tap(({ settings, tokens, validators, validatorsSerialized }) => {
      this.formControl.setAsyncValidators(validators.map(({ vf }) => vf));
      this.controlContainer.control.get('settings').setAsyncValidators(validatorsSerialized.map(({ vf }) => vf));
      this.formControl.updateValueAndValidity();
      this.controlContainer.control.updateValueAndValidity();

      if(tokens !== undefined) {
        this.tokens = tokens;
      }
      if (settings.value && settings.value !== null && settings.value !== '') {
        if (settings.value.indexOf('.$i.') !== -1 || settings.value.indexOf('.$j.') !== -1 || settings.value.indexOf('.$k.') !== -1) {
          console.log(settings.value, this.ancestory);
        }

        const pieces = settings.value.split('$i');
        const replacements = pieces.map((_, i) => this.ancestory[(i * 1) + (3 + (i === 0 ? 0 : 3))]);
        // const path = s.valuesMapping.replace('[$i]', `[${this.ancestory[this.ancestory.length - 4]}]`);
        const path = pieces.reduce((prev, c, i) => [ ...prev, (i === 0 ? '' : (i - 1) < replacements.length ? `${replacements[(i - 1)]}` : ''), c ], []).join('');
        console.log('path', path);

        // const value = this.replaceTokens(settings.value.replace('.$i.', `.${this.ancestory[this.ancestory.length - 3]}.`));
        const value = this.replaceTokens(path);

        this.formControl.setValue(value);
        const extraTokens = this.tokenizerService.discoverTokens(value, true);
        if (extraTokens.length !== 0) {
          if (extraTokens[0].trim().lastIndexOf('.id') === extraTokens[0].trim().length - 3) {
            const id = uuid.v4();
            this.formControl.setValue(id);
            this.value$.next(id);
          } /*else if (extraTokens[0].trim().lastIndexOf('.user') === extraTokens[0].trim().length - 5) {
            this.formControl.setValue('{{ _user.username }}');
          }*/ else {
            const properties = Array.from(tokens).filter(([k]) => k.indexOf(path.substr(1, path.length - 2)) === 0);
            if (properties.length !== 0) {
              // Only suppports single depth at the moment.
              // This is a simple solution to supporting media files.
              const object = properties.reduce((p, [k, v]) => ({ ...p, [k.substr(k.lastIndexOf('.') + 1)]: v }), {});
              this.formControl.setValue(object);
              this.value$.next(object);
            } else {
              const v = this.tokenizerService.replaceTokens(settings.value, new Map<string, any>(Array.from(extraTokens).map(k => [k, ''])));
              this.formControl.setValue(v);
              this.value$.next(v);
            }
          }
        } else {
          this.value$.next(value);
        }
      } else {
        this.formControl.setValue('');
      }
    }),
    take(1)
  ).subscribe();

  constructor(
    protected attributeSerializer: AttributeSerializerService,
    protected optionsResolver: OptionsResolverService,
    protected tokenizerService: TokenizerService,
    protected formsContextHelper: FormsContextHelperService,
    protected vpm: ValidationPluginManager,
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

  markAsTouched() {
    this.formControl.markAllAsTouched();
  }

}