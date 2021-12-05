import { Injectable } from '@angular/core';
import { JSONNode } from 'cssjson';

@Injectable({
  providedIn: 'root'
})
export class CssHelperService {
  makeJsonNode(): JSONNode {
    return { attributes: {}, children: {} };
  }
  reduceCss(css: JSONNode, match: string, matches = true): JSONNode {
    return Object.keys(css.children).filter(k => matches ? k.indexOf(match) === 0 : k.indexOf(match) !== 0).reduce<JSONNode>((p, c) => ({  ...p, children: { ...p.children, [matches ? c.substr(c.indexOf(match) + match.length).trim() : c]: css.children[c] } }), this.makeJsonNode());
  }
}