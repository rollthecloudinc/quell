import { CrudAdaptorPlugin, CrudOperationResponse, CrudOperationInput } from 'crud';
import { ParamEvaluatorService } from 'dparam';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { set } from 'idb-keyval';

export const idbEntityCrudAdaptorPluginFactory = (paramsEvaluatorService: ParamEvaluatorService) => {
  return new CrudAdaptorPlugin<string>({
    id: 'idb_keyval',
    title: 'Idb Keyval',
    create: ({ object, identity, params, parentObject }: CrudOperationInput) => of({ success: false }).pipe(
      switchMap(() => identity({ object, parentObject }).pipe(
        map(({ identity }) => ({ identity }))
      )),
      switchMap(({ identity }) => params && Object.keys(params).length !== 0 ? forkJoin(Object.keys(params).map(name => paramsEvaluatorService.paramValue(params[name], new Map<string, any>()).pipe(map(v => ({ [name]: v }))))).pipe(
        map(groups => groups.reduce((p, c) => ({ ...p, ...c }), {})), // default options go here instead of empty object.
        map(options => ({ identity, options }))
      ): of({ identity, options: {} })),
      map(({ identity, options }) => ({ name: options.prefix + identity })),
      switchMap(({ name }) => new Observable<CrudOperationResponse>(obs => {
        set(name, object).then(res => {
          console.log('idb write suceeded');
          console.log(res);
          obs.next({ success: true });
          obs.complete();
        }).catch(e => {
          console.log('idb write failed')
          console.log(e);
          obs.next({ success: false })
          obs.complete();
        });
      }))
    ),
    read: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    update: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    delete: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false })
  });
};