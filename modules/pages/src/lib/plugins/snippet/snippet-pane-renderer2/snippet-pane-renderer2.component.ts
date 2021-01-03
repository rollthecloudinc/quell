import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { AttributeValue } from 'attributes';
import { TokenizerService } from 'token';
import { SnippetContentHandler } from '../../../handlers/snippet-content.handler';
import { Snippet } from 'content';
import { InlineContext } from 'context';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'classifieds-ui-snippet-pane-renderer2',
  templateUrl: './snippet-pane-renderer2.component.html',
  styleUrls: ['./snippet-pane-renderer2.component.scss']
})
export class SnippetPaneRenderer2Component implements OnInit, OnChanges {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  contexts: Array<InlineContext> = [];

  @Input()
  tokens: Map<string, any>;

  @Input()
  resolvedContext: any;

  contentType: string;
  content: string;

  constructor(
    private handler: SnippetContentHandler,
    private tokenizerService: TokenizerService
  ) { }

  ngOnInit(): void {
    this.handler.toObject(this.settings).pipe(
      switchMap(snippet => this.resolveContexts().pipe(
        map<Map<string, any>, [Snippet, Map<string, any> | undefined]>(tokens => [snippet, tokens])
      ))
    ).subscribe(([snippet, tokens]) => {
      if(tokens !== undefined) {
        this.tokens = tokens;
      }
      this.contentType = snippet.contentType;
      this.content = this.replaceTokens(snippet.content);
    });
  }

  ngOnChanges(): void {
    console.log('pane changed');
    this.handler.toObject(this.settings).pipe(
      switchMap(snippet => this.resolveContexts().pipe(
        map<Map<string, any>, [Snippet, Map<string, any> | undefined]>(tokens => [snippet, tokens])
      ))
    ).subscribe(([snippet, tokens]) => {
      if(tokens !== undefined) {
        this.tokens = tokens;
      }
      this.contentType = snippet.contentType;
      this.content = this.replaceTokens(snippet.content);
    });
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
      if(this.resolvedContext) {
        for(const name in this.resolvedContext) {
          tokens = new Map<string, any>([ ...tokens, ...this.tokenizerService.generateGenericTokens(this.resolvedContext[name], name === '_root' ? '' : name) ]);
        }
      }
      obs.next(tokens);
      obs.complete();
    });
  }

}
