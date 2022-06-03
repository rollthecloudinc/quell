import { Injectable } from '@angular/core';
import { ContextResolver, ContextPlugin } from '@rollthecloudinc/context';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { PageBuilderFacade } from '@rollthecloudinc/panels';

@Injectable()
export class FormContextResolver implements ContextResolver {

  constructor(private pageBuilderFacade: PageBuilderFacade) { }

  resolve(ctx: ContextPlugin, data?: any): Observable<any> {
    return this.pageBuilderFacade.getForm$(data);
    /*return this.pageBuilderFacade.getPageInfo$.pipe(
      take(1)
    );*/
  }
}
