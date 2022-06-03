import { Injectable } from "@angular/core";
import { InlineContext } from '@rollthecloudinc/context';
import { Pane, PanelPage } from "../models/panels.models";
import { Observable, of } from "rxjs";
import { ContentPluginManager } from '@rollthecloudinc/content';
import { PanelsWalkerService } from "./panels-walker.service";
import { map, switchMap, take } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class PanelsContextService {

  gatherPaneContexts = ({ pane, panelPage, ancestoryWithSelf }: { pane: Pane, panelPage: PanelPage, ancestoryWithSelf: Array<number> }) => this.cpm.getPlugin(pane.contentPlugin).pipe(
    switchMap(p =>
      /*p &&*/ p.handler ?
      p.handler.stateDefinition(pane.settings)
      : of({})
    ),
    map(state => new InlineContext({ 
      // name: 'panestate' + ancestoryWithSelf.map(i => `[${i}]`).join(''), 
      name: 'panestate-' + ancestoryWithSelf.join('-'),
      adaptor: 'data', 
      plugin: 'panestate', 
      data: { 
        id: panelPage ? panelPage.id : '', 
        selectionPath: [ ...ancestoryWithSelf ], 
        value: state 
      } 
    })),
    map(paneContext => [ paneContext ]),
    take(1)
  );

  constructor(
    private panelsVisitorService: PanelsWalkerService, 
    private cpm: ContentPluginManager
  ) {}

  allActivePageContexts({ panelPage, ancestory = [] }: { panelPage: PanelPage, ancestory?: Array<number> }): Observable<Iterable<InlineContext>> {
    return this.panelsVisitorService.walkPageHierarchy<InlineContext>({ panelPage, ancestory, visitorFunc: this.gatherPaneContexts, defaultv: []});
  }

}