import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UtilsModule  } from '@rollthecloudinc/utils';
import { CatchAllGuard } from './guards/catchall.guard';
import { CatchAllRouterComponent } from './components/catch-all-router/catch-all-router.component';

const routes = [
  // { path: '**', component: CatchAllRouterComponent, canActivate: [ CatchAllGuard ] }
];

@NgModule({
  declarations: [CatchAllRouterComponent],
  imports: [
    UtilsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    CatchAllRouterComponent
  ],
  providers: [
    // CatchAllGuard
  ]
})
export class AliasModule { }
