import { Injectable } from '@angular/core';
import { Observable, of, combineLatest, merge, forkJoin} from 'rxjs';
import { map, debounceTime, filter, scan, switchMap, defaultIfEmpty, mergeAll } from 'rxjs/operators';
import * as uuid from 'uuid';
import { InlineContext } from '../models/context.models';
import { ContextManagerService } from './context-manager.service';
import { ContextPluginManager } from './context-plugin-manager.service';
import { BaseInlineContextResolverService } from './base-inline-context-resolver.service';
import { ResolvedContextPluginManager } from './resolved-context-plugin-manager.service';

// import { PageBuilderFacade } from '../features/page-builder/page-builder.facade';

@Injectable({
  providedIn: 'root'
})
export class InlineContextResolverService extends BaseInlineContextResolverService {

  constructor(
    // contextManager: ContextManagerService,
    // private pageBuilderFacade: PageBuilderFacade,
    cpm: ContextPluginManager,
    rcm: ResolvedContextPluginManager
  ) {
    super(cpm, rcm);
  }

}
