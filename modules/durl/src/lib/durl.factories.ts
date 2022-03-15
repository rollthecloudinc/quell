import { ActivatedRoute } from "@angular/router";
import { Param, ParamPlugin } from '@ng-druid/dparam';
import { of } from "rxjs";

export const paramPagePluginFactory = () => {
  return new ParamPlugin<string>({ 
    id: 'page',
    title: 'Page',
    usedContexts: () => of(['_page']),
    condition: ({ param, metadata }: { param: Param, metadata: Map<string, any> })  => {
      return param.flags.findIndex(f => f.enabled && f.name === 'page') > -1 && metadata.has('page');
    },
    evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> })  => {
      return of(`${metadata.get('page')}`);
    }
  });
}

export const paramSearchStringPluginFactory = () => {
  return new ParamPlugin<string>({ 
    id: 'searchstring',
    title: 'Searchstring',
    condition: ({ param, metadata }: { param: Param, metadata: Map<string, any> })  => {
      return param.flags.findIndex(f => f.enabled) > -1 && metadata.has('searchString');
    },
    evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> })  => {
      return of(`${metadata.get('searchString')}`);
    }
  });
}

export const paramRoutePluginFactory = () => {
  return new ParamPlugin<string>({ 
    id: 'route',
    title: 'Route',
    usedContexts: () => of(['_route']),
    evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> })  => {
      const route = metadata.get('_route') as ActivatedRoute;
      return of(route.params[param.mapping.value]);
    }
  });
}

export const paramQueryStringPluginFactory = () => {
  return new ParamPlugin<string>({ 
    id: 'querystring',
    title: 'Querystring',
    usedContexts: () => of(['_page']),
    evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> })  => {
      const route = metadata.get('_route') as ActivatedRoute;
      return of(route.queryParams[param.mapping.value]);
    }
  });
}

export const paramStandardPaginationPluginFactory = () => {
  return new ParamPlugin<string>({ 
    id: 'standardpagination',
    title: 'Standard Pagination',
    usedContexts: () => of(['_page']),
    condition: ({ param, metadata }: { param: Param, metadata: Map<string, any> })  => {
      return param.flags.findIndex(f => f.enabled && f.name === 'offset') > -1 && metadata.has('limit') && metadata.has('page');
    },
    evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> })  => {
      return of(`${+metadata.get('limit') * (+metadata.get('page') - 1)}`);
    }
  });
}