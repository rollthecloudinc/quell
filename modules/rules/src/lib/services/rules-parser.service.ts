import { Injectable } from '@angular/core';
import { AttributeValue, AttributeTypes } from '@rollthecloudinc/attributes';
import { Field, RuleSet, Rule as NgRule } from 'ngx-angular-query-builder';
import { Rule, NestedCondition } from 'json-rules-engine';

@Injectable({
  providedIn: 'root'
})
export class RulesParserService {

  operatorsMap = new Map<string, string>([
    ['=', 'equal'],
    ['!=', 'notEqual']
  ]);

  constructor() { }

  buildFields(obj: any, prefix = ''): Map<string, Field> {
    const fields = new Map<string, Field>();
    this.genericFields(obj, fields, prefix, 0);
    return fields;
  }


  attributeFields(settings: Array<AttributeValue>, fields: Map<string, Field>, prefix, level) {

    settings.forEach((s, i) => {
      if(s.name !== 'widget') {
        for(const prop in s) {
          if(s.type === AttributeTypes.Complex || (prop === 'attributes' && s.attributes && s.attributes.length > 0)) {
            if(s.type === AttributeTypes.Complex) {
              this.attributeFields(s.attributes, fields, `${prefix}`, level + 1);
            } else {
              this.attributeFields(s.attributes, fields, `${prefix}.${s.name}`, level + 1);
            }
          } else if(prop !== 'attributes') {
            if(prop === s.name) {
              // fields.set(`${prefix}.${prop}`, { name: `${prefix}.${prop}`, type: this.resolveAttributeType(s[prop].type), defaultValue: s[prop] });
              fields.set(`${prefix}.${prop}`, { name: `${prefix}.${prop}`, type: this.resolveAttributeType(s.type), defaultValue: s[prop] });
            } else {
              // fields.set(`${prefix}.${s.name}.${prop}`, { name: `${prefix}.${s.name}.${prop}`, type: this.resolveAttributeType(s[prop].type), defaultValue: s[prop] });
              fields.set(`${prefix}.${s.name}.${prop}`, { name: `${prefix}.${s.name}.${prop}`, type: this.resolveAttributeType(s.type), defaultValue: s[prop] });
            }
          }
        }
      }
    })

  }

  genericFields(obj: any, fields: Map<string, Field>, prefix, level) {
    for(const prop in obj) {
      const type = typeof(obj[prop]);
      if(type !== 'object') {
        fields.set(`${prefix}.${prop}`, { name: `${prefix}.${prop}`, type: this.resolveNativeType(type), defaultValue: obj[prop] });
      } else if(Array.isArray(obj[prop]) && prop === 'attributes') {
        this.attributeFields(obj[prop], fields, `${prefix}.${prop}`, level + 1);
      } else if(Array.isArray(obj[prop])) {
        var len = obj[prop].length;
        for(let i = 0; i < len; i++) {
          this.genericFields(obj[prop][i], fields, `${prefix}.${prop}.${i}`, level + 1);
        }
      } else {
        this.genericFields(obj[prop], fields, `${prefix}.${prop}`, level + 1);
      }
    }
  }

  /**
   * Changes commited on 9/12/2021 have potential to break older panel pages that
   * use context. Although I believe that originally this only worked for one level. Now
   * it works for nested rules. I also can't recall why the field split was limited
   * to only 2 items. That might hav just been laziness or there might have been a valid reason for it.
   * I don't know why that be done instead of using indexOf to make sure the full path is included.
   */
  toEngineRule(rule: RuleSet, level = 0): Rule  {

    const conditions: Array<NestedCondition> = [];

    if(rule.rules === undefined || !Array.isArray(rule.rules)) {
      // const [ fact, path ] = (rule as any).field.split('.', 2);
      const firstDot = (rule as any).field.indexOf('.');
      const fact = (rule as any).field.substr(0, firstDot);
      const path = (rule as any).field.substr(firstDot + 1);
      conditions.push({ fact, path: `$.${path}`, operator: this.operatorsMap.get((rule as any).operator), value: (rule as any).value });
      return new Rule({ conditions: { all: conditions }, event: ( level === 0 ? { type: 'visible' } : undefined ) } );
    } else {
      const len = rule.rules.length;
      for(let i = 0; i < len; i++) {
        if('field' in rule.rules[i] && (rule.condition === undefined || rule.condition === null || rule.condition === '')) {
          // const [ fact, path ] = (rule.rules[i] as NgRule).field.split('.', 2);
          const firstDot = (rule.rules[i] as NgRule).field.indexOf('.');
          const fact = (rule.rules[i] as NgRule).field.substr(0, firstDot);
          const path = (rule.rules[i] as NgRule).field.substr(firstDot + 1);
          conditions.push({ fact, path: `$.${path}`, operator: this.operatorsMap.get((rule.rules[i] as NgRule).operator), value: (rule.rules[i] as NgRule).value });
        } else {
          const nestedRule = this.toEngineRule(rule.rules[i] as RuleSet, level + 1);
          conditions.push(nestedRule.conditions);
        }
      }
      if(rule.condition === 'and') {
        return new Rule({ conditions: { all: conditions }, event: ( level === 0 ? { type: 'visible' } : undefined ) } );
      } else {
        return new Rule({ conditions: { any: conditions }, event: ( level === 0 ? { type: 'visible' } : undefined ) } );
      }
    }
  }

  extractConditions(ngRule: RuleSet, level = 0): Array<NestedCondition> {
    const rule = this.toEngineRule(ngRule);
    return [
      ...( (rule.conditions as any).any !== undefined ? (rule.conditions as any).any : [] ),
      ...( (rule.conditions as any).all !== undefined ? (rule.conditions as any).all : [] )
    ];
  }

  resolveNativeType(type: string) {
    switch(type) {
      case 'number':
        return 'number';

      case 'boolean':
        return 'boolean';

      case 'string':
      default:
        return 'string';
    }
  }

  resolveAttributeType(type: AttributeTypes): string {
    switch(type) {
      case AttributeTypes.Float:
      case AttributeTypes.Number:
        return 'number';

      case AttributeTypes.Bool:
        return 'boolean';

      case AttributeTypes.Text:
      default:
        return 'string';
    }
  }

}
