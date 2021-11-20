import { Component, Input, Optional } from '@angular/core';
import { ControlContainer, FormBuilder } from '@angular/forms';
import { FormlyFieldConfig  } from '@ngx-formly/core';
import { AttributeValue } from 'attributes';
import { ContentPluginManager } from 'content';
import { InlineContext } from 'context';
import { Pane, Panel } from 'panels';
import { BehaviorSubject, combineLatest, forkJoin } from 'rxjs';
import { defaultIfEmpty, map, switchMap, take, tap } from 'rxjs/operators';
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
  set ancestory(ancestory: Array<number>) {
    this.ancestory$.next(ancestory);
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
  readonly ancestory$ = new BehaviorSubject<Array<number>>([]);
  fields: FormlyFieldConfig[] = [];
  model: any = {
    items: []
  };
  readonly proxyGroup = this.fb.group({});

  private readonly panesSub = this.panes$.pipe(
    switchMap(panes => forkJoin(panes.filter(pane => pane.contentPlugin === 'formly_field').map(pane => this.cpm.getPlugin(pane.contentPlugin).pipe(map(plugin => ({ pane, plugin, panes }))))).pipe(
      defaultIfEmpty([])
    )),
    switchMap(groups => forkJoin(groups.map(({ pane, plugin, panes }) => plugin.handler.toObject(pane.settings).pipe(map(i => ({ pane, plugin, i, panes }))))).pipe(
      defaultIfEmpty([])
    )),
    switchMap(groups => forkJoin(groups.map(({ pane, plugin, i, panes }) => this.formlyHandlerHelper.buildFieldConfig(i, new Map<string, any>([ [ 'panes', panes ], [ 'contexts', this.contexts ] ])).pipe(map(f => ({ pane, plugin, i, f })), take(1)))).pipe(
      defaultIfEmpty([]),
      take(1)
    )),
    switchMap(groups => combineLatest([
      this.panel$,
      this.ancestory$
    ]).pipe(
      map(([panel, ancestory]) => ({ groups, panel, ancestory }))
    )),
    tap(({ groups, panel, ancestory }) => {
      this.fields = [
        {
          key: panel.name && panel.name !== '' ? panel.name : 'items',
          type: 'repeat',
          templateOptions: {
            addText: 'Add another',
          },
          fieldArray: {
            fieldGroup: groups.map(({ f, i, pane }, indexPosition) => ({
              key: i.key && i.key  !== '' ? i.key : pane.name && pane.name !== '' ? pane.name : f.key,
              wrappers: [ ...(f.wrappers ? f.wrappers : []), 'imaginary-pane' ],
              pane: pane,
              panelAncestory: ancestory,
              indexPosition,
              fieldGroup: [{
                ...f
              }]
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
    @Optional() public controlContainer?: ControlContainer
  ) {
  }

}