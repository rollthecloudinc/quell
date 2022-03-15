import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
// import { OktaAuthService } from '@okta/okta-angular';
import { AuthFacade } from '@ng-druid/auth';
import { Observable } from 'rxjs';
import { concatMap, take } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authFacade: AuthFacade/*, private oktaAuth: OktaAuthService*/) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    return this.authFacade.token$/*this.getAccessToken()*/.pipe(
      take(1),
      concatMap(t => {
        let headers = req.headers;
        if (req.url.indexOf('/awproxy') !== -1) {
          // headers = headers.delete('cookie');
        }
        if (t && req.url.indexOf('cloudfront') === -1 && req.url.indexOf('cloudinary') === -1 && req.url.indexOf('carquery') === -1 && req.url.indexOf('gateway.marvel.com') === -1 && req.url.indexOf('hereapi.com') === -1 && req.url.indexOf('.es.') === -1 && req.url.indexOf('.s3.') === -1 && req.url.indexOf('/awproxy') === -1) {
          headers = headers.set('Authorization', t)
          const authReq = req.clone({
            // headers: req.headers.set('Authorization', `Bearer ${t}`)
            headers
          });
          return next.handle(authReq)
        } else {
          const cReq = req.clone({ headers });
          return next.handle(cReq);
        }
      })
    );

  }

  /*getAccessToken(): Observable<string | undefined> {
    return new Observable((observer) => {
      this.oktaAuth.isAuthenticated().then((isAuthenticated: boolean) => {
        if(isAuthenticated) {
          this.oktaAuth.getAccessToken().then((token: string) => {
            observer.next(token);
            observer.complete();
          });
        } else {
          observer.next(undefined);
          observer.complete();
        }
      });
    });
  }*/

}
