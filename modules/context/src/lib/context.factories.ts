import { ContextPlugin } from './models/context.models';
import { RouteResolver } from './resolvers/route.resolver';
import { BridgeBuilderPlugin, PublicApiBridgeService } from 'bridge';
import { ContextPluginManager } from './services/context-plugin-manager.service';
import { switchMap, take } from 'rxjs/operators';

export const routeContextFactory = (resolver: RouteResolver) => {
  const baseObject = {
    path: '',
    arg0: '',
    arg2: '',
    arg3: '',
    arg4: '',
    arg5: ''
  };
  return new ContextPlugin<string>({ id: 'route', name: 'route', title: 'Route', global: true, baseObject, resolver });
};

export const contextBridgeFactory = (cpm: ContextPluginManager) => {
  return new BridgeBuilderPlugin<string>({
    id: 'context',
    title: 'Context',
    build: () => {
      PublicApiBridgeService.prototype['resolveContext'] = (n: string, data?: any): Promise<any> => {
        return new Promise(res => {
          cpm.getPlugin(n).pipe(
            switchMap(p => p.resolver.resolve(p, data).pipe(
              take(1)
            ))
          ).subscribe(result => {
            res(result);
          });
        });
      }
    }
  }); 
};
