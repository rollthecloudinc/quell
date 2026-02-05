import { Param, ParamEvaluatorService } from "@rollthecloudinc/dparam";
import { InteractionEventPlugin } from "./models/interaction-event.models";
import { InteractionHandlerPlugin } from "./models/interaction-handler.models";
import { UIRole, RoleHandlerContext, createRoleHandler, AsyncOrSync, RoleRegistry } from "@rollthecloudinc/utils";
import { map } from "rxjs/operators";
import { Renderer2 } from "@angular/core";
import { firstValueFrom, Observable } from "rxjs";
import { Router } from "@angular/router";

/**
 * Only register type a single time to prevent duplicated events.
 */
const subscriptions = new Map<string, Array<() => void>>();

export const interactionEventDomFactory = (paramEvaluatorService: ParamEvaluatorService) => {
  return new InteractionEventPlugin<string>({ 
    title: 'DOM', 
    id: 'dom',
    connect: ({ filteredListeners, listenerParams, renderer, panelPageId, callback }) => new Observable(obs => {
      /**
       * Panel page coonnected once otherwise unsubscribe.
       */
      if (subscriptions.has(panelPageId)) {
        subscriptions.get(panelPageId).forEach(unsub => unsub());
        subscriptions.delete(panelPageId);
      }
      const mapTypes = new Map<string, Array<number>>();
      const len = filteredListeners.length;
      for (let i = 0; i < len; i++) {
        const type = (listenerParams[i] as  any).type;
        if (mapTypes.has(type)) {
          const targets = mapTypes.get(type);
          targets.push(i);
          mapTypes.set(type, targets);
        } else {
          mapTypes.set(type, [i]);
        }
      }
      const eventDelegtionHandler = (m => e => {
        if (m.has(e.type)) {
          const targets = m.get(e.type);
          const len = targets.length;
          targets.forEach((__, i) => {
            const expectedTarget = (listenerParams[targets[i]] as any).target;
            if (e.target.matches(expectedTarget)) {
              console.log(`delegated target match ${expectedTarget}`);
              const resolvedParamsAttr = e.target.getAttribute('data-resolved-params');
              const targetParams = resolvedParamsAttr ? JSON.parse(resolvedParamsAttr) : {};
              if(filteredListeners[i].handler.settings.params) {
                const paramNames = filteredListeners[i].handler.settings.paramsString ? filteredListeners[i].handler.settings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [];
                paramEvaluatorService.paramValues(
                  filteredListeners[i].handler.settings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())
                ).pipe(
                  map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
                ).subscribe((handlerParams) => {
                  // plugin call and pass params
                  // console.log('handler original event and params', e, filteredListeners[i].handler.plugin,  handlerParams);
                  callback({ handlerParams: { ...handlerParams, ...targetParams }, plugin: filteredListeners[i].handler.plugin, index: i, evt: e });
                })
              } else {
                // plugin call and pass params
                // console.log('handler original event and params', filteredListeners[i].handler.plugin, e);
                callback({ handlerParams: {...targetParams }, plugin: filteredListeners[i].handler.plugin, index: i, evt: e });
              }
            }
          });
        }
      })(mapTypes)
      const keys = Array.from(mapTypes);
      for (let i = 0; i < keys.length; i++) {
        const type = keys[i][0];
        /*if (!globalListeners.has(type)) {
          console.log(`[InteractionEvent] Adding global listener for type '${type}'`);
          renderer.listen('document', type, eventDelegtionHandler);
          globalListeners.add(type);
        }*/
        const unsubscribe = renderer.listen('document', type, e => {
          eventDelegtionHandler(e);
        });
        /**
         * Save all subscriptions to be able to easily unsubscribe later.
         */
        if(!subscriptions.has(panelPageId)) {
          subscriptions.set(panelPageId, []);
        }
        subscriptions.get(panelPageId).push(unsubscribe);
      }
      obs.next({});
      obs.complete();
    })
  });
};

export const interactionHandlerHelloWorldFactory = () => {
  return new InteractionHandlerPlugin<string>({ 
    title: 'Hello World', 
    id: 'hello_world',
    handle: ({}) => {
      console.log("Hello World");
    }
  })
}

export const interactionHandlerNavigateFactory = ({ router } : { router: Router }) => {
  return new InteractionHandlerPlugin<string>({ 
    title: 'Navigate', 
    id: 'navigate',
    handle: ({ handlerParams }) => {
      const path = handlerParams['path'] as string;
      const replace = handlerParams?.['replace'] as boolean ?? false;
      router.navigateByUrl(path, {
        replaceUrl: replace
      });
    }
  }) 
}

export function roleHandlerPluginFactory<R extends UIRole>(
  config: {
    id: string;
    title: string;
    role: string;
    handler: (ctx: RoleHandlerContext<R>) => AsyncOrSync<void>;
  }
): InteractionHandlerPlugin {
  return new InteractionHandlerPlugin({
    id: config.id,
    title: config.title,

    handle: ({ handlerParams, evt, panelPageComponent }) => {
      const invoke = createRoleHandler<R>(config.role, config.handler);

      console.log('we are here in role handler plugin factory', panelPageComponent);

      return invoke(
        panelPageComponent.injector,
        handlerParams,
        evt
      );
    }
  });
}

/**
 * Safe, strict, clean interaction handler generator from JSON configuration.
 */
export function handlerFromJsonFactory<R extends UIRole>(
  opts: {
    pluginId: string;                   // Handler plugin ID (e.g. "toggle_sidenav")
    title: string;                      // Human friendly title
    role?: string;                      // Optional role name for role-based handlers
    handler?: (ctx: RoleHandlerContext<R>) => AsyncOrSync<void>; // Optional role handler
    paramEvaluatorService: ParamEvaluatorService;
  }
): InteractionHandlerPlugin {

  const { pluginId, title, role, handler, paramEvaluatorService } = opts;

  return new InteractionHandlerPlugin({
    id: pluginId,
    title,

    /**
     * Safe handler entrypoint.
     */
    handle: async ({ handlerParams, evt, listener, renderer, panelPageComponent }) => {
      try {
        // Safely compute evaluated JSON parameters.
        const evaluatedParams = handlerParams
          ? await evaluateHandlerParams(paramEvaluatorService, handlerParams)
          : {};

        // If it's a role-based handler → invoke role handler factory
        if (role && handler) {
          const invokeRole = createRoleHandler<R>(role, handler);

          return invokeRole(
            panelPageComponent.injector,
            evaluatedParams,
            evt
          );
        }

        // Default behavior if no role handler is provided
        console.warn(
          `[Interaction] Handler '${pluginId}' executed without a role handler.`
        );

      } catch (err) {
        console.error(
          `[Interaction] Handler '${pluginId}' failed.`,
          err
        );
      }
    }
  });
}

/**
 * Evaluate handler params safely (supports sync/async param evaluation).
 */
async function evaluateHandlerParams(
  paramEvaluatorService: ParamEvaluatorService,
  paramsConfig: any
): Promise<Record<string, any>> {

  if (!paramsConfig || typeof paramsConfig !== 'object') return {};

  const paramEntries = Object.entries(paramsConfig);

  const paramMap = new Map<string, Param>(
    paramEntries.map(([k, v]) => [k, v as Param])
  );

  const evaluated$ = paramEvaluatorService.paramValues(paramMap);

  const result = await firstValueFrom(evaluated$);

  // Convert Map<string, value> → { key: value }
  return Array.from(result.entries()).reduce(
    (acc, [k, v]) => ({ ...acc, [k]: v }),
    {}
  );
}

export function createDynamicInteractionHandlerPlugin<R extends UIRole>(
  config: {
    id: string;
    title: string;
    role: string;
    scope?: string;
    handler: (ctx: RoleHandlerContext<R>) => AsyncOrSync<void>;
  }
): InteractionHandlerPlugin {
  return new InteractionHandlerPlugin({
    id: config.id,
    title: config.title,
    handle: ({ handlerParams, evt, panelPageComponent }) => {
      const registry = panelPageComponent.injector.get(RoleRegistry) as RoleRegistry;
      const instances = registry.get<R>(config.role, config.scope);

      return config.handler({
        roleInstances: instances,
        params: handlerParams,
        event: evt
      });
    }
  });
}