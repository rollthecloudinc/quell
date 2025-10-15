import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpMethods } from "@ngrx/data";
import { AttributeValue, AttributeSerializerService } from '@rollthecloudinc/attributes';
import { Dataset, DatasourceApiService } from '@rollthecloudinc/datasource';
import { UrlGeneratorService } from '@rollthecloudinc/durl';
import { Param, ParamEvaluatorService } from "@rollthecloudinc/dparam";
import { Observable, of } from "rxjs";
import { catchError, filter, map, switchMap, tap } from "rxjs/operators";
import { SnippetParserService } from '@rollthecloudinc/snippet';
import { Rest } from '../models/rest.models';
import { restfulRequest } from "../rest.factories";

@Injectable()
export class RestFetchHelperService {
  
  constructor(
    private attrbuteSerializer: AttributeSerializerService,
    // private datasourceApi: DatasourceApiService,
    private http: HttpClient,
    private snippetParserService: SnippetParserService,
    private urlGenerator: UrlGeneratorService,
    private paramsEvaluatorService: ParamEvaluatorService
  ) {}

  fetchDataset({ settings, metadata }: { settings: Array<AttributeValue>, metadata: Map<string, any> }): Observable<Dataset> {
    console.log('metadata', metadata);
    return of(new Dataset()).pipe(
      tap(() => console.log('START rest fetch')),
      map(() => this.attrbuteSerializer.deserializeAsObject(settings)),
      map<any, Rest>(s => new Rest(s)),
      switchMap(r => this.urlGenerator.getUrl(r.url, r.params, metadata).pipe(
        map(url => [new Rest({ ...r, url }), r])
      )),
      switchMap(([_, r]) => {
        if(r.method.toUpperCase() === 'POST' && r.body && r.body.contentType === 'application/json') {
          const urlParams = this.parseUrl(r.url);
          const bodyParams = r.body && r.body.contentType === 'application/json' ? this.parseBody(r.body.content) : {};
          const combinedParams = { ...urlParams, ...bodyParams };
          const mappedParams = this.mapKeyToParam(combinedParams, r.params || []);
          Object.keys(urlParams).forEach(p => mappedParams.delete(p));

          // Evaluate param values and replace placeholders recursively in JSON
          return this.paramsEvaluatorService.paramValues(mappedParams).pipe(
            tap(bodyParams => console.log('Evaluated body params', bodyParams)),
            map(bodyParams => {
              let bodyObject = JSON.parse(r.body.content);

              // Recursively replace keys/values in the JSON body using the mapping
              bodyObject = this.replaceTokensInJson(bodyObject, bodyParams);

              return bodyObject;
            }),
            map(body => [_, body] as [Rest, {}])
          )
        } else {
          return of([_, {}] as [Rest, {}]);
        }
      }),
      filter(([r]) => r.url && r.url.trim() !== '' && r.url.indexOf('http') > -1),
      switchMap(([r, data]) => restfulRequest({ url: r.url, method: r.method.toUpperCase() === 'POST' ? 'POST' : 'GET', ...(r.method.toUpperCase() === 'POST' && r.body && r.body.contentType === 'application/json'?{ data }:{}) , http: this.http, params: new Map<string, any>() }).pipe(
        catchError(() => of([])),
        map(data => Array.isArray(data) ? data: [data]),
        // tap(data => this.cache.set(url, data))
        map(results => new Dataset({ results }))
      )),
      tap(() => console.log('END rest fetch'))

      // phase out
      /*switchMap<Rest, Observable<Dataset>>(r => {
        const method = r.method ? r.method : 'get';
        switch(method) {
          case 'post':
          case 'POST':
            return of([]).pipe(
              switchMap(() => this.snippetParserService.parseSnippet({ snippet: r.body })),
              switchMap(body => this.datasourceApi.postData({ url: r.url, body })),
              map(results => new Dataset({ results }))
            );
    
          default:
            return this.datasourceApi.getData(r.url).pipe(
              map(results => new Dataset({ results }))
            );
        }

      })*/
    );
  }

  parseUrl(url: string): Record<string, string> {
    const placeholderRegex = /:([a-zA-Z0-9_]+)/g;
    const result: Record<string, string> = {};
    let match;

    // Use the regex to find all :placeholders in the string
    while ((match = placeholderRegex.exec(url)) !== null) {
      const key = match[1]; // Extract the key (e.g., id, hello, whatever)
      result[key] = `:${key}`; // Map key to its full placeholder
    }

    return result;
  }

  parseBody(input: any): Record<string, string> {
    const placeholderRegex = /\[:([a-zA-Z0-9_]+)\]/g;
    const result: Record<string, string> = {};
    // Recursive function to traverse the input object
    function traverse(obj: any): void {
      if (typeof obj === "string") {
        let match;
        while ((match = placeholderRegex.exec(obj)) !== null) {
          const key = match[1]; // Extract the key inside the placeholder
          result[key] = `:${key}`; // Map key to value without brackets
        }
      } else if (Array.isArray(obj)) {
        for (const item of obj) {
          traverse(item);
        }
      } else if (typeof obj === "object" && obj !== null) {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            traverse(obj[key]);
          }
        }
      }
    }
    traverse(input);
    return result;
  }

  mapKeyToParam(
    record: Record<string, string>,
    params: Param[]
  ): Map<string, Param> {
    const resultMap = new Map<string, Param>();
    const recordKeys = Object.keys(record);

    // Iterate over each key in the record object
    recordKeys.forEach((key, index) => {
      // Check if there is a corresponding param; if not, skip
      if (index < params.length) {
        resultMap.set(key, params[index]);
      }
    });

    return resultMap;
  }

  /**
   * Recursively replaces keys/values in a JSON object or array using the token map.
   * @param obj The JSON object or array to process.
   * @param tokenMap The map of tokens to replace.
   * @returns The processed JSON structure.
   */
  replaceTokensInJson(obj: any, tokenMap: Map<string, any>): any {
    if (typeof obj === "string") {
      // Replace tokens within a string value
      for (const [token, param] of tokenMap) {
        obj = obj.replace(new RegExp(`\\[:${token}\\]`, 'g'), param.toString());
        obj = obj.replace(new RegExp(`:${token}`, 'g'), param.toString()); // Support for :token form
      }
      return obj;
    } else if (Array.isArray(obj)) {
      // Recursively process each item in the array
      return obj.map(item => this.replaceTokensInJson(item, tokenMap));
    } else if (typeof obj === "object" && obj !== null) {
      // Process each key-value pair in the object
      const processed: Record<string, any> = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          let newKey = key;
          
          // Check and replace the key itself if it matches a token
          for (const [token, param] of tokenMap) {
            newKey = newKey.replace(new RegExp(`\\[:${token}\\]`, 'g'), param.toString());
            newKey = newKey.replace(new RegExp(`:${token}`, 'g'), param.toString()); // Support for :token form
          }

          // Recursively process the value
          processed[newKey] = this.replaceTokensInJson(obj[key], tokenMap);
        }
      }
      return processed;
    } else {
      // For any other type, return it as-is
      return obj;
    }
  }

}