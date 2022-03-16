import { Type, Compiler, Injector, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ModuleLoaderService {
  private loadedModules = [];

  constructor(private compiler: Compiler, private injector: Injector) {

  }
  loadModule(module: () => Promise<Type<any>>): Observable<boolean> {
    return new Observable(obs => {
      module().then(m =>  {
        if (this.loadedModules.indexOf(name => name == m.name) !== -1) {
          throw '';
        } else {
          this.loadedModules.push(m.name);
          return m;
        }
      }).then(m => this.compiler.compileModuleAndAllComponentsAsync(m)).then(mf => {
        const moduleRef = mf.ngModuleFactory.create(this.injector);
        // moduleRef.componentFactoryResolver.resolveComponentFactory(LazyComponent);
        obs.next(true);
        obs.complete();
      }).catch(() => true);
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
