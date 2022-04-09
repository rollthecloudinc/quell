import { Injectable } from "@angular/core";
import domElementPath from 'dom-element-path';
import { /*toJSON*/ JSONNode } from 'cssjson';
import { camelize, dasherize, underscore } from 'inflected';
import merge from 'deepmerge-json';
import { debounceTime, filter, Observable, Subject, switchMap, tap } from "rxjs";

const selX = /([^\s\;\{\}][^\;\{\}]*)\{/g;
const endX = /\}/g;
const lineX = /([^\;\{\}]*)\;/g;
const commentX = /\/\*[\s\S]*?\*\//g;
const lineAttrX = /([^\:]+):([^\;]*);/;

// This is used, a concatenation of all above. We use alternation to
// capture.
const altX = /(\/\*[\s\S]*?\*\/)|([^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|([^\;\{\}]+\;(?!\s*\*\/))/gim;

export const isEmpty = function (x: Record<any, any>): boolean {
  return typeof x == 'undefined' || x.length == 0 || x == null;
};

const defaultToJsonArgs = {
  ordered: false,
  comments: false,
  stripComments: false,
  split: false,
};

@Injectable({
  providedIn: 'root'
})
export class StylizerService {

  readonly mutate$ = new Subject<{ record: MutationRecord, overlay: Map<string, any> }>();
  readonly mutated$ = new Subject<{ stylesheet : string }>();

  mutateSub = this.mutate$.pipe(
    filter(({ record }) => record.type === 'attributes' && record.attributeName === 'style' && !!record.target),
    debounceTime(2000),
    switchMap(({ record, overlay }) => this.mapRecord({ record, overlay })),
    tap(({ stylesheet }) => this.mutated$.next({ stylesheet }))
  ).subscribe();

  stylize({ targetNode }: { targetNode: Node }): void {
    const overlay = new Map<string, any>();
    const observer = new MutationObserver((records) => {
      records.forEach(record => {
        this.mutate$.next({ record, overlay });
      });
    });
    const observerOptions = { childList: true, attributes: true, subtree: true, attributeFilter: [ 'style' ], attributeOldValue: true }
    observer.observe(targetNode, observerOptions);
  }

  mapRecord({ record, overlay }: { record: MutationRecord, overlay: Map<string, any> }): Observable<{ stylesheet: string }> {
    return new Observable<{ stylesheet : string }>(obs => {

      const path = domElementPath.default(record.target);
    
      const oldCssAsJson = this.toJSON(`${path} { ${record.oldValue} }`);
      // console.log('oldCssAsJson', oldCssAsJson);

      const oldCssAsObject = oldCssAsJson.children[path] ? Object.keys(oldCssAsJson.children[path].attributes).reduce((p, c) => ({ ...p, [camelize(c.replace('-', '_'), false)]: oldCssAsJson.children[path].attributes[c] }), {}) : undefined;
      // console.log('oldCssAsObject', oldCssAsObject);

      const newCssAsObject = Object.keys((record.target as any).style).reduce((p, c) => parseInt(c) !== NaN && (record.target as any).style.hasOwnProperty(camelize((record.target as any).style[c].replace('-', '_'), false)) ? { ...p, [camelize((record.target as any).style[c].replace('-', '_'), false)]: (record.target as any).style[camelize((record.target as any).style[c].replace('-','_'), false)] } : p, {});
      // console.log('newCssAsObject', newCssAsObject);

      const merged = merge(oldCssAsObject, newCssAsObject);
      // console.log('merged', merged);

      overlay.set(path, merged);
      // console.log('overlay changed', overlay);

      const rules = [];
      overlay.forEach((v, k) => {
        const pieces = k.split(' ');
        const optimizedSelector = pieces.reduce((p, c, i) => c.indexOf('.pane-') !== -1 || c.indexOf('.panel-') !== -1 ? { selector: [ ...p.selector, c.replace(/^(.*?)(\.pane-|\.panel-page|\.panel-)([0-9]*)(.*?)$/,'$2$3') ], chars: p.chars + c.length, lastIndex: p.chars + i + c.length } : { ...p, chars: p.chars + c.length }, { selector: [], chars: 0, lastIndex: 0 });
        if (optimizedSelector.selector.length !== 0) {
          // console.log('after selector', k.slice(optimizedSelector.lastIndex))
          let rebuiltSelector = ( optimizedSelector.selector.join(' ') + ' ' + k.slice(optimizedSelector.lastIndex).split('>').join('') ).replace(/(\.ng\-[a-zA-Z0-9_-]*)/gm,'');
          if (rebuiltSelector.indexOf('.panel-page') === 0) {
            rebuiltSelector = rebuiltSelector.substr(12);
          }
          rules.push(rebuiltSelector + ' { ' + Object.keys(v).reduce((p, c) => `${p}${dasherize(underscore(c))}: ${v[c]};`, ``) + ' }');
        }
      });

      // rules.forEach(r => console.log('rule', r));

      // const mergedCssAsJson = this.toJSON(rules.join(''));
      // console.log('mergedCssAsJson', mergedCssAsJson);
      const stylesheet = rules.join('');

      obs.next({ stylesheet });
      obs.complete();

    });
  }

  /**
   * The library has an error in it. Considering the size of the function its much easier
   * to just copy it here and fix than to do anything else. Should probably move it
   * to a more appropriate module / service though.
   */
  toJSON(
    cssString: string,
    args = defaultToJsonArgs
  ): JSONNode {

    const capComment = 1;
    const capSelector = 2;
    const capEnd = 3;
    const capAttr = 4;

    const node: any = {
      children: {},
      attributes: {},
    };
    let match: any = null;
    let count = 0;
  
    if (args.stripComments) {
      args.comments = false;
      cssString = cssString.replace(commentX, '');
    }
  
    while ((match = altX.exec(cssString)) != null) {
      if (!isEmpty(match[capComment]) && args.comments) {
        // Comment
        node[count++] = match[capComment].trim();
      } else if (!isEmpty(match[capSelector])) {
        // New node, we recurse
        const name = match[capSelector].trim();
        // This will return when we encounter a closing brace
        const newNode = this.toJSON(cssString, args);
        if (args.ordered) {
          // Since we must use key as index to keep order and not
          // name, this will differentiate between a Rule Node and an
          // Attribute, since both contain a name and value pair.
          node[count++] = { name, value: newNode, type: 'rule' };
        } else {
          const bits = args.split ? name.split(',') : [name];
          for (const i in bits) {
            const sel = bits[i].trim();
            if (sel in node.children) {
              for (const att in newNode.attributes) {
                node.children[sel].attributes[att] = newNode.attributes[att];
              }
            } else {
              node.children[sel] = newNode;
            }
          }
        }
      } else if (!isEmpty(match[capEnd])) {
        // Node has finished
        return node;
      } else if (!isEmpty(match[capAttr])) {
        const line = match[capAttr].trim();
        const attr = lineAttrX.exec(line);
        if (attr) {
          // Attribute
          const name = attr[1].trim();
          const value = attr[2].trim();
          if (args.ordered) {
            node[count++] = { name, value, type: 'attr' };
          } else {
            if (name in node.attributes) {
              const currVal = node.attributes[name];
              if (!(currVal instanceof Array)) {
                node.attributes[name] = [currVal];
              }
              node.attributes[name].push(value);
            } else {
              node.attributes[name] = value;
            }
          }
        } else {
          // Semicolon terminated line
          node[count++] = line;
        }
      }
    }
  
    return node;
  };

}