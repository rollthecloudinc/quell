import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: "classifieds-ui-page-router-link",
  templateUrl: './page-router-link.component.html',
  styleUrls: ['./page-router-link.component.scss']
})
export class PageRouterLinkComponent implements OnInit {
  @Input() public href: string;
  @Input() public text: string;

  constructor(private router: Router) { }

  ngOnInit(): void {
    //console.log("Here");
  }

  onClick() {
    this.router.navigateByUrl(this.href);
  }

}
