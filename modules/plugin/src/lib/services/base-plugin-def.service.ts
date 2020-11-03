import { Observable, of } from 'rxjs';
// import { PluginDef } from '../models/plugin.models';
import { PluginConfigurationManager } from './plugin-configuration-manager.service';

export class BasePluginDef<T>  {
  constructor(private pcm: PluginConfigurationManager) {
  }
  getPlugins(): Observable<Array<T>> {
    const configs = this.pcm.getConfigs();
    const len = configs.length;
    for(let i = 0; i < len; i++) {
      const len2 = configs[i].modules.length;
      for(let j = 0; j < len2; j++) {
        this.loadModule(configs[i].modules[j].module);
      }
    }
    return of([]);
  }
  loadModule(module: string) {
    import(module).then(() => {
      console.log(`module imported: ${module}`);
    });
    /*import('./carousel/carousel.module').then(({ CarouselModule }) => {
      const injector = createInjector(CarouselModule, this.injector);
      const carouselModule = injector.get(CarouselModule);
      const componentFactory = carouselModule.resolveCarouselComponentFactory();
    });*/
  }
}
