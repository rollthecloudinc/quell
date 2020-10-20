import { ContextPlugin } from './models/context.models';
import { RouteResolver } from './resolvers/route.resolver';

export const routeContextFactory = (resolver: RouteResolver) => {
  const baseObject = {
    path: '',
    arg0: '',
    arg2: '',
    arg3: '',
    arg4: '',
    arg5: ''
  };
  return new ContextPlugin({ name: 'route', title: 'Route', global: true, baseObject, resolver });
};
