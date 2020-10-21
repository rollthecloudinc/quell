import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Request } from 'express';
import * as Cookies from 'js-cookie';
import * as numeral from 'numeral';
import { ClientSettings } from '../models/auth.models';
import { TransferState, makeStateKey } from '@angular/platform-browser';

const AUTH_KEY = makeStateKey('auth');

@Injectable()
export class AuthWebStorageService {
  private data = {};
  private isBrowser = isPlatformBrowser(this.platformId);
  private cookieMap = { oa: 'access_token', oi: 'id_token', or: 'refresh_token', os: 'scope', oe: 'expires_at', op: 'profile' };
  private tokenKey = `oidc.user:${this.clientSettings.authority}:${this.clientSettings.client_id}`;

  private req: Request;
  // private res: Response;

  set request(req: Request) {
    this.req = req;
  }

  /*set response(res: Response) {
    this.res = res;
  }*/

  constructor(private clientSettings: ClientSettings, private platformId: Object, private transferState: TransferState) { }

  init() {
    if(this.isBrowser) {
      if(sessionStorage.getItem(this.tokenKey)) {
        this.setItem(this.tokenKey, sessionStorage.getItem(this.tokenKey));
      } else if(this.transferState.hasKey(AUTH_KEY)) {
        const value = this.transferState.get(AUTH_KEY, undefined);
        if(value) {
          this.setItem(this.tokenKey, value);
        }
      } else {
        for(let i = 0;i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          this.setItem(key, sessionStorage.getItem(key));
        }
      }
    } else {
      const token: any = { token_type: 'Bearer' };
      let expires: any;
      Object.getOwnPropertyNames(this.cookieMap).forEach(k => {
        let value = this.getCookie(k);
        if(value && value !== '') {
          value = this.translateFromCookieValue(k, value);
          if(k === 'oe') {
            expires = value;
          } else {
            token[this.cookieMap[k]] = value;
          }
        }
      });
      if(token.access_token) {
        this.data[this.tokenKey] = JSON.stringify(token);
        this.transferState.set(AUTH_KEY, JSON.stringify({ ...token, expires_at: expires }));
      }
    }
  }

  getItem(key: string): any {
    return this.data[key];
  }

  setItem(key: string, value: any ): void {
    if(key === this.tokenKey) {
      const data = JSON.parse(value);
      Object.getOwnPropertyNames(this.cookieMap).forEach(k => {
        this.setCookie(k, this.translateCookieValue(k, data[this.cookieMap[k]]));
      });
    }
    if(this.isBrowser) {
      sessionStorage.setItem(key, value);
    }
    this.data[key] = value;
  }

  removeItem(key: string): void {
    this.removeCookie(key);
    if(this.isBrowser) {
      sessionStorage.removeItem(key);
    }
    delete this.data[key];
  }

  get length(): number {
    return Object.getOwnPropertyNames(this.data).length;
  }

  key(index: number) {
    console.log(`index()`);
    return Object.getOwnPropertyNames(this.data)[index];
  }

  getCookie(key: string): string {
    if(this.isBrowser) {
      return Cookies.get(key);
    } else {
      return this.req.cookies[key] ?? '';
    }
  }

  setCookie(key: string, value: string) {
    if(this.isBrowser) {
      Cookies.set(key, value);
    } else {
      // this.res.cookie(key, value);
    }
  }

  removeCookie(key: string) {
    if(this.isBrowser) {
      Cookies.remove(key);
    } else {
      // this.res.cookie(key, value);
    }
  }

  translateCookieValue(key: string, value: any): string | undefined {
    switch(key) {
      case 'os':
        return value.split(' ').join('|');

      case 'oe':
        return `${value}`;

      case 'op':
        return JSON.stringify(value);

      default:
        return value;
    }
  }

  translateFromCookieValue(key: string, value: any) {
    switch(key) {
      case 'os':
        return value.split('|').join(' ');

      case 'oe':
        return numeral(value).value();

      case 'op':
        return JSON.parse(value);

      default:
        return value;
    }
  }
}
