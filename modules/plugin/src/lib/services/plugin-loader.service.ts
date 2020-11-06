import { Type, Compiler, Injector, Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
// import { PluginDef } from '../models/plugin.models';
import { PluginConfigurationManager } from './plugin-configuration-manager.service';

@Injectable({
  providedIn: 'root'
})
export class PluginLoader  {
  constructor(private pcm: PluginConfigurationManager, private compiler: Compiler, private injector: Injector) {
  }
  loadPlugins(): Observable<boolean> {
    const configs = this.pcm.getConfigs();
    const len = configs.length;
    const loadModules$: Array<Observable<boolean>> = [];
    for(let i = 0; i < len; i++) {
      const len2 = configs[i].modules.length;
      for(let j = 0; j < len2; j++) {
        loadModules$.push(this.loadModule(configs[i].modules[j].module));
      }
    }
    return forkJoin(loadModules$).pipe(
      map(() => true)
    );
  }
  loadModule(module: () => Promise<Type<any>>): Observable<boolean> {
    return new Observable(obs => {
      module().then(m => this.compiler.compileModuleAndAllComponentsAsync(m)).then(mf => {
        const moduleRef = mf.ngModuleFactory.create(this.injector);
        // moduleRef.componentFactoryResolver.resolveComponentFactory(LazyComponent);
        obs.next(true);
        obs.complete();
      });
    });
    /*mport(module)module().then(m => {
      this.compiler.compileModuleAndAllComponentsAsync(m);
      console.log(`module imported: ${module}`);
    });*/
    /*import('./carousel/carousel.module').then(({ CarouselModule }) => {
      const injector = createInjector(CarouselModule, this.injector);
      const carouselModule = injector.get(CarouselModule);
      const componentFactory = carouselModule.resolveCarouselComponentFactory();
    });*/
  }
}
