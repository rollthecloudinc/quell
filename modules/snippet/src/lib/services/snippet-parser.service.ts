import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Snippet } from "../models/snippet.models";

@Injectable({
  providedIn: 'root'
})
export class SnippetParserService {

  parseSnippet({ snippet }: { snippet: Snippet }): Observable<string> {
    return of(snippet.content);
  }

}