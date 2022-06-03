import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { FlexLayoutServerModule } from '@angular/flex-layout/server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { HOST_NAME, PROTOCOL } from '@rollthecloudinc/utils';
import { APP_BASE_HREF } from '@angular/common';
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
  providers: [
    /* These are required only for pre-rendering - quick hack to make work for now */
    // { provide: APP_BASE_HREF, useValue: 'http://localhost:4000/' },
    //{ provide: HOST_NAME, useValue: 'g6cljn4j35.execute-api.us-east-1.amazonaws.com' },
    //{ provide: PROTOCOL, useValue: 'https' },
  ]
})
export class AppServerModule {}
