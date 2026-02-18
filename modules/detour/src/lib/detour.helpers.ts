import { Param, ParamEvaluatorService } from "@rollthecloudinc/dparam";
import { RoleRegistry } from "@rollthecloudinc/utils";
import { firstValueFrom } from "rxjs";
import { TimelineStep } from "./models/timeline.models";

/**
 * Universal handler param resolver.
 *
 * Applies to ALL event types:
 *  - DOM interaction events
 *  - Component registry interaction events
 *  - Macro playback events
 *  - Scripted interactions
 *
 * Merges:
 *  1. Evaluated parameter definitions from handler.settings.params
 *  2. targetParams (e.g. extracted from DOM attributes)
 *
 * Returns a fully evaluated param object ready to be passed to
 * any InteractionHandlerPlugin.
 */
export async function resolveHandlerParams(
  evaluator: ParamEvaluatorService,
  listener: any,
  targetParams: Record<string, any>
): Promise<Record<string, any>> {

  const paramDefs = listener?.handler?.settings?.params;
  const paramString = listener?.handler?.settings?.paramsString;

  // If no declared Param objects, return only raw targetParams
  if (!paramDefs || !paramString) return { ...targetParams };

  // Extract names from the paramsString
  const names = paramString
    .split('&')
    .filter(v => v.includes('=:'))
    .map(v => v.split('=', 2)[1].substring(1));

  // Map the Param definitions
  const map = new Map<string, Param>();
  for (let i = 0; i < paramDefs.length; i++) {
    map.set(names[i], paramDefs[i]);
  }

  // Evaluate all Param definitions
  const evaluatedMap = await firstValueFrom(evaluator.paramValues(map));

  const evaluated = Array.from(evaluatedMap.entries())
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

  // Merge evaluated params with any target-derived params
  return { ...evaluated, ...targetParams };
}

/**
 * Resolve the mouse target element with full fallback logic:
 *
 * Priority:
 *   1. Direct HTMLElement instance
 *   2. CSS selector inside component host element
 *   3. Component property reference (HTMLElement or ElementRef)
 *   4. Global document querySelector fallback
 *   5. null if not found
 */
export function resolveTargetElement(component: any, mouseTarget: any): HTMLElement | null {

  // 1. Direct HTMLElement
  if (mouseTarget instanceof HTMLElement) {
    return mouseTarget;
  }

  // 2. CSS selector inside component host
  if (typeof mouseTarget === 'string') {
    const hostEl: HTMLElement | null =
      component?.elementRef?.nativeElement ??
      component?.el?.nativeElement ??
      component?.hostElement ?? // optional custom patterns
      null;

    if (hostEl) {
      const inside = hostEl.querySelector(mouseTarget);
      if (inside instanceof HTMLElement) return inside;
    }
  }

  // 3. Component property reference (ViewChild, ElementRef, native element)
  if (typeof mouseTarget === 'string' && component?.[mouseTarget]) {
    const ref = component[mouseTarget];

    // HTMLElement directly
    if (ref instanceof HTMLElement) return ref;

    // Angular ElementRef
    if (ref?.nativeElement instanceof HTMLElement) {
      return ref.nativeElement;
    }

    // Some components expose .el instead of elementRef
    if (ref?.el?.nativeElement instanceof HTMLElement) {
      return ref.el.nativeElement;
    }
  }

  // 4. Fallback to GLOBAL document querySelector
  if (typeof mouseTarget === 'string') {
    const globalFound = document.querySelector(mouseTarget);
    if (globalFound instanceof HTMLElement) {
      return globalFound;
    }
  }

  // 5. Not found
  return null;
}

export function waitForComponent(
  role: string,
  scope: string | undefined,
  idx: number,
  registry: RoleRegistry
): Promise<any> {
  return new Promise(resolve => {
    let sub: any = null;
    const check = () => {
      const set = registry.get(role, scope);
      const arr = Array.from(set);
      if (arr[idx]) {
        if(sub) sub.unsubscribe();
          resolve(arr[idx]);
        }
      };

    sub = registry.events$.subscribe(check);
    check();
  });
}

export function squashSteps(steps: TimelineStep[], squashedGroup: string, squashedWeight: number, delayMs: number = 0): TimelineStep {
  const sorted = [...steps].sort((a, b) => a.weight - b.weight);


  function sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  return {
    group: squashedGroup,
    weight: squashedWeight,
    title: sorted[0]?.title,
    description: sorted[0]?.description,

    autoContinue: true,

    run: async (outerCtx) => {
      for (const step of sorted) {
        await step.run({
          pause: outerCtx.pause,
          resume: outerCtx.resume,

          skipTo: () => {},    // disabled inside squash
          next: () => {},
          prev: () => {},
          branch: () => {},
        });
        if (delayMs > 0) {
          await sleep(delayMs);
        }
      }
    }
  };
}

export function stitchSteps(stepsA: TimelineStep[], stepsB: TimelineStep[]): TimelineStep[] {
  if (stepsB.length === 0) throw new Error("stepsB must contain at least one step");

  const newGroup = stepsB[0].group;

  const combined = [...stepsA, ...stepsB];

  return combined
    .map((s, i) => ({
      ...s,
      group: newGroup,
      weight: i,  // re‑weight sequentially
    }));
}

function reweightAndRegroup(steps: TimelineStep[]): TimelineStep[] {
  if (steps.length === 0) return [];

  const newGroup = steps[0].group;

  return steps.map((s, i) => ({
    ...s,
    group: newGroup,
    weight: i
  }));
}

export function sliceSteps(
  steps: TimelineStep[],
  start?: number,
  end?: number
): TimelineStep[] {
  const sliced = steps.slice(start, end);
  return reweightAndRegroup(sliced);
}

export function spliceSteps(
  steps: TimelineStep[],
  start: number,
  deleteCount: number,
  ...items: TimelineStep[]
): TimelineStep[] {
  const result = [
    ...steps.slice(0, start),
    ...items,
    ...steps.slice(start + deleteCount)
  ];

  return reweightAndRegroup(result);
}