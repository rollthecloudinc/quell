import { Param } from 'dparam';
import { Plugin } from 'plugin';
import { Observable } from 'rxjs';

export type CrudIdentityProvider = ({ object }: { object: any }) => Observable<{ identity: any }>;

export type CrudOperationResponse = { success: boolean };
export type CrudOperationInput = { object: any, identity: CrudIdentityProvider, params?: { [name: string]: Param } };

export class CrudAdaptorPlugin<T = string> extends Plugin<T>  {
  create: ({ object, identity }: CrudOperationInput) => Observable<CrudOperationResponse>;
  read: ({ object, identity }: CrudOperationInput) => Observable<CrudOperationResponse>;
  update: ({ object, identity }: CrudOperationInput) => Observable<CrudOperationResponse>;
  delete: ({ object, identity }: CrudOperationInput) => Observable<CrudOperationResponse>;
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
