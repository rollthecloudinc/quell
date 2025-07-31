import { Param, ParamEvaluatorService } from "@rollthecloudinc/dparam";
import { InteractionEventPlugin } from "./models/interaction-event.models";
import { InteractionHandlerPlugin } from "./models/interaction-handler.models";
import { map } from "rxjs/operators";
import { Renderer2 } from "@angular/core";
import { Observable } from "rxjs";

export const interactionEventDomFactory = (paramEvaluatorService: ParamEvaluatorService) => {
  return new InteractionEventPlugin<string>({ 
    title: 'DOM', 
    id: 'dom',
    connect: ({ filteredListeners, listenerParams, renderer, callback }) => new Observable(obs => {
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
              if(filteredListeners[i].handler.settings.params) {
                const paramNames = filteredListeners[i].handler.settings.paramsString ? filteredListeners[i].handler.settings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [];
                paramEvaluatorService.paramValues(
                  filteredListeners[i].handler.settings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())
                ).pipe(
                  map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
                ).subscribe((handlerParams) => {
                  // plugin call and pass params
                  // console.log('handler original event and params', e, filteredListeners[i].handler.plugin,  handlerParams);
                  callback({ handlerParams, plugin: filteredListeners[i].handler.plugin, index: i, evt: e });
                })
              } else {
                // plugin call and pass params
                // console.log('handler original event and params', filteredListeners[i].handler.plugin, e);
                callback({ handlerParams: {}, plugin: filteredListeners[i].handler.plugin, index: i, evt: e });
              }
            }
          });
        }
      })(mapTypes)
      const keys = Array.from(mapTypes);
      for (let i = 0; i < keys.length; i++) {
        const type = keys[i][0];
        renderer.listen('document', type, e => {
          eventDelegtionHandler(e);
        });
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