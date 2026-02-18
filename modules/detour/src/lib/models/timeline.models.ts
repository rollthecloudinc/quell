export type StepRunFn = (ctx: StepContext) => Promise<void> | void;

export interface StepContext {
  pause: () => void;
  resume: () => void;

  // Jump within same group
  skipTo: (weight: number) => void;
  next: () => void;
  prev: () => void;

  // Jump to a different group
  branch: (newGroup: string, weight?: number) => void;
}

export interface TimelineStep {
  group: string;
  weight: number;
  title?: string
  description?: string

  run: StepRunFn;            // the logic for this step
  autoContinue?: boolean;    // false means step must call resume()
  cursorBehavior?: string;   // hook for cursor/ripple system
}

export interface TimelineGroup {
  name: string;
  steps: TimelineStep[];
}