import { Component, Input, Optional } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { ContentPluginManager } from 'content';
import { InlineContext } from 'context';
import { Pane, Panel } from 'panels';
import { BehaviorSubject, combineLatest, forkJoin } from 'rxjs';
import { debounceTime, defaultIfEmpty, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { FormlyHandlerHelper } from '../../services/formly-handler-helper.service';

@Component({
  selector: 'classifieds-formly-repeating-renderer',
  styleUrls: ['./formly-repeating-renderer.component.scss'],
  templateUrl: './formly-repeating-renderer.component.html'
})
export class FormlyRepeatingRendererComponent {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  set panes(panes: Array<Pane>) {
    this.panes$.next(panes);
  }

  @Input()
  set panel(panel: Panel) {
    this.panel$.next(panel);
  }

  @Input()
  set originPanes(originPanes: Array<Pane>) {
    this.originPanes$.next(originPanes);
  }

  @Input()
  originMappings: Array<number> = [];

  @Input()
  contexts: Array<InlineContext>;

  @Input()
  resolvedContext = {};

  readonly panes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly panel$ = new BehaviorSubject<Panel>(new Panel());
  readonly originPanes$ = new BehaviorSubject<Array<Pane>>([]);
  fields: FormlyFieldConfig[] = [];
  model: any = {
    items: []
  };
  proxyGroup = this.fb.group({});

  private readonly bridgeSub = this.proxyGroup.valueChanges.pipe(
    debounceTime(500)
  ).subscribe(values => {
    // (this.controlContainer.control.get('settings') as FormArray).clear();
    (this.controlContainer.control as FormArray).clear();
    const len = values.length;
    for (let i = 0; i < len ;i++) {
      const newGroup = this.attributeSerializer.convertToGroup(this.attributeSerializer.serialize({ settings: values[i] }, 'pane'));
      (this.controlContainer.control as FormArray).push(newGroup);
    }
    //console.log('proxy value', v);
    /*this.valueChange.emit(v.value);
    this.settingsFormArray.clear();*/
    console.log('repeating section value', values);
    // const newGroups = values.map(v => this.attributeSerializer.convertToGroup(this.attributeSerializer.serialize(v)));
    // newGroups.forEach(newGroup => (this.controlContainer.control.get('settings') as FormArray).push(newGroup));
  });

  private readonly panesSub = this.panes$.pipe(
    switchMap(panes => forkJoin(panes.filter(pane => pane.contentPlugin === 'formly_field').map(pane => this.cpm.getPlugin(pane.contentPlugin).pipe(map(plugin => ({ pane, plugin, panes }))))).pipe(
      defaultIfEmpty([])
    )),
    switchMap(groups => forkJoin(groups.map(({ pane, plugin, panes }) => plugin.handler.toObject(pane.settings).pipe(map(i => ({ pane, plugin, i, panes }))))).pipe(
      defaultIfEmpty([])
    )),
    switchMap(groups => forkJoin(groups.map(({ pane, plugin, i, panes }) => this.formlyHandlerHelper.buildFieldConfig(i, new Map<string, any>([ [ 'panes', panes ], [ 'contexts', this.contexts ] ])).pipe(map(f => ({ pane, plugin, i, f })), take(1)))).pipe(
      tap(groups => {
        console.log('field groups', groups);
      }),
      defaultIfEmpty([]),
      take(1)
    )),
    // withLatestFrom(this.panel$),
    switchMap(groups => this.panel$.pipe(
      map(panel => ({ groups, panel }))
    )),
    tap(({ groups, panel }) => {
      this.fields = [
        {
          key: panel.name && panel.name !== '' ? panel.name : 'items',
          type: 'repeat',
          templateOptions: {
            addText: 'Add another',
          },
          fieldArray: {
            // fieldGroup: groups.map(({ f, i, pane }) => ({ ...f, key: i.key && i.key  !== '' ? i.key : pane.name && pane.name !== '' ? pane.name : f.key }))
            fieldGroup: groups.map(({ f, i, pane }) => ({
              key: i.key && i.key  !== '' ? i.key : pane.name && pane.name !== '' ? pane.name : f.key,
              wrappers: [ ...(f.wrappers ? f.wrappers : []), 'imaginary-pane' ],
              fieldGroup: [f]
            }))
          }
        }
      ];
    })
  ).subscribe();

  constructor(
    private fb: FormBuilder,
    private cpm: ContentPluginManager,
    private formlyHandlerHelper: FormlyHandlerHelper,
    private attributeSerializer: AttributeSerializerService,
    @Optional() public controlContainer?: ControlContainer
  ) {
  }

}