import { Injector } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { ClientSettings } from './models/oidc.models';
import { UserManager, WebStorageStateStore } from 'oidc-client';
import { AuthFacade } from '@ng-druid/auth';
import { AuthWebStorageService } from './services/auth-web-storage.service';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
import { TransferState } from '@angular/platform-browser';

export const userManagerFactory = (clientSettings: ClientSettings, authWebStorage: AuthWebStorageService) => {
  const userManager = new UserManager(new ClientSettings({
    ...clientSettings,
    stateStore: new WebStorageStateStore({ store: authWebStorage }),
    userStore: new WebStorageStateStore({ store: authWebStorage })
  }));
  return userManager;
};

export const initAuthFactory = (userManager: UserManager, authFacade: AuthFacade, platformId: Object) => {
  return () => {
    return new Promise<void>(res => {
      userManager.getUser().then(u => {
        if(u) {
          authFacade.setUser(u);
          setTimeout(() => res());
        } else {
          res();
        }
      });
    });
  }
}

export const authWebStorageFactory = (clientSettings: ClientSettings, platformId: Object, injector: Injector, transferState: TransferState) => {
  const svc = new AuthWebStorageService(clientSettings, platformId, transferState);
  /**
   * @todo: This is only thing breaking lambda. For some reason this causes lambda to fail.
   * However, once commented out lambda runs fine but loose auth context on server.
   */
  if(isPlatformServer(platformId)) {
    try {
      svc.request = injector.get(REQUEST);
    } catch (e) {

    }
    // svc.request = injector.injector.get(REQUEST);
    // svc.response = injector.get(RESPONSE);
  }
  svc.init();
  return svc;
};
