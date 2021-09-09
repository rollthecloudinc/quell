import { Injectable } from '@angular/core';
import { EntityServices } from '@ngrx/data';
import { ContextResolver, ContextPlugin } from 'context';
import { PanelStateConverterService } from 'panels';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { PageBuilderFacade } from '../features/page-builder/page-builder.facade';

@Injectable()
export class PageStateContextResolver implements ContextResolver {

  constructor(
    private entityServices: EntityServices,
    private pageBuilderFacade: PageBuilderFacade,
    private panelStateConverterService: PanelStateConverterService
  ) { }

  resolve(ctx: ContextPlugin, data?: any): Observable<any> {
    // const svc = this.entityServices.getEntityCollectionService('PanelPageState');
    // return svc.getByKey(data.id);
    return this.pageBuilderFacade.getPage$.pipe(
      tap(pp => {
        console.log('page state context resolver');
        console.log(pp);
      }),
      switchMap(pp => this.panelStateConverterService.convertPageToState(pp)),
      tap(state => {
        console.log('rebuilt state from realtime page');
        console.log(state);
      })
    );
  }
}
