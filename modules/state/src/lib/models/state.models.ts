import { AttributeValue } from '@ng-druid/attributes';

export class GlobalState {
  id: string;
  value: AttributeValue; 
  constructor(data?: GlobalState) {
    if (data) {
      this.id = data.id;
      this.value = new AttributeValue(data.value);
    }
  }
}