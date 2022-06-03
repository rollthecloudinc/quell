import { Component, OnInit, EventEmitter, Output, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthFacade } from '@rollthecloudinc/auth';
import { Router } from '@angular/router';
import { PublicApiBridgeService } from '@rollthecloudinc/bridge';

declare var bridge: PublicApiBridgeService;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ipe';
  // user$: Observable<User>;
  isAuthenticated: boolean;
  @Output()
  menuClicked = new EventEmitter();
  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private authFacade: AuthFacade, 
    private router: Router,
    publicApiBridge: PublicApiBridgeService
  ) {
    if (isPlatformBrowser(platformId)) {
      bridge = publicApiBridge;
    }
    /*this.oktaAuth.$authenticationState.subscribe(
      (isAuthenticated: boolean)  => this.isAuthenticated = isAuthenticated
    );*/
  }
  ngOnInit() {
    this.authFacade.getUser$.subscribe(u => {
      this.isAuthenticated = !!u;
    });
    /*this.oktaAuth.isAuthenticated().then((value) => {
      this.isAuthenticated = value;
    });*/
  }
  login() {
    this.authFacade.login();
    // this.oktaAuth.loginRedirect();
  }

  menuClick() {
    this.menuClicked.emit();
  }
}
