import { CrudAdaptorPlugin, CrudOperationInput, CrudOperationResponse, CrudCollectionOperationInput } from '@rollthecloudinc/crud';
import { ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export const rxdbEntityCrudAdaptorPluginFactory = (paramsEvaluatorService: ParamEvaluatorService) => {
  let isSetup = false;
  const setup = ({ database }) => tap(() => {
    if (!isSetup) {
      isSetup = true;
    }
  });
  return new CrudAdaptorPlugin<string>({
    id: 'rxdb_entity',
    title: 'Rxdb Entity',
    create: ({ object, identity, params }: CrudOperationInput) => of({ success: false }),
    read: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    update: ({ object, identity, params }: CrudOperationInput) => of({ success: false }),
    delete: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    query: ({ rule, params }: CrudCollectionOperationInput) => of({ entities: [], success: false })
  });
};