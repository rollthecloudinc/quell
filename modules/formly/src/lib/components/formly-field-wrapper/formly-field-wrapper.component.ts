import { Component, OnInit } from '@angular/core';
import { EntityCollectionService, EntityServices } from '@ngrx/data';
import { FieldWrapper } from '@ngx-formly/core';
import { ContentPluginManager } from 'content';
import { PanelPageState, PaneStateService } from '@ng-druid/panels';
import { Subject } from 'rxjs';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'classifieds-ui-formly-field-wrapper',
  templateUrl: './formly-field-wrapper.component.html',
  styleUrls: ['./formly-field-wrapper.component.scss']
})
export class FormlyFieldWrapperComponent extends FieldWrapper implements OnInit {

  private readonly valueChange$ = new Subject<any>();
  private panelPageStateService: EntityCollectionService<PanelPageState>;

  private readonly valueChangeSub = this.valueChange$.pipe(
    debounceTime(1000),
    map(v => ({ state: { value: v.value } })),
    switchMap(({ state }) => this.cpm.getPlugin((this.field as any).pane.contentPlugin).pipe(
      map(plugin => ({ state, plugin }))
    )),
    switchMap(({ state, plugin }) => this.paneStateService.mergeState({ state, ancestory: this.panelStateAncestory, settings: (this.field as any).pane.settings, plugin })),
    tap(({ pageState }) => {
      this.panelPageStateService.upsert(pageState);
    })
  ).subscribe();

  get panelStateAncestory(): Array<number> {
    return [ ...(this.field as any).panelAncestory, +this.field.parent.key, 0, (this.field as any).indexPosition ];
  }

  constructor(
    private paneStateService: PaneStateService,
    private cpm: ContentPluginManager,
    es: EntityServices
  ) {
    super();
    this.panelPageStateService = es.getEntityCollectionService('PanelPageState');
  }

  ngOnInit() {
    this.formControl.valueChanges.subscribe(v => {
      this.valueChange$.next(v);
    });
  }

}