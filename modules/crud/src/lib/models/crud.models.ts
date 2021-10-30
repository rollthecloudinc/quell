import { Param } from 'dparam';
import { Plugin } from 'plugin';
import { Observable } from 'rxjs';

export type CrudOperations = 'create' | 'read' | 'update' | 'delete';

export type CrudIdentityProvider = ({ object, parentObject }: { object: any, parentObject?: any }) => Observable<{ identity: any }>;

export type CrudOperationResponse = { success: boolean, entity?: any, originalEntity?: any };
export type CrudOperationInput = { object: any, parentObject?: any, identity: CrudIdentityProvider, params?: { [name: string]: Param } };

export class CrudAdaptorPlugin<T = string> extends Plugin<T>  {
  create: ({ object, identity, parentObject }: CrudOperationInput) => Observable<CrudOperationResponse>;
  read: ({ object, identity, parentObject }: CrudOperationInput) => Observable<CrudOperationResponse>;
  update: ({ object, identity, parentObject }: CrudOperationInput) => Observable<CrudOperationResponse>;
  delete: ({ object, identity, parentObject }: CrudOperationInput) => Observable<CrudOperationResponse>;
  constructor(data?: CrudAdaptorPlugin<T>) {
    super(data)
    if (data) {
      this.create = data.create;
      this.read = data.read;
      this.update = data.update;
      this.delete = data.delete;
    }
  }
}
