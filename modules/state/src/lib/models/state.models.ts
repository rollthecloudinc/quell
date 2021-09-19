import { AttributeValue } from "attributes";

export class ContextualState {
  id: string;
  value: AttributeValue; 
  constructor(data?: ContextualState) {
    if (data) {
      this.id = data.id;
      this.value = new AttributeValue(data.value);
    }
  }
}