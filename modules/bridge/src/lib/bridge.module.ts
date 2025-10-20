import { NgModule, inject, provideAppInitializer } from '@angular/core';
import { bridgeAppInit, testBridgeFactory } from './bridge.factories';
import { BridgeBuilderService } from './services/bridge-builder.service';
import { BridgeBuilderPluginManager } from './services/bridge-builder-plugin-manager.service';

@NgModule({
  declarations: [],
  imports: [
  ],
  exports: [],
  providers: [
    provideAppInitializer(() => {
        const initializerFn = (bridgeAppInit)(inject(BridgeBuilderService));
        return initializerFn();
      })
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
