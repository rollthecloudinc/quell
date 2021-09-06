import { APP_INITIALIZER, NgModule } from '@angular/core';
import { bridgeAppInit, testBridgeFactory } from './bridge.factories';
import { BridgeBuilderService } from './services/bridge-builder.service';
import { BridgeBuilderPluginManager } from './services/bridge-builder-plugin-manager.service';

@NgModule({
  declarations: [],
  imports: [
  ],
  exports: [],
  providers: [
    { provide: APP_INITIALIZER, useFactory: bridgeAppInit, deps: [ BridgeBuilderService ], multi: true }
  ]
})
export class BridgeModule { 
  constructor(
    bmp: BridgeBuilderPluginManager
  ) {
    console.log('bridge constructor');
    bmp.register(testBridgeFactory());
  }
}
