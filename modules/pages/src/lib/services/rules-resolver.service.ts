import { Injectable } from '@angular/core';
import { RuleSet } from 'angular2-query-builder';
import { Observable, of, forkJoin } from 'rxjs';
import { RulesParserService } from './rules-parser.service';
import { InlineContext } from '../models/context.models';
import { Engine } from 'json-rules-engine';
import { map, tap, switchMap, take } from 'rxjs/operators';
import { InlineContextResolverService } from './inline-context-resolver.service';
import * as uuid from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class RulesResolverService {

  constructor(
    private rulesParser: RulesParserService,
    private inlineContextResolver: InlineContextResolverService
  ) { }

  evaluate(ngRule: RuleSet, contexts: Array<InlineContext> = []): Observable<boolean> {
    return this.inlineContextResolver.resolveMerged(contexts, `rules:${uuid.v4()}`).pipe(
      take(1),
      map(facts => [{ ...facts }, new Engine()]),
      tap(([facts, engine]) => engine.addRule(this.rulesParser.toEngineRule(ngRule))),
      switchMap(([facts, engine]) => new Observable<boolean>(obs => {
        engine.run(facts).then(res => {
          obs.next(res.events.findIndex(e => e.type === 'visible') > -1);
          obs.complete();
        });
      }))
    );
  }

}
