import { Injectable } from '@angular/core';
import * as cssJson from 'cssjson';

@Injectable({
  providedIn: 'root'
})
export class CssHelperService {
  makeJsonNode(): cssJson.JSONNode {
    return { attributes: {}, children: {} };
  }
  reduceCss(css: cssJson.JSONNode, match: string, matches = true): cssJson.JSONNode {
    return css && css.children ? Object.keys(css.children).filter(k => matches ? k.indexOf(match) === 0 : k.indexOf(match) !== 0).reduce<cssJson.JSONNode>((p, c) => ({  ...p, children: { ...p.children, [matches ? c.substr(c.indexOf(match) + match.length).trim() : c]: css.children[c] } }), this.makeJsonNode()) : this.makeJsonNode();
  }
  reduceSelector(css: {}, match: string, matches = true): any {
    return css ? Object.keys(css).filter(k => matches ? k.indexOf(match) === 0 : k.indexOf(match) !== 0).reduce<any>((p, c) => ({  ...p, [matches ? c.substr(c.indexOf(match) + match.length).trim() : c]: css[c] }), {}) : {};
  }
}