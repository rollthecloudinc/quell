import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

import { AuthFacade } from '../../+state/auth.facade';

@Component({
  selector: 'classifieds-ui-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.scss']
})
export class AuthCallbackComponent implements OnInit {

  error: boolean;

  constructor(private authFacade: AuthFacade, private router: Router, private route: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object) {}

  async ngOnInit() {

    // check for error
    /*if (this.route.snapshot.fragment.indexOf('error') >= 0) {
       this.error=true;
       return;
     }*/

    //if(isPlatformBrowser(this.platformId)) {
      this.authFacade.completeAuthentication();
      this.router.navigate(['/'], { queryParams: { cacheBuster: uuidv4() }});
    //}

  }

}
