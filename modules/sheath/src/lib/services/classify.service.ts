import { Inject, Injectable } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import domElementPath from 'dom-element-path';
import { camelize, dasherize, underscore } from 'inflected';
import merge from 'deepmerge-json';
import { catchError, debounceTime, filter, Observable, of, Subject, switchMap, tap } from "rxjs";
import { ClassClassification, ClassMap } from "../models/classify.models";
import { isSelectorValid } from "../sheath.helpers";

@Injectable({
  providedIn: 'root'
})
export class ClassifyService {

  readonly mutate = new Subject<{ record: MutationRecord, overlay: ClassMap, originals: Map<string, Set<string>> }>();
  readonly mutated$ = new Subject<{ classes: ClassMap }>();

  mutateub = this.mutate.pipe(
    filter(({ record }) => record.type === 'attributes' && record.attributeName === 'class' && !!record.target),
    debounceTime(2000),
    switchMap(({ record, overlay, originals }) => this.mapRecord({ record, overlay, originals }).pipe(
      catchError(e => {
        //console.warn(e);
        return of({ classes: overlay });
      })
    )),
    tap(({ classes }) => this.mutated$.next({ classes }))
  ).subscribe();

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {}

  classify({ targetNode }: { targetNode: Node }): void {
    const overlay = new Map<string, Map<string, ClassClassification>>();
    const originals = new Map<string, Set<string>>();
    const observer = new MutationObserver((records) => {
      records.forEach(record => {
        this.mutate.next({ record, overlay, originals });
      });
    });
    const observerOptions = { childList: true, attributes: true, subtree: true, attributeFilter: [ 'class' ], attributeOldValue: true }
    observer.observe(targetNode, observerOptions);
  }

  mapRecord({ record, overlay, originals }: { record: MutationRecord, overlay: ClassMap, originals: Map<string, Set<string>> }): Observable<{ classes: ClassMap }> {
    return new Observable<{ classes: ClassMap }>(obs => {

      const path = domElementPath.default(record.target);
      let rebuiltSelector = '';

      const pieces = path.split(' ');
      const optimizedSelector = pieces.reduce((p, c, i) => c.indexOf('.pane-') !== -1 || c.indexOf('.panel-') !== -1 ? { selector: [ ...p.selector, c.replace(/^(.*?)(\.pane-|\.panel-page|\.panel-)([0-9]*)(.*?)$/,'$2$3') ], chars: p.chars + c.length, lastIndex: p.chars + i + c.length } : { ...p, chars: p.chars + c.length }, { selector: [], chars: 0, lastIndex: 0 });
      if (optimizedSelector.selector.length !== 0) {
        // console.log('after selector', k.slice(optimizedSelector.lastIndex))
        rebuiltSelector = ( optimizedSelector.selector.join(' ') + ' ' + path.slice(optimizedSelector.lastIndex).split('>').join('') ).replace(/(\.ng\-[a-zA-Z0-9_-]*)/gm,'');
        if (rebuiltSelector.indexOf('.panel-page') === 0) {
          rebuiltSelector = rebuiltSelector.substr(12).trim();
        }
      }

      const rebuiltPieces = rebuiltSelector.split(' ');
      const [ lastSelector ] = rebuiltPieces[rebuiltPieces.length - 1].split('.', 1);
      rebuiltSelector = (rebuiltPieces.splice(0, rebuiltPieces.length - 2).join(' ') + ' ' + lastSelector).trim();

      const selectorValid = isSelectorValid({ selector: rebuiltSelector, document: this.document });
      if (selectorValid) {

        if(!originals.has(rebuiltSelector)) {
          originals.set(rebuiltSelector, new Set(record.oldValue.split(' ').map(c => c.trim())));
        }
  
        const classList = (record.target as any).classList;
        // Adding prefix ng - and mat- to exclusion although should probably be more configurable / customizable.
        const classMap = new Map<string, ClassClassification>(Array.from(classList.values()).map(c => [`${c}`, !originals.has(rebuiltSelector) || (!originals.get(rebuiltSelector).has(`${c}`) && `${c}`.indexOf('ng-') !== 0 && `${c}`.indexOf('mat-') !== 0) ? ClassClassification.ADD : ClassClassification.KEEP ]));
        const removed = Array.from(originals.get(rebuiltSelector)).reduce((p, c) => [ Array.from(classList.values()).findIndex(c2 => c2 === c) === -1 ? c : undefined ], []).filter(c => c !== undefined);
        if (removed.length !== 0) {
          removed.forEach(c => classMap.set(c, ClassClassification.REMOVE));
        }
  
        if (classMap.size === 0 && overlay.has(rebuiltSelector)) {
          overlay.delete(rebuiltSelector);
        } else if (classMap.size !== 0) {
          overlay.set(rebuiltSelector, classMap);
        }
  
        obs.next({ classes: overlay });
        obs.complete();

      } else {

        obs.error(new Error('Selector invalid "' + rebuiltSelector + '"'));
        obs.complete();

      }

    });
  }

}