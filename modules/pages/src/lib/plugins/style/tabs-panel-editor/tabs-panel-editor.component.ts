import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { EntityCollectionService, EntityServices } from "@ngrx/data";
import { InlineContext } from "context";
import { AttributeSerializerService } from 'attributes';
import { LayoutSetting, Pane, Panel, PanelPage, PanelContentHandler } from "panels";
import { BehaviorSubject, forkJoin, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: 'druid-tabs-panel-editor',
  templateUrl: './tabs-panel-editor.component.html',
  // styleUrls: ['./tabs-panel-editorcomponent.scss']
})
export class TabsPanelEditorComponent implements OnInit {
  contexts: Array<InlineContext> = [];
  // panelPages$ = new BehaviorSubject<Map<string ,PanelPage>>(new Map([]));
  panelPages: Array<PanelPage> = [];
  formGroup = this.fb.group({
    labels: this.fb.array([
      this.buildLabelGroup()
    ])
  });
  private panelPageService: EntityCollectionService<PanelPage>;
  get labels(): FormArray {
    return this.formGroup.get('labels') as FormArray;
  }
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: FormGroup; panelIndex: number; contexts: Array<InlineContext>; },
    private dialogRef: MatDialogRef<TabsPanelEditorComponent>,
    private fb: FormBuilder,
    private panelHandler: PanelContentHandler,
    private attributeSerializer: AttributeSerializerService,
    es: EntityServices
  ) {
    this.contexts = this.data.contexts;
    this.panelPageService = es.getEntityCollectionService('PanelPage');
  }
  ngOnInit() {
    this.panelPages = [ new PanelPage({ id: 'root', title: 'Root', displayType: '', layoutType: '', gridItems: [], layoutSetting: new LayoutSetting(), rowSettings: [], panels: [ new Panel(this.data.panelFormGroup.value) ] }) ];

    /*const panel = new Panel(this.data.panelFormGroup.value);
    const nested = panel.panes.filter(p => p.contentPlugin === 'panel');
    const nested$ = nested.map<Array<Observable<[Pane, PanelPage]>>>(p => p.linkedPageId ? this.panelPageService.getByKey(p.linkedPageId).pipe(map(p2 => [p, p2])) : this.panelHandler.toObject(p.settings).pipe(map(p2 => [p, p2])));
    if (nested$.length !== 0) {
      forkJoin(nested$).subscribe(pp => {
        this.panelPages$.next(new Map(pp.map(([p, p2]) => [ p.name, p2 ]));
      });
    } else {
      this.panelPages$.next(new Map([]));
    }*/
  }

  submit() {
    (this.data.panelFormGroup.get('settings') as FormArray).clear();
    this.attributeSerializer.serialize(this.formGroup.value, 'root').attributes.forEach(a => {
      (this.data.panelFormGroup.get('settings') as FormArray).push(this.attributeSerializer.convertToGroup(a));
    });
  }

  onRemoveMapping(index: number) {
    this.labels.removeAt(index);
  }

  onAddMapping() {
    this.labels.push(this.buildLabelGroup());
  }

  buildLabelGroup(): FormGroup {
    return this.fb.group({
      mapping: this.fb.control('')
    });
  }

}