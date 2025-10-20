import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ControlContainer, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { Pane, Panel } from '@rollthecloudinc/panels';
import { JSONPath } from 'jsonpath-plus';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FormSectionForm } from '../../models/form.models';

@Component({
    selector: 'classifieds-ui-form-section',
    templateUrl: './form-section.component.html',
    styleUrls: ['./form-section.component.scss'],
    standalone: false
})
export class FormSectionComponent implements OnInit, AfterViewInit {

  @Input()
  panes: Array<Pane> = [];

  @Input()
  originPanes: Pane;

  @Input()
  originMappings: Array<number> = [];

  @Input()
  ancestory: Array<number> = [];

  @Input()
  set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  @Input()
  set resolvedContext(resolvedContext: any) {
    this.resolvedContext$.next(resolvedContext);
  }

  @Input()
  set panel(panel: Panel) {
    this.panel$.next(panel);
  }

  readonly add$ = new Subject();
  readonly remove$ = new Subject<number>();
  readonly panes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly settings$ = new Subject<Array<AttributeValue>>();
  readonly resolvedContext$ = new Subject<any>();
  readonly panel$ = new Subject<Panel>();
  readonly afterViewInit$ = new Subject();

  private readonly addSub = this.add$.pipe(
    map(() => new Pane(this.panes[0])),
    tap(() => this.panesFormArray.push(this.fb.control(''))),
    tap(paneCopy => this.panes.push(paneCopy)),
  ).subscribe();

  private readonly removeSub = this.remove$.pipe(
    tap(index => this.panesFormArray.removeAt(index)),
    tap(index => this.panes.splice(index, 1))
  ).subscribe();

  private readonly populateDefaultValues = combineLatest([
    this.settings$.pipe(
      map(s => s ? new FormSectionForm(this.attributeSerializer.deserializeAsObject(s)) : undefined)
    ),
    this.resolvedContext$,
    this.panel$,
    this.afterViewInit$
  ]).pipe(
    map(([ s, rc, p ]) => ({ s, rc, p })),
    tap(({ s }) => console.log(s.valuesMapping, this.ancestory)),
    map(({ s, rc, p }) => {
      if (rc && s && s.valuesMapping && s.valuesMapping.trim() !== '') {
        const pieces = s.valuesMapping.split('[$i]');
        const replacements = pieces.map((_, i) => this.ancestory[(i * 1) + 3]);
        // const path = s.valuesMapping.replace('[$i]', `[${this.ancestory[this.ancestory.length - 4]}]`);
        const path = pieces.reduce((prev, c, i) => [ ...prev, (i === 0 ? '' : (i - 1) < replacements.length ? `[${replacements[(i - 1)]}]` : ''), c ], []).join('');
        console.log('path', path);
        const items = JSONPath({ path: `$.${path}.*`, json: rc });
        return { items, s, p }
      } else {
        return { items: [], p };
      }
    }),
    tap(({ items }) => {
      const len = items.length - this.panesFormArray.length;
      for (let i = 0; i < len; i++) {
        this.add$.next(undefined);
      }
    })
  ).subscribe()

  get panesFormArray(): UntypedFormArray {
    return this.controlContainer.control.get('panes') as UntypedFormArray;
  }

  constructor(
    private attributeSerializer: AttributeSerializerService,
    private fb: UntypedFormBuilder,
    public controlContainer: ControlContainer
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
      this.afterViewInit$.next(undefined);
  }

}
