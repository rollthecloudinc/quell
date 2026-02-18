import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TimelineGroup, TimelineStep, StepContext } from '../models/timeline.models';

interface GroupRuntimeState {
  currentWeight$: BehaviorSubject<number | null>;
  isPaused: boolean;
  isRunning: boolean;
  controller?: Promise<void>;
  stepChanged$: Subject<TimelineStep>;
  timelineComplete$: Subject<string>;
  isRunning$: BehaviorSubject<boolean>;
}

@Injectable({ providedIn: 'root' })
export class TimelineEngineService {

  // Static step definitions (shared)
  private groups = new Map<string, TimelineGroup>();

  // Runtime execution state, per group (timeline)
  private runtime = new Map<string, GroupRuntimeState>();

  //--------------------------------------------------------
  // REGISTRATION
  //--------------------------------------------------------
  registerStep(step: TimelineStep) {
    if (!this.groups.has(step.group)) {
      this.groups.set(step.group, { name: step.group, steps: [] });
    }
    const group = this.groups.get(step.group);
    group.steps.push(step);
    group.steps.sort((a, b) => a.weight - b.weight);
  }

  //--------------------------------------------------------
  // LAZY RUNTIME CREATION
  //--------------------------------------------------------
  private ensureRuntime(group: string): GroupRuntimeState {
    if (!this.runtime.has(group)) {
      this.runtime.set(group, {
        currentWeight$: new BehaviorSubject<number | null>(null),
        isPaused: false,
        isRunning: false,
        stepChanged$: new Subject<TimelineStep>(),
        timelineComplete$: new Subject<string>(),
        isRunning$: new BehaviorSubject<boolean>(false)
      });
    }
    return this.runtime.get(group);
  }

  //--------------------------------------------------------
  // PUBLIC API
  //--------------------------------------------------------
  async start(group: string, weight?: number) {
    const rt = this.ensureRuntime(group);
    const g = this.groups.get(group);
    if (!g || g.steps.length === 0) return;

    const startWeight = weight ?? g.steps[0].weight;
    rt.currentWeight$.next(startWeight);

    if (!rt.isRunning) {
      rt.controller = this.runLoop(group);
    }
  }

  pause(group: string) {
    this.ensureRuntime(group).isPaused = true;
  }

  resume(group: string) {
    const rt = this.ensureRuntime(group);
    rt.isPaused = false;

    if (!rt.isRunning) {
      rt.controller = this.runLoop(group);
    }
  }

  async next(group: string) {
    const g = this.groups.get(group);
    const rt = this.ensureRuntime(group);

    const idx = g.steps.findIndex(s => s.weight === rt.currentWeight$.value);

    if (idx < g.steps.length) {
      rt.currentWeight$.next(g.steps[idx + 1].weight);

        // BUGFIX: restart execution if needed
        if (!rt.isRunning && !rt.isPaused) {
            rt.controller = this.runLoop(group);
        }

      return true;
    }

    return false;
  }

  async prev(group: string) {
    const g = this.groups.get(group);
    const rt = this.ensureRuntime(group);

    const idx = g.steps.findIndex(s => s.weight === rt.currentWeight$.value);

    if (idx > 0) {
      rt.currentWeight$.next(g.steps[idx - 1].weight);

    // BUGFIX: restart execution if needed
    if (!rt.isRunning && !rt.isPaused) {
      rt.controller = this.runLoop(group);
    }

      return true;
    }

    return false;
  }

  async goTo(group: string, weight: number) {
    const rt = this.ensureRuntime(group);
    rt.currentWeight$.next(weight);

    if (!rt.isRunning) {
      rt.controller = this.runLoop(group);
    }
  }

  //--------------------------------------------------------
  // EXECUTION LOOP PER GROUP
  //--------------------------------------------------------
  private async runLoop(group: string) {
    const g = this.groups.get(group);
    const rt = this.ensureRuntime(group);

    rt.isRunning = true;
    rt.isRunning$.next(true);

    while (true) {
      if (rt.isPaused) {
        await this.sleep(16);
        continue;
      }

      const weight = rt.currentWeight$.value;
      if (weight == null) break;

      const step = g.steps.find(s => s.weight === weight);
      if (!step) break;

      rt.stepChanged$.next(step);

      const ctx: StepContext = {
        pause: () => rt.isPaused = true,

        resume: () => {
          rt.isPaused = false;
        },

        skipTo: (w) => rt.currentWeight$.next(w),

        next: () => this.next(group),

        prev: () => this.prev(group),

        branch: (newGroup, w) => this.goTo(newGroup, w)
      };

      await step.run(ctx);

      if (!rt.isPaused && step.autoContinue !== false) {
        const hasNext = await this.next(group);
        if (!hasNext) break;
      } else {
        break;
      }
    }

    rt.isRunning = false;
    rt.isRunning$.next(false);
    rt.timelineComplete$.next(group);
  }

  private sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }
}