import { Component, OnInit, Input, OnChanges, AfterContentInit, ElementRef } from '@angular/core';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { TokenizerService } from '@rollthecloudinc/token';
import { SnippetContentHandler } from '../../../handlers/snippet-content.handler';
import { Snippet } from '@rollthecloudinc/snippet';
import { InlineContext } from '@rollthecloudinc/context';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { MarkdownService } from 'ngx-markdown';
@Component({
  selector: 'classifieds-ui-snippet-pane-renderer',
  templateUrl: './snippet-pane-renderer.component.html',
  styleUrls: ['./snippet-pane-renderer.component.scss']
})
export class SnippetPaneRendererComponent implements OnInit, OnChanges, AfterContentInit {

  @Input()
  set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  @Input()
  contexts: Array<InlineContext> = [];

  @Input()
  tokens: Map<string, any>;

  @Input()
  set resolvedContext(resolvedContext: any) {
    this.resolvedContext$.next(resolvedContext);
  }

  afterContentInit$ = new Subject<void>();

  contentType: string;
  content = '';

  content$ = new BehaviorSubject<string>('');
  settings$ = new BehaviorSubject<Array<AttributeValue>>([]);
  snippet$ = new BehaviorSubject<Snippet>(undefined);
  resolvedContext$ = new BehaviorSubject<any>(undefined);
  docRendered$ = new Subject();

  contentSub = combineLatest([
    this.afterContentInit$,
    this.content$,
    this.snippet$,
    this.docRendered$
  ]).subscribe(([_, content, snippet]) => {
    if (snippet && snippet.jsScript && snippet.jsScript !== '') {
      setTimeout(() => this.appendScript(snippet.jsScript));
    }
  });

  renderContentSub = combineLatest([
    this.settings$,
    this.resolvedContext$
  ]).pipe(
    switchMap(([settings, _]) => this.handler.toObject(settings)),
    switchMap(snippet => this.resolveContexts().pipe(
      map<Map<string, any>, [Snippet, Map<string, any> | undefined]>(tokens => [snippet, tokens])
    ))
  )
  .subscribe(async ([snippet, tokens]) => { // Use `async` for handling potential promises
    if (tokens !== undefined) {
      this.tokens = tokens;
    }

    this.contentType = snippet.contentType;
    this.snippet$.next(snippet);

    const replacedTokens = this.replaceTokens(snippet.content);
    let compiledContent: string;

    if (snippet.contentType && snippet.contentType.indexOf('markdown') !== -1) {
      // Resolve if the `parse` method returns a Promise
      compiledContent = await Promise.resolve(this.markdownService.parse(replacedTokens));
    } else {
      compiledContent = replacedTokens;
    }

    this.content$.next(compiledContent); // Now guaranteed to assign a `string`
  });

  constructor(
    private hostEl: ElementRef,
    private handler: SnippetContentHandler,
    private tokenizerService: TokenizerService,
    private markdownService: MarkdownService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    console.log('pane changed');
  }

  ngAfterContentInit() {
    this.afterContentInit$.next();
    this.afterContentInit$.complete();
  }

  replaceTokens(v: string): string {
    if(this.tokens !== undefined) {
      this.tokens.forEach((value, key) => {
        v = v.split(`[${key}]`).join(`${value}`)
      });
    }
    return v;
  }

  resolveContexts(): Observable<undefined | Map<string, any>> {
    return new Observable(obs => {
      let tokens = new Map<string, any>();
      if(this.resolvedContext$.value) {
        for(const name in this.resolvedContext$.value) {
          tokens = new Map<string, any>([ ...tokens, ...this.tokenizerService.generateGenericTokens(this.resolvedContext$.value[name], name === '_root' ? '' : name) ]);
        }
      }
      obs.next(tokens);
      obs.complete();
    });
  }

  appendScript(js: string) {
      let script = document.createElement('script') as HTMLScriptElement;
      script.type = 'text/javascript';
      script.appendChild(document.createTextNode(js));
      this.hostEl.nativeElement.appendChild(script);
      console.log('add script');
  }

  onDocRendered() {
    this.docRendered$.next(undefined);
  }

}
