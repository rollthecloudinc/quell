import { AttributeValue, AttributeTypes } from '@ng-druid/attributes';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenizerService {

  constructor() { }

  generateTokens(settings: Array<AttributeValue>): Map<string, any> {
    const tokens = new Map<string, string>();
    this.attributeTokens(settings, tokens, '', 0);
    return tokens;
  }

  generateGenericTokens(obj: any, prefix = ''): Map<string, any> {
    const tokens = new Map<string, string>();
    this.genericTokens(obj, tokens, prefix, 0);
    return tokens;
  }

  attributeTokens(settings: Array<AttributeValue>, tokens: Map<string,any>, prefix, level) {

    settings.forEach((s, i) => {
      if(s.name !== 'widget') {
        for(const prop in s) {
          if(s.type === AttributeTypes.Complex || (prop === 'attributes' && s.attributes && s.attributes.length > 0)) {
            if(s.type === AttributeTypes.Complex) {
              this.attributeTokens(s.attributes, tokens, `${prefix}`, level + 1);
            } else {
              this.attributeTokens(s.attributes, tokens, `${prefix}.${s.name}`, level + 1);
            }
          } else if(prop !== 'attributes') {
            if(prop === s.name) {
              tokens.set(`${prefix}.${prop}`, s[prop]);
            } else {
              tokens.set(`${prefix}.${s.name}.${prop}`, s[prop]);
            }
          }
        }
      }
    })

  }

  genericTokens(obj: any, tokens: Map<string,any>, prefix, level) {
    for(const prop in obj) {
      const type = typeof(obj[prop]);
      if(type !== 'object') {
        tokens.set(`${prefix}.${prop}`, obj[prop]);
      } else if(Array.isArray(obj[prop]) && prop === 'attributes') {
        this.attributeTokens(obj[prop], tokens, `${prefix}.${prop}`, level + 1);
      } else if(Array.isArray(obj[prop])) {
        var len = obj[prop].length;
        for(let i = 0; i < len; i++) {
          this.genericTokens(obj[prop][i], tokens, `${prefix}.${prop}.${i}`, level + 1);
        }
      } else {
        this.genericTokens(obj[prop], tokens, `${prefix}.${prop}`, level + 1);
      }
    }
  }

  replaceTokens(v: string, tokens: Map<string, any>): string {
    if(tokens) {
      tokens.forEach((value, key) => {
        v = v.replace(`[${key}]`, `${value}`);
      });
    }
    return v;
  }

  matchTokens(v: string, tokens: Array<string>): Array<string> {
    const matched: Array<string> = [];
    const len = tokens.length;
    for(let i = 0; i < len; i++) {
      if(v.indexOf(`[${tokens[i]}]`) > -1) {
        matched.push(tokens[i]);
      }
    }
    return matched;
  }

  discoverTokens(v: string, full = false): Array<string> {
    const m = v.match(/(\[(?:\[??[^\[]*?\]))/g);
    if(m === null) {
      return [];
    }
    const matches = m.reduce<Array<string>>((p, c) => {
      if(c.indexOf(' ') !== -1 || c.indexOf('.') === -1) {
        return p;
      }
      // const [ firstPiece ] = c.indexOf('.') === 1 ? c.substr(2, c.length - 1).split('.') : c.substr(1, c.length - 2).split('.');
      const [ firstPiece ] = c.indexOf('.') === 1 ? ['.'] : c.substr(1, c.length - 2).split('.');
      if(p.findIndex(p => p === firstPiece) !== -1) {
        return p;
      }
      return [ ...p, full ? c.substr(1, c.length - 2)  : firstPiece ];
    }, []);
    return matches;
  }

}
