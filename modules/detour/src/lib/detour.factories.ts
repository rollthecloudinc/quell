import { Param, ParamEvaluatorService } from "@rollthecloudinc/dparam";
import { InteractionEventPlugin } from "./models/interaction-event.models";
import { InteractionHandlerPlugin } from "./models/interaction-handler.models";
import { UIRole, RoleHandlerContext, createRoleHandler, AsyncOrSync, RoleRegistry } from "@rollthecloudinc/utils";
import { map } from "rxjs/operators";
import { Renderer2 } from "@angular/core";
import { firstValueFrom, Observable } from "rxjs";
import { Router } from "@angular/router";
import { CursorOverlayService } from "./services/cursor-overlay.service";
import { resolveHandlerParams, resolveTargetElement, waitForComponent } from "./detour.helpers";
import { TimelineEngineService } from "./services/timeline-engine.service";

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

export const interactionEventComponentFactory = (
  evaluator: ParamEvaluatorService,
  registry: RoleRegistry,
  timeline: TimelineEngineService
) => {
  return new InteractionEventPlugin({
    id: 'component',
    title: 'Component Event',

    connect: ({ filteredListeners, listenerParams, panelPageId, callback }) =>
      new Observable(obs => {
        const groups = new Map<
          string,
          { i: number; params: any; listener: any }[]
        >();

        // Group listeners by `group`, sort by weight
        filteredListeners.forEach((listener, index) => {
          const params = listenerParams[index];
          const g = params.group ?? '__default__';

          if (!groups.has(g)) groups.set(g, []);
          groups.get(g)!.push({ i: index, params, listener });
        });

        groups.forEach(items =>
          items.sort((a, b) => (a.params.weight ?? 0) - (b.params.weight ?? 0))
        );

        // For each group, register timeline steps INSTEAD of running handlers
        groups.forEach(items => registerGroupSteps(items));

        async function registerGroupSteps(items: any[]) {
          for (const item of items) {
            // ---------------------------------------------------------
            // REGISTER TIMELINE STEP (instead of auto-executing)
            // ---------------------------------------------------------
            timeline.registerStep({
              group: item.params.group ?? '__default__',
              weight: item.params.weight ?? 0,

              autoContinue: false, // let controller decide when to advance

              cursorBehavior: item.params.cursorBehavior, // optional cursor system hook

              run: async (ctx) => {

                const { role, scope, index } = item.params;

                // Wait for component
                const component = await waitForComponent(role, scope, index, registry);

                // Resolve handler params
                const resolvedParams = await resolveHandlerParams(
                  evaluator,
                  item.listener,
                  {}
                );

                // When this step is executed by the timeline:
                callback({
                  handlerParams: resolvedParams,
                  plugin: item.listener.handler.plugin,
                  index: item.i,
                  evt: { component }
                });

                // If this step wants manual user confirmation before moving on:
                // ctx.pause();
                // await userConfirmsOrClicks();
                // ctx.resume();
              }
            });
          }
        }

        obs.next({});
        obs.complete();
      })
  });
};

export const interactionEventImmediateFactory = (
  evaluator: ParamEvaluatorService
) => {
  return new InteractionEventPlugin({
    id: 'immediate',
    title: 'Immediate',

    /**
     * Immediately execute all listeners.
     *
     * No DOM events.
     * No role-waiting.
     * No timeline delays.
     *
     * Useful for:
     *   - Auto-registering timeline steps
     *   - Initial data setup handlers
     *   - Component bootstrap handlers
     */
    connect: ({ filteredListeners, listenerParams, callback }) =>
      new Observable(obs => {

        const run = async () => {
          for (let i = 0; i < filteredListeners.length; i++) {
            const listener = filteredListeners[i];
            const paramsCfg = listenerParams[i];

            // Resolve handler params using shared logic
            const handlerParams = await resolveHandlerParams(
              evaluator,
              listener,
              paramsCfg   // raw immediate params
            );

            // Immediately invoke the associated handler
            callback({
              handlerParams,
              plugin: listener.handler.plugin,
              index: i,
              evt: { type: 'immediate' }
            });
          }

          obs.next({});
          obs.complete();
        };

        run();
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

/**
 * Flags:
 *   - handlerParams.mouseTarget : string | HTMLElement
 *   - handlerParams.method      : string
 *
 * All remaining params are passed into the method called on the matched component.
 *
 * evt.component is supplied by the Component Interaction Event plugin
 * (OR by macros, OR by scripted handlers, OR by DOM as needed).
 */
export function interactionHandlerDriverFactory(cursor: CursorOverlayService) {

  return new InteractionHandlerPlugin({
    id: 'driver',
    title: 'Driver',

    /**
     * Driver entrypoint.
     *
     * Matches:
     *   - Component event: evt.component => role-matched component instance
     *   - DOM event: evt => native event (rare for driver, but allowed)
     *   - Macro event: evt.component supplied by macro playback
     *
     * Params:
     *   handlerParams = evaluated values from resolveHandlerParams()
     */
    handle: async ({ handlerParams, evt, listener, renderer, panelPageComponent }) => {

      // Expecting evt.component when using component-based interactions
      const component = evt?.component;
      if (!component) {
        console.warn('[InteractionDriver] No component instance available for driver.');
        return;
      }

      const methodName = (handlerParams as any).method;
      const mouseTarget = (handlerParams as any).mouseTarget;

      if (!methodName || typeof methodName !== 'string') {
        console.error('[InteractionDriver] "method" param missing or invalid:', methodName);
        return;
      }

      // Extract final params — remove flagged ones
      const finalParams: Record<string, any> = {};
      for (const key of Object.keys(handlerParams)) {
        if (key !== 'method' && key !== 'mouseTarget') {
          finalParams[key] = handlerParams[key];
        }
      }

      //----------------------------------------------------------
      // 1. Resolve the mouseTarget and move cursor (if supplied)
      //----------------------------------------------------------
      if (mouseTarget) {
        const targetEl = resolveTargetElement(component, mouseTarget);

        if (targetEl instanceof HTMLElement) {
          cursor.moveTo(targetEl, {
            // You may override motion options here per-move if desired.
            // Example: pathMode: 'arc'
          });
        } else {
          console.warn('[InteractionDriver] mouseTarget did not resolve to HTMLElement:', mouseTarget);
        }
      }

      //----------------------------------------------------------
      // 2. Invoke the component method
      //----------------------------------------------------------
      const method = component[methodName];

      if (typeof method !== 'function') {
        console.error(`[InteractionDriver] Method "${methodName}" not found on component:`, component);
        return;
      }

      try {
        const result = method.call(component, finalParams);

        // Handle async returns
        if (result instanceof Promise) {
          await result;
        } else if (result?.subscribe) {
          await result.toPromise();
        }
      } catch (err) {
        console.error(`[InteractionDriver] Error while invoking method "${methodName}":`, err);
      }

      //----------------------------------------------------------
      // 3. Optionally trigger a click ripple if the interaction
      //    logically represents a click-type action.
      //    This is opt‑in: driver plugins or param flags may
      //    request it.
      //----------------------------------------------------------
      if ((handlerParams as any)?.click === true) {
        cursor.clickBurst();
      }
    }
  });
}

export const interactionHandlerTimelineFactory = (
  cursor: CursorOverlayService,
  timeline: TimelineEngineService
) => {

  return new InteractionHandlerPlugin({
    id: 'timeline',
    title: 'Timeline',

    handle: async ({ handlerParams, evt }) => {
      const action = (handlerParams as any)?.action;

      const group = (handlerParams as any)?.group;
      const weight = (handlerParams as any)?.weight;
      const mouseTarget = (handlerParams as any)?.mouseTarget;

      switch (action) {
        case 'next':
          await timeline.next(group);
          break;

        case 'prev':
          await timeline.prev(group);
          break;

        case 'start':
          await timeline.start(group, weight);
          break;

        case 'goto':
          await timeline.goTo(group, weight);
          break;

        case 'pause':
          timeline.pause(group);
          break;

        case 'resume':
          timeline.resume(group);
          break;

        case 'cursor.move':
          cursor.moveTo(mouseTarget);
          break;

        case 'cursor.click':
          cursor.clickBurst();
          break;
      }
    }
  });
};