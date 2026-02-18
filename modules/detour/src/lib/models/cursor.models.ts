/**
 * Shared cursor motion options used by CursorOverlayService.
 *
 * These options define how the cursor moves:
 *  - Path mode (Bezier vs Arc)
 *  - Jiggle (human-like noise)
 *  - Overshoot (mouse overshoots target before settling)
 *  - Pauses (thinking hesitation)
 *
 * These options can be overridden per-move.
 */

export type CursorPathMode = 'bezier' | 'arc';

export interface CursorMotionOptions {
  pathMode: CursorPathMode;

  /**
   * Magnitude of random directional noise added to control points.
   * Higher values = more jittery human-like motion.
   */
  jiggleAmount: number;

  /**
   * Whether cursor should overshoot the target slightly then settle back.
   */
  enableOvershoot: boolean;

  /**
   * Whether cursor should occasionally pause before moving
   * (adds human-like hesitation).
   */
  enableThoughtPauses: boolean;
}

/**
 * Default motion options.
 * These apply when no overrides are passed to moveTo().
 */
export const DEFAULT_CURSOR_MOTION_OPTIONS: CursorMotionOptions = {
  pathMode: 'bezier',
  jiggleAmount: 35,
  enableOvershoot: true,
  enableThoughtPauses: true
};