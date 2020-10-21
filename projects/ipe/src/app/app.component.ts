import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { AuthFacade } from 'auth';
import { Router } from '@angular/router';

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
  constructor(private authFacade: AuthFacade, private router: Router) {
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
