import { Component, OnInit, Input } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder } from '@angular/forms';
import { AttributeSerializerService, AttributeValue } from '@ng-druid/attributes';
import { Pane } from '@ng-druid/panels';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'classifieds-ui-form-section',
  templateUrl: './form-section.component.html',
  styleUrls: ['./form-section.component.scss']
})
export class FormSectionComponent implements OnInit {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  panes: Array<Pane> = [];

  @Input()
  originPanes: Pane;

  @Input()
  originMappings: Array<number> = [];

  readonly add$ = new Subject();
  readonly remove$ = new Subject<number>();
  readonly panes$ = new BehaviorSubject<Array<Pane>>([]);

  private readonly addSub = this.add$.pipe(
    map(() => new Pane(this.panes[0])),
    tap(() => this.panesFormArray.push(this.fb.control(''))),
    tap(paneCopy => this.panes.push(paneCopy)),
  ).subscribe();

  private readonly removeSub = this.remove$.pipe(
    tap(index => this.panesFormArray.removeAt(index)),
    tap(index => this.panes.splice(index, 1))
  ).subscribe();

  get panesFormArray(): FormArray {
    return this.controlContainer.control.get('panes') as FormArray;
  }

  constructor(
    private attributeSerializer: AttributeSerializerService,
    private fb: FormBuilder,
    public controlContainer: ControlContainer
  ) { }

  ngOnInit(): void {
  }

}
