import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

console.log('bootstrap');

if (environment.production) {
  enableProdMode();
}

/*platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));*/

  // this no longer works with module federation changes... hm
  // I think this was added to ssr... need to figure out if its needed or what the purpose of it is.
  /*document.addEventListener("DOMContentLoaded", () => {
    console.log('dom content loaded');
    platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch(err => console.log(err));
  });*/

  platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.log(err));
