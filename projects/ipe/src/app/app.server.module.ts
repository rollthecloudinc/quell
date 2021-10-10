import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { FlexLayoutServerModule } from '@angular/flex-layout/server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
// import { Log } from 'oidc-client';

//Log.logger = console;
//Log.level = Log.DEBUG;

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    ServerTransferStateModule,
    FlexLayoutServerModule
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
