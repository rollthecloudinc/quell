import { Injectable } from '@angular/core';
import { AttributeValue, AttributeSerializerService, AttributeTypes } from '@rollthecloudinc/attributes';
import { Pane, PanelPageSelector, PanelsLoaderService, PanelsSelectorService, StyleHandler } from '@rollthecloudinc/panels';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PanelContentHandler } from '../panel-content.handler';

@Injectable()
export class TabsStyleHandler implements StyleHandler {
  constructor(
    private panelHandler: PanelContentHandler,
    private attributeSerializer: AttributeSerializerService,
    private panelsLoaderService: PanelsLoaderService,
    private panelsSelectorService: PanelsSelectorService
  ) {}

  //
  // ---------------------------
  // FIX: NORMALIZE SELECTORS
  // ---------------------------
  //
  // Ensures tab selection always uses:
  //    page → panel → pane
  //
  private normalizeSelector(path: number[]): { page: number; panel: number; pane: number } {
    return {
      page: path[0] ?? 0,
      panel: path[1] ?? 0,
      pane: path[2] ?? 0
    };
  }

  //
  // Flatten any nested PanelPageSelector structure
  //
  flattenSelector(selector: PanelPageSelector): number[] {
    const flat: number[] = [];

    if (selector.panel !== undefined && selector.panel !== null) {
      flat.push(selector.panel);
    }
    if (selector.pane !== undefined && selector.pane !== null) {
      flat.push(selector.pane);
    }
    if (selector.nested && typeof selector.nested === 'object') {
      this.flattenSelector(selector.nested).forEach(v => flat.push(v));
    }

    return flat;
  }

  //
  // Apply +1 to all selector path values
  //
  selectWithTarget(s: number[]): number[] {
    return s.map(v => v + 1);
  }

  //
  // Disable the last segment for content panes
  //
  selectWithoutTarget(s: number[]): number[] {
    return s.map((v, i) =>
      i === s.length - 1 ? (v + 1) * -1 : 0
    );
  }

  //
  // MAIN ALTERATION LOGIC
  //
  alterResolvedPanes({
    settings,
    resolvedPanes,
    originMappings
  }: {
    settings: AttributeValue[];
    resolvedPanes: Pane[];
    originMappings: number[];
  }): Observable<{ resolvedPanes: Pane[]; originMappings: number[] }> {

    //
    // Deserialize panel settings: contains label mappings
    //
    const obj = this.attributeSerializer.deserialize(
      new AttributeValue({
        name: '',
        displayName: '',
        computedValue: '',
        type: AttributeTypes.Complex,
        value: '',
        intValue: 0,
        attributes: settings
      })
    );

    const selectors = obj && obj.labels && Array.isArray(obj.labels)
      ? obj.labels.map(l => new PanelPageSelector(l.mapping))
      : [];

    if (selectors.length === 0) {
      return of({ resolvedPanes, originMappings });
    }

    //
    // Normalize selectors
    //
    const flatSelectors = selectors.map(sel => {
      const flat = this.flattenSelector(sel);
      const n = this.normalizeSelector(flat);
      return [n.page, n.panel, n.pane];
    });

    //
    // Reduce nested pane structures
    //
    return forkJoin(
      resolvedPanes.map((pane, i) => {
        const reduced = this.panelsLoaderService.reducePanes([], pane, 0);
        return reduced[0]; // preserves your existing behavior
      })
    ).pipe(
      map((reducedResults: any[]) =>
        reducedResults.map(([_, page]) => page)
      ),
      map(pages => {
        const withTarget = flatSelectors.map(s => this.selectWithTarget(s));
        const withoutTarget = flatSelectors.map(s => this.selectWithoutTarget(s));

        const rebuilt = withTarget.map((s, i) => {
          const norm = this.normalizeSelector(s);
          return this.panelsSelectorService.rebuildPage(
            pages[i],                // <-- FIXED
            [norm.panel, norm.pane]
          );
        });

        const rebuilt2 = withoutTarget.map((s, i) => {
          const norm = this.normalizeSelector(s);
          return this.panelsSelectorService.rebuildPage(
            pages[i],                // <-- FIXED
            [norm.panel, norm.pane]
          );
        });

        //
        // Double the panes: title + content
        //
        const rebuildResolvedPanes: Pane[] = [];

        for (let i = 0; i < resolvedPanes.length; i++) {
          rebuildResolvedPanes.push(
            new Pane({
              ...resolvedPanes[i],
              settings: this.panelHandler.buildSettings(rebuilt[i])
            })
          );
          rebuildResolvedPanes.push(
            new Pane({
              ...resolvedPanes[i],
              settings: this.panelHandler.buildSettings(rebuilt2[i])
            })
          );
        }

        return { resolvedPanes: rebuildResolvedPanes, originMappings };
      })
    );
  }

  stateDefinition(): Observable<any> {
    return of({});
  }
}