import { Param } from "dparam";

export class EntityDatasource {
  entityName: string;
  params?: Array<Param> = [];
  queryString?: string;
  constructor(data?: EntityDatasource) {
    if (data) {
      this.entityName = data.entityName;
      this.queryString = data.queryString ? data.queryString : '';
      if (data.params && Array.isArray(data.params)) {
        this.params = data.params.map(p => new Param(p));
      }
    }
  }
}