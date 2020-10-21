import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { AuthFacade } from '../+state/auth.facade';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LogoutInterceptor implements HttpInterceptor {

  constructor(private authFacade: AuthFacade, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    return next.handle(req).pipe(
      tap({
        error: (e: HttpErrorResponse) => {
          if(e.status === 401) {
            this.authFacade.logout();
            // alert('You have been automatically logged out due to inactivity. Please login again.');
            //this.router.navigateByUrl('/');
          }
        }
      })
    );

  }
}
