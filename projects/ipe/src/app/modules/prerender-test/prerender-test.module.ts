import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { PrerenderTestComponent } from "./prerender-test.component";

const routes = [
  { path: '', component: PrerenderTestComponent  },
];

@NgModule({
  declarations: [ 
    PrerenderTestComponent 
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
  ]
})
export class PrerenderTestModule { }