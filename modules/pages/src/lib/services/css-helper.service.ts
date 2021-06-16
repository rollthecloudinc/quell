import { Injectable } from '@angular/core';
import { JSONNode } from 'cssjson';

@Injectable({
  providedIn: 'root'
})
export class CssHelperService {
  makeJsonNode(): JSONNode {
    return { attributes: {}, children: {} };
  }
}