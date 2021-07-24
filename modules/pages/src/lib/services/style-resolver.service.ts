import { Injectable } from "@angular/core";
import { Pane, Panel } from "panels";
import { iif, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { StylePlugin, StylePluginManager } from "style";

@Injectable()
export class StyleResolverService {
  constructor(
    private spm: StylePluginManager
  ) {}
  alterResolvedPanes(
    panel: Panel,
    resolvedPanes: Array<Pane>, 
    originMappings: Array<number>, 
    resolvedContexts: Array<any>
  ): Observable<[Array<Pane>, Array<number>, Array<any>]> {
    return of(undefined).pipe<StylePlugin<string>, [Array<Pane>, Array<number>, Array<any>]>(
      switchMap(() =>
        panel.stylePlugin && panel.stylePlugin !== '' ?
        this.spm.getPlugin(panel.stylePlugin) :
        of(undefined)
      ),
      switchMap(p =>
        p && p.handler ?
        p.handler.alterResolvedPanes(panel.settings, resolvedPanes, originMappings, resolvedContexts) :
        of<[Array<Pane>, Array<number>, Array<any>]>([resolvedPanes, originMappings, resolvedContexts])
      )
    );
  }
}