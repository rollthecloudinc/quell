import { AttributeValue, AttributeTypes } from '@rollthecloudinc/attributes';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenizerService {

  // Safeguard against infinite loops
  private readonly MAX_RECURSION_DEPTH = 50;

  constructor() { }

  generateTokens(settings: Array<AttributeValue>): Map<string, any> {
    const tokens = new Map<string, any>();
    this.attributeTokens(settings || [], tokens, '', 0, new Set());
    return tokens;
  }

  generateGenericTokens(obj: any, prefix = ''): Map<string, any> {
    const tokens = new Map<string, any>();
    this.genericTokens(obj, tokens, prefix, 0, new Set());
    return tokens;
  }

  attributeTokens(settings: Array<AttributeValue>, tokens: Map<string, any>, prefix: string, level: number, visited: Set<any>) {
    if (level > this.MAX_RECURSION_DEPTH || !settings || visited.has(settings)) return;
    visited.add(settings);

    settings.forEach((s) => {
      if (!s || s.name === 'widget') return;

      for (const prop in s) {
        if (!Object.prototype.hasOwnProperty.call(s, prop)) continue;

        const hasAttributes = s.attributes && s.attributes.length > 0;
        
        if (s.type === AttributeTypes.Complex || (prop === 'attributes' && s.attributes)) {
          // Maintain original path logic
          const nextPrefix = s.type === AttributeTypes.Complex ? prefix : `${prefix}.${s.name}`;
          this.attributeTokens(s.attributes, tokens, nextPrefix, level + 1, visited);
        } else if (prop !== 'attributes') {
          // Reverting to your exact logic: prefix + . + prop/name
          const tokenKey = prop === s.name ? `${prefix}.${prop}` : `${prefix}.${s.name}.${prop}`;
          tokens.set(tokenKey, s[prop]);
        }
      }
    });
  }

  genericTokens(obj: any, tokens: Map<string, any>, prefix: string, level: number, visited: Set<any>) {
    // Basic types aren't objects, so they don't go into 'visited'
    if (level > this.MAX_RECURSION_DEPTH || obj === null || typeof obj !== 'object') return;
    if (visited.has(obj)) return;
    visited.add(obj);

    for (const prop in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, prop)) continue;
      
      const val = obj[prop];
      const type = typeof val;
      const currentPrefix = `${prefix}.${prop}`;

      if (val === null || type !== 'object') {
        tokens.set(currentPrefix, val);
      } else if (Array.isArray(val) && prop === 'attributes') {
        this.attributeTokens(val, tokens, currentPrefix, level + 1, visited);
      } else if (Array.isArray(val)) {
        val.forEach((item, i) => {
          this.genericTokens(item, tokens, `${currentPrefix}.${i}`, level + 1, visited);
        });
      } else {
        this.genericTokens(val, tokens, currentPrefix, level + 1, visited);
      }
    }
  }

  replaceTokens(v: string, tokens: Map<string, any>): string {
    if (!v || !tokens) return v;
    let result = v;
    tokens.forEach((value, key) => {
      // Your original logic expected the key to include the leading dot
      // result.replace('[.name]', 'Actual Name')
      result = result.split(`[${key}]`).join(`${value}`);
    });
    return result;
  }

  // Restoring your exact discoverTokens logic but with safety
  discoverTokens(v: string, full = false): Array<string> {
    const m = v.match(/(\[(?:\[??[^\[]*?\]))/g);
    if (m === null) return [];

    const matches = m.reduce<Array<string>>((p, c) => {
      if (c.indexOf(' ') !== -1 || c.indexOf('.') === -1) return p;
      
      // Keep the leading dot logic from your original
      const content = c.substr(1, c.length - 2);
      const [ firstPiece ] = c.indexOf('.') === 1 ? ['.'] : content.split('.');
      
      if (p.findIndex(item => item === firstPiece) !== -1) return p;
      
      return [ ...p, full ? content : firstPiece ];
    }, []);
    return matches;
  }
}