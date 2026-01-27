import { Component, OnInit, Input, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { ControlContainer, UntypedFormArray, UntypedFormBuilder, FormGroup } from '@angular/forms';
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { Pane, Panel } from '@rollthecloudinc/panels';
import * as jpp from 'jsonpath-plus';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, tap, takeUntil } from 'rxjs/operators';
import { FormSectionForm } from '../../models/form.models';

@Component({
    selector: 'classifieds-ui-form-section',
    templateUrl: './form-section.component.html',
    styleUrls: ['./form-section.component.scss'],
    standalone: false
})
export class FormSectionComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() panes: Array<Pane> = [];
  @Input() originPanes: Pane;
  @Input() originMappings: Array<number> = [];
  @Input() ancestory: Array<number> = [];

  @Input() set settings(settings: Array<AttributeValue>) { this.settings$.next(settings); }
  @Input() set resolvedContext(resolvedContext: any) { this.resolvedContext$.next(resolvedContext); }
  @Input() set panel(panel: Panel) { this.panel$.next(panel); }

  readonly add$ = new Subject();
  readonly remove$ = new Subject<number>();
  readonly settings$ = new BehaviorSubject<Array<AttributeValue>>([]);
  readonly resolvedContext$ = new BehaviorSubject<any>(null);
  readonly panel$ = new BehaviorSubject<Panel>(null);
  readonly afterViewInit$ = new Subject();
  
  private destroy$ = new Subject<void>();

  /**
   * Safe getter to prevent "control is null" errors.
   */
  get panesFormArray(): UntypedFormArray | null {
    const control = this.controlContainer?.control;
    if (!control) return null;
    return control.get('panes') as UntypedFormArray;
  }

  constructor(
    private attributeSerializer: AttributeSerializerService,
    private fb: UntypedFormBuilder,
    public controlContainer: ControlContainer
  ) { }

  ngOnInit(): void {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const paneCopy = this.panes && this.panes.length > 0 ? new Pane(this.panes[0]) : new Pane();
      this.panes.push(paneCopy);
      this.syncFormArray();
    });

    this.remove$.pipe(takeUntil(this.destroy$)).subscribe(index => {
      if (index > -1 && index < this.panes.length) {
        this.panes.splice(index, 1);
        this.syncFormArray();
      }
    });

    combineLatest([
      this.settings$.pipe(map(s => s ? new FormSectionForm(this.attributeSerializer.deserializeAsObject(s)) : undefined)),
      this.resolvedContext$,
      this.panel$,
      this.afterViewInit$
    ]).pipe(
      map(([ s, rc, p ]) => {
        if (rc && s?.valuesMapping?.trim()) {
          const pieces = s.valuesMapping.split('[$i]');
          const replacements = pieces.map((_, i) => this.ancestory[(i * 1) + 3]);
          const path = pieces.reduce((prev, c, i) => [ ...prev, (i === 0 ? '' : (i - 1) < replacements.length ? `[${replacements[(i - 1)]}]` : ''), c ], []).join('');
          const items = jpp.JSONPath({ path: `$.${path}.*`, json: rc });
          return { items };
        }
        return { items: [] };
      }),
      tap(({ items }) => {
        if (items && items.length > this.panes.length) {
          const diff = items.length - this.panes.length;
          for (let i = 0; i < diff; i++) {
            const template = this.panes.length > 0 ? this.panes[0] : new Pane();
            this.panes.push(new Pane(template));
          }
          this.syncFormArray();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['panes']) {
      this.syncFormArray();
    }
  }

  ngAfterViewInit(): void {
    this.afterViewInit$.next(undefined);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private syncFormArray(): void {
    const formArray = this.panesFormArray;
    // Critical safety: if formArray isn't available yet, wait for next cycle
    if (!formArray || !this.panes) return;

    const targetLen = this.panes.length;
    const currentLen = formArray.length;

    if (targetLen > currentLen) {
      for (let i = currentLen; i < targetLen; i++) {
        formArray.push(this.fb.control(''), { emitEvent: false });
      }
    } else if (targetLen < currentLen) {
      for (let i = currentLen - 1; i >= targetLen; i--) {
        formArray.removeAt(i, { emitEvent: false });
      }
    }
  }

  trackByFn(index: number): number { return index; }
}