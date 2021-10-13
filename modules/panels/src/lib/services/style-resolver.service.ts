import { Injectable } from "@angular/core";
import { Pane, Panel } from "../models/panels.models";
import { iif, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { StylePluginManager } from "../services/style-plugin-manager.service";
import { StylePlugin } from "../models/style.models";

@Injectable({
  providedIn: 'root'
})
export class StyleResolverService {
  constructor(
    private spm: StylePluginManager
  ) {}
  alterResolvedPanes(
    { panel, resolvedPanes, originMappings /*, resolvedContexts */ }: { panel: Panel, resolvedPanes: Array<Pane>, originMappings: Array<number> /* resolvedContexts: Array<any> */ }
  ): Observable<{ resolvedPanes: Array<Pane>, originMappings: Array<number> /*,  resolvedContexts: Array<any> */ }> {
    return of(undefined).pipe<StylePlugin<string>, { resolvedPanes: Array<Pane>, originMappings: Array<number> /*, resolvedContexts: Array<any> */}>(
      switchMap(() =>
        panel.stylePlugin && panel.stylePlugin !== '' ?
        this.spm.getPlugin(panel.stylePlugin) :
        of(undefined)
      ),
      switchMap(p =>
        p && p.handler ?
        p.handler.alterResolvedPanes({ settings: panel.settings, resolvedPanes, originMappings /*, resolvedContexts */ }) :
        of<{ resolvedPanes: Array<Pane>, originMappings: Array<number> /*, resolvedContexts: Array<any> */ }>({ resolvedPanes, originMappings /*, resolvedContexts */ })
      )
    );
  }
}