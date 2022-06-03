import { Injectable } from '@angular/core';
import { ContextResolver, ContextPlugin } from '@rollthecloudinc/context';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { PageBuilderFacade } from '@rollthecloudinc/panels';

@Injectable()
export class PageContextResolver implements ContextResolver {

  constructor(private pageBuilderFacade: PageBuilderFacade) { }

  resolve(ctx: ContextPlugin, data?: any): Observable<any> {
    return this.pageBuilderFacade.getPageInfo$;
    /*return this.pageBuilderFacade.getPageInfo$.pipe(
      take(1)
    );*/
  }
}
