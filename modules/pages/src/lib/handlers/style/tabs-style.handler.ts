import { Injectable } from '@angular/core';
import { AttributeValue, AttributeSerializerService, AttributeTypes } from '@rollthecloudinc/attributes';
import { Pane, Panel, PanelPage, PanelPageSelector, PanelsLoaderService, PanelsSelectorService, StyleHandler } from '@rollthecloudinc/panels';
import { forkJoin, Observable, of } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';
import { PanelContentHandler } from '../panel-content.handler';

@Injectable()
export class TabsStyleHandler implements StyleHandler {
  constructor(
    private panelHandler: PanelContentHandler,
    private attributeSerializer: AttributeSerializerService,
    private panelsLoaderService: PanelsLoaderService,
    private panelsSelectorService: PanelsSelectorService
  ) {}
  alterResolvedPanes(
    { settings, resolvedPanes, originMappings /*, resolvedContexts */ }: { settings: Array<AttributeValue>, resolvedPanes: Array<Pane>, originMappings: Array<number> /*, resolvedContexts: Array<any> */ }
  ): Observable<{ resolvedPanes: Array<Pane>, originMappings: Array<number> /*, resolvedContexts: Array<any> */ }> {

    // this.panelHandler.toObject();
    const obj = this.attributeSerializer.deserialize(new AttributeValue({ name: '', displayName: '', computedValue: '', type: AttributeTypes.Complex, value: '', intValue: 0, attributes: settings }));
    // console.log('Deserialized settings:');
    const selectors = obj && obj.labels !== undefined && Array.isArray(obj.labels) ? obj.labels.map(l => new PanelPageSelector(l.mapping)) : [];
    // console.log(selectors);

    let flatSelectors: Array<Array<number>> = [];

    if(selectors.length === 0) {
      // Short circuit - no need to manipulate at this point - path of least resistence? :/
      // We could try to dynamically create the titles but I think that is more trouble than its worth.
      return of({ resolvedPanes, originMappings /*, resolvedContexts */ });
    } else {
      // attempt rebuild to support dynamic panes automatically like those generated from rest.
      if(resolvedPanes.length !== selectors.length) {
        flatSelectors = resolvedPanes.map((_, i) => new PanelPageSelector({ ...(i < selectors.length ? selectors[i] : selectors[selectors.length - 1]), pane: i })).map(s => {
          // console.log(`flat selector for ${index}`);
          //console.log(this.flattenSelector(s));
          return this.flattenSelector(s);
          // We don't have access to page. So this needs to be a type of partial reduction.
          // partial, selection - reducetion?
          // this.panelsLoaderService.reducePage(new PanelPage({ panels:  }));
        });
      } else {
        flatSelectors = selectors.map(s => {
          // console.log(`flat selector for ${index}`);
          //console.log(this.flattenSelector(s));
          return this.flattenSelector(s);
          // We don't have access to page. So this needs to be a type of partial reduction.
          // partial, selection - reducetion?
          // this.panelsLoaderService.reducePage(new PanelPage({ panels:  }));
        });
      }
    }

    /*forkJoin(resolvedPanes.map((p, index) => forkJoin(this.panelsLoaderService.reducePanes([], p, index)))).subscribe(v => {
      console.log('reduced panes');
      console.log(v);
    });*/

    // is - 0 right?
    return forkJoin(    
      resolvedPanes.map(    
        (c2, i2) => {
          // console.log('Inside reduce: ' + i2);
          // console.log(c2);
          const reduced = this.panelsLoaderService.reducePanes([], c2, 0);
          // console.log(reduced);
          // console.log('reduced length ' + reduced.length);
          return reduced[0]; // Need to handle none nested content since reducePanes only fills in nested pages otherwise empty array
        }  
      )   
    ).pipe(
      map(v => v.reduce<Array<PanelPage>>((p2, [_, pp]) => [ ...p2, pp ], [])),
      map(v => {
        // const flatSelectorsMock = [ [0, 0,    1, 1], [0, 1,    1, 1] ]; // this is right... creates page with only title pane.
        // const flatSelectorsMock2 = [ [0, 0,   0, -1], [0, 1,   0, -1] ]; // this is right... creates page without selected target cinluding tab content only. 
        const withTarget = flatSelectors.map(s => this.selectWithTarget(s));
        const withoutTarget = flatSelectors.map(s => this.selectWithoutTarget(s));
        const rebuilt = withTarget.map((s, i) => this.panelsSelectorService.rebuildPage(v[flatSelectors[i][0]], s.slice(1)));
        const rebuilt2 = withoutTarget.map((s, i) => this.panelsSelectorService.rebuildPage(v[flatSelectors[i][0]], s.slice(1)));
        const rebuildResolvedPanes: Array<Pane> = [];
        const len = resolvedPanes.length;
        for(let i = 0; i < len; i++) {
          rebuildResolvedPanes.push(new Pane({ ...resolvedPanes[i], settings: this.panelHandler.buildSettings(rebuilt[i]) }));
          rebuildResolvedPanes.push(new Pane({ ...resolvedPanes[i], settings: this.panelHandler.buildSettings(rebuilt2[i]) }));
        }
        return { resolvedPanes: rebuildResolvedPanes, originMappings /*, resolvedContexts */ };
      })
    );/*.subscribe(v => {
      console.log(`reduced panes 2`);
      console.log(flatSelectors);
      // console.log(v);
      // Something is needed to convert the flat selectors to the selectors combatible with the panels selector service.
      // Right now just hard coding for proof of concept instead of implmenting that right now.
      const flatSelectorsMock = [ [0, 0,    1, 1], [0, 1,    1, 1] ]; // this is right... creates page with only title pane.
      const flatSelectorsMock2 = [ [0, 0,   0, -1], [0, 1,   0, -1] ]; // this is right... creates page without selected target cinluding tab content only.
      // The selector settings need to be stored relative to the panel not root page.
      // The original plan was to allow any pane to selected. However, that comes with way to issues.
      // Instead all we really need to do is allow any pane within the panel to be selected. Forget about selecting outside panes. Not worth it.
      // In this case I know that the first two selectors can be tossed out since we are already inside there with the exception of matching the pane index 1.
      const rebuilt = flatSelectorsMock.map((s, i) => this.panelsSelectorService.rebuildPage(v[s[1]], s.slice(2)));
      const rebuilt2 = flatSelectorsMock2.map((s, i) => this.panelsSelectorService.rebuildPage(v[s[1]], s.slice(2)));
      console.log(rebuilt);
      console.log(rebuilt2);

      const rebuildResolvedPanes: Array<Pane> = [];
      const len = resolvedPanes.length;
      for(let i = 0; i < len; i++) {
        rebuildResolvedPanes.push(new Pane({ ...resolvedPanes[i], settings: this.panelHandler.buildSettings(rebuilt[i]) }));
        rebuildResolvedPanes.push(new Pane({ ...resolvedPanes[i], settings: this.panelHandler.buildSettings(rebuilt2[i]) }));
      }
      // I think now we just need to serialize the nested pages back into the origin pane, right?
      // We should end up with 2 catgories containing 2 panes in an array.
      // cat = title & cat = content
      // This is a mass deviation from how this works. Before we were working with arrays. Now we are
      // changing the interface to a map with separate categories?
      // or do we keep the existing interface and use a map for "extra", categories panes instead?
      // This is a type of extract and categorize.
      // Perhaps adding a map but keeping the existing interface is the way to go... hmm
      // or we could just leave it as a array and skip out categoizations for now.... hmmm
      // Where the renderer component would be responsible for knowing that evens [0,2,4] are titles. odds [1,3,5] as content
      // I'm starting to lean towards keeping the signature the same as an array.
      // Relying on the renderer component to know about how to handle this.
      // which makes sense since the handler is directly coupled to the renderer.
      // In that case we return 4 panes in the array instead of 2. It would ALWAYS be doubled to include title selections.
    });*/

    // For now use the first pane inside a nested panel as the label. -- this is just a proof of concept at the moment
    console.log('TabsStyleHandler::alterResolvedPanes');
    console.log(resolvedPanes);
    console.log(originMappings);
    //console.log(resolvedContexts);
    // @todo: support linked pages
    /*const nestedPages$: Array<Observable<[Pane, PanelPage]>> = resolvedPanes.map(p => p.contentPlugin === 'panel' ? this.panelHandler.toObject(p.settings).pipe(map<PanelPage, [Pane, PanelPage]>(page => [p, page])) : undefined).filter(p => p !== undefined);
    return forkJoin(nestedPages$).pipe(
      map(pages => pages.reduce((p, [cp, c]) => [ 
        ...p, 
        new Pane({ ...cp, settings: this.panelHandler.buildSettings(new PanelPage({ ...c, panels: [ new Panel({ ...c.panels[0], panes: [ new Pane({ ...c.panels[0].panes[0] }) ] }) ] })) }), 
        new Pane({ ...cp, settings: this.panelHandler.buildSettings(new PanelPage({ ...c, panels: [ ...c.panels.map((p2, i) => i !== 0 ? p2 : new Panel({ ...p2, panes: p2.panes.map(p3 => new Pane(p3)).filter((_, i2) => i2 !== 0) })) ] })) }) 
      ], [])),
      tap(rebuiltPanes => {
        console.log('Rebuilt Panes');
        console.log(rebuiltPanes);
      }),
      map(rebuiltPanes => [ rebuiltPanes, originMappings, resolvedContexts])
    );*/
    return of({ resolvedPanes, originMappings /*, resolvedContexts */ });
  }

  stateDefinition(settings: Array<AttributeValue>): Observable<any> {
    return of({});
  }

  flattenSelector(selector: PanelPageSelector): Array<number> {
    const flat: Array<number> = [];
    if (selector.panel !== undefined && selector.panel !== null) {
      flat.push(selector.panel);
    }
    if (selector.pane !== undefined && selector.pane !== null) {
      flat.push(selector.pane);
    }
    if (selector.nested !== undefined && selector.nested !== null && typeof(selector.nested) === 'object') {
      this.flattenSelector(selector.nested).forEach(i => flat.push(i));
    }
    return flat;
  }

  selectWithTarget(s: Array<number>): Array<number> {
    return s.map(v => v + 1);
  }

  selectWithoutTarget(s: Array<number>): Array<number> {
    return s.map((v, i) => i === (s.length - 1) ? (v + 1) * -1 : 0);
  }

}