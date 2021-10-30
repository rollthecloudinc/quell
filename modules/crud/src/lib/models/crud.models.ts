import { Param } from 'dparam';
import { Plugin } from 'plugin';
import { Observable } from 'rxjs';
import { Rule } from 'json-rules-engine';

export type CrudOperations = 'create' | 'read' | 'update' | 'delete' | 'query';

export type CrudIdentityProvider = ({ object, parentObject }: { object: any, parentObject?: any }) => Observable<{ identity: any }>;

export type CrudOperationResponse = { success: boolean, entity?: any, originalEntity?: any };
export type CrudOperationInput = { object: any, parentObject?: any, identity: CrudIdentityProvider, params?: { [name: string]: Param } };

export type CrudCollectionOperationInput = { rule: Rule, objects?: Iterable<any>, parentObjects?: Iterable<any>, identity: CrudIdentityProvider, params?: { [name: string]: Param } };

export type CrudCollectionOperationResponse = { success: boolean, entities: Iterable<any>, originalEntities?: Iterable<any> };
export class CrudAdaptorPlugin<T = string> extends Plugin<T>  {
  create: ({ object, identity, parentObject }: CrudOperationInput) => Observable<CrudOperationResponse>;
  read: ({ object, identity, parentObject }: CrudOperationInput) => Observable<CrudOperationResponse>;
  update: ({ object, identity, parentObject }: CrudOperationInput) => Observable<CrudOperationResponse>;
  delete: ({ object, identity, parentObject }: CrudOperationInput) => Observable<CrudOperationResponse>;
  // Query is an extensions to CRUD to support BASIC queries / compatibility with NgRx data service interface.
  // Complex queries / searches will be managed separate from CRUD.
  query?: ({ rule, objects, identity, parentObjects }: CrudCollectionOperationInput) => Observable<CrudCollectionOperationResponse>;
  constructor(data?: CrudAdaptorPlugin<T>) {
    super(data)
    if (data) {
      this.create = data.create;
      this.read = data.read;
      this.update = data.update;
      this.delete = data.delete;
      if (data.query) {
        this.query = data.query;
      }
    }
  }
}
