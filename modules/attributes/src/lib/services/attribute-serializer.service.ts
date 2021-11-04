import { Injectable } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { AttributeValue, AttributeTypes } from '../models/attributes.models';
import { ValueComputerService } from '../services/value-computer.service';
import * as numeral from 'numeral';

@Injectable({
  providedIn: 'root'
})
export class AttributeSerializerService {

  constructor(private valueComputer: ValueComputerService) { }

  serialize(obj: any, prop: string): AttributeValue {

    const type = typeof(obj);

    if(type !== 'object') {
      return new AttributeValue({
        name: prop,
        type: type !== 'string' ? type !== 'boolean' ? AttributeTypes.Number: AttributeTypes.Bool : AttributeTypes.Text,
        displayName: prop,
        value: `${obj}`,
        intValue: undefined,
        computedValue: this.valueComputer.resolveComputedValue(`${obj}`, type !== 'string' ? type !== 'boolean' ? AttributeTypes.Number : AttributeTypes.Bool : AttributeTypes.Text),
        attributes: []
      });
    } else if(Array.isArray(obj) && (prop === 'attributes' || prop === 'settings')) {
      return new AttributeValue({
        name: prop,
        type: AttributeTypes.Complex,
        displayName: prop,
        value: undefined,
        intValue: undefined,
        computedValue: undefined,
        attributes: obj
      });
    } else if(Array.isArray(obj)) {
      const len = obj.length;
      const attrValues: Array<AttributeValue> = [];
      for(let i=0; i < len; i++) {
        if(typeof(obj[i]) !== 'object') {
          // attrValues.push(this.serialize({ value: obj[i] }, `${i}`));
          attrValues.push(this.serialize( obj[i], `${i}`));
        } else {
          attrValues.push(this.serialize(obj[i], `${i}`));
        }
      }
      return new AttributeValue({
        name: prop,
        type: AttributeTypes.Array,
        displayName: prop,
        value: undefined,
        intValue: undefined,
        computedValue: undefined,
        attributes: attrValues
      });
    } else if (obj instanceof Date) {
      // store as string for now.
      return new AttributeValue({
        name: prop,
        type: AttributeTypes.Date,
        displayName: prop,
        value: obj.toJSON(),
        intValue: undefined,
        computedValue: obj.toJSON(),
        attributes: []
      });
    } else {
      const attrValues: Array<AttributeValue>  = [];
      for(const p in obj) {
        attrValues.push(this.serialize(obj[p], p));
      }
      return new AttributeValue({
        name: prop,
        type: AttributeTypes.Complex,
        displayName: prop,
        value: undefined,
        intValue: undefined,
        computedValue: undefined,
        attributes: attrValues
      });
    }

  }

  deserializeAsObject(attrValues: Array<AttributeValue>, ignoreAttributes = false): any {
    return this.deserialize(new AttributeValue({
      name: 'root',
      type: AttributeTypes.Complex,
      displayName: 'root',
      value: undefined,
      computedValue: undefined,
      intValue: 0,
      attributes: attrValues
    }), ignoreAttributes);
  }

  deserialize(attrValue: AttributeValue, ignoreAttributes = false): any {
    let obj: any;
    let len: number;
    switch(attrValue.type) {
      case AttributeTypes.Complex:
        if(!ignoreAttributes && (attrValue.name === 'attributes' || attrValue.name === 'settings')) {
          obj = attrValue.attributes.map(a => new AttributeValue(a));
        } else {
          len = attrValue.attributes.length;
          for(let i = 0; i < len; i++) {
            obj = { ...obj, [attrValue.attributes[i].name]: this.deserialize(attrValue.attributes[i]) }
          }
        }
        break;
      case AttributeTypes.Bool:
        obj = attrValue.value !== undefined ? ['1','true','on'].findIndex(b => b === attrValue.value) > -1 : undefined;
        break;
      case AttributeTypes.Number:
      case AttributeTypes.Float:
        obj = attrValue.value !== undefined && attrValue.value !== '' ? numeral(attrValue.value.trim()).value() : undefined;
        break;
      case AttributeTypes.Text:
        obj = attrValue.value;
        break;
      case AttributeTypes.Array:
        if(!ignoreAttributes && (attrValue.name === 'attributes' || attrValue.name === 'settings')) {
          obj = attrValue.attributes.map(a => new AttributeValue(a));
        } else {
          len = attrValue.attributes.length;
          obj = [];
          for(let i = 0; i < len; i ++) {
            obj = [ ...obj, this.deserialize(attrValue.attributes[i]) ];
          }
        }
        break;
      case AttributeTypes.Date:
        obj = attrValue.value !== undefined && attrValue.value !== '' ? new Date(attrValue.value) : undefined;
        break;
      default:
    }
    return obj;
  }

  convertToGroup(setting: AttributeValue): FormGroup {

    const fg = new FormGroup({
      name: new FormControl(setting.name, Validators.required),
      type: new FormControl(setting.type, Validators.required),
      displayName: new FormControl(setting.displayName, Validators.required),
      value: new FormControl(setting.value, Validators.required),
      computedValue: new FormControl(setting.value, Validators.required),
      attributes: new FormArray([])
    });

    if(setting.attributes && setting.attributes.length > 0) {
      setting.attributes.forEach(s => {
        (fg.get('attributes') as FormArray).push(this.convertToGroup(s));
      })
    }

    return fg;

  }

}
