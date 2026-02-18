import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CursorOverlayComponent } from '../components/cursor-overlay/cursor-overlay.component';
import {
  CursorMotionOptions,
  DEFAULT_CURSOR_MOTION_OPTIONS as defaultCursorMotionOptions
} from '../models/cursor.models';

interface Point {
  x: number;
  y: number;
}

interface PathSegment {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
  length: number;
}

@Injectable({ providedIn: 'root' })
export class CursorOverlayService {

  private overlayRef?: OverlayRef;
  private componentInstance?: CursorOverlayComponent;

  private isPaused = false;
  private isAnimating = false;

  private queue: Array<{ el: HTMLElement; opts?: Partial<CursorMotionOptions> }> = [];
  private resolver?: () => void;

  // Macro system
  private isRecording = false;
  private macro: any[] = [];

  constructor(
    private overlay: Overlay,
    private injector: Injector
  ) {}

  // -------------------------------------------------------
  // PUBLIC API
  // -------------------------------------------------------

  moveTo(el: HTMLElement, opts?: Partial<CursorMotionOptions>) {
    this.record({ type: 'move', el, opts });

    this.queue.push({ el, opts });
    this.processQueue();
  }

  clickBurst() {
    this.record({ type: 'click' });
    if (this.componentInstance) this.componentInstance.burst();
  }

  wait(ms: number) {
    this.record({ type: 'wait', ms });
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    if (this.resolver) {
      this.resolver();
      this.resolver = undefined;
    }
  }

  dispose() {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.componentInstance = undefined;
  }

  // -------------------------------------------------------
  // MACRO SYSTEM
  // -------------------------------------------------------

  startMacroRecording() {
    this.macro = [];
    this.isRecording = true;
  }

  stopMacroRecording() {
    this.isRecording = false;
    return [...this.macro];
  }

  async playMacro(events: any[]) {
    for (const ev of events) {
      if (ev.type === 'wait') {
        await this.wait(ev.ms);
      }
      if (ev.type === 'click') {
        this.clickBurst();
        await this.sleep(150);
      }
      if (ev.type === 'move') {
        this.moveTo(ev.el, ev.opts);
        await this.waitForQueueEmpty();
      }
    }
  }

  private record(ev: any) {
    if (this.isRecording) this.macro.push(ev);
  }

  // -------------------------------------------------------
  // QUEUE PROCESSOR
  // -------------------------------------------------------

  private async processQueue() {
    if (this.isAnimating) return;

    this.isAnimating = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) continue;

      if (!this.overlayRef) {
        this.createOverlayAt(task.el);
      }

      await this.waitIfPaused();

      await this.animateTo(
        task.el,
        { ...defaultCursorMotionOptions, ...task.opts }
      );
    }

    this.isAnimating = false;
  }

  private waitIfPaused(): Promise<void> {
    if (!this.isPaused) return Promise.resolve();
    return new Promise(resolve => (this.resolver = resolve));
  }

  private waitForQueueEmpty(): Promise<void> {
    return new Promise(resolve => {
      const timer = setInterval(() => {
        if (!this.isAnimating && this.queue.length === 0) {
          clearInterval(timer);
          resolve();
        }
      }, 20);
    });
  }

  // -------------------------------------------------------
  // CREATE OVERLAY
  // -------------------------------------------------------

  private createOverlayAt(el: HTMLElement) {
    const pos = this.centerOf(el);

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().left('0px').top('0px'),
      hasBackdrop: false,
      panelClass: 'cursor-overlay-panel'
    });

    const portal = new ComponentPortal(CursorOverlayComponent, null, this.injector);
    const compRef = this.overlayRef.attach(portal);
    this.componentInstance = compRef.instance;

    this.overlayRef.overlayElement.style.transform =
      `translate(${pos.x}px, ${pos.y}px)`;
  }

  // -------------------------------------------------------
  // ANIMATE TO TARGET
  // -------------------------------------------------------

  private async animateTo(
    targetEl: HTMLElement,
    opts: CursorMotionOptions
  ): Promise<void> {

    const overlay = this.overlayRef.overlayElement;
    const rect = overlay.getBoundingClientRect();

    const from = { x: rect.left, y: rect.top };
    const to = this.centerOf(targetEl);

    const segments = this.buildSegments(from, to, opts);

    for (const seg of segments) {
      if (opts.enableThoughtPauses && Math.random() < 0.3) {
        await this.sleep(50 + Math.random() * 200);
      }
      await this.animateSegment(overlay, seg);
    }

    await this.springSettle(overlay, to);
  }

  // -------------------------------------------------------
  // SEGMENT BUILDER
  // -------------------------------------------------------

  private buildSegments(
    from: Point,
    to: Point,
    opts: CursorMotionOptions
  ): PathSegment[] {

    const dist = this.distance(from, to);

    let segmentsCount = 1;
    if (dist > 500) segmentsCount = 3;
    else if (dist > 300) segmentsCount = 2;

    const nodes: Point[] = [from];

    for (let i = 1; i < segmentsCount; i++) {
      const t = i / segmentsCount;
      nodes.push({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t
      });
    }

    nodes.push(to);

    const segments: PathSegment[] = [];

    for (let i = 0; i < nodes.length - 1; i++) {
      const p0 = nodes[i];
      const p3 = nodes[i + 1];

      const p1 = this.controlPoint(p0, p3, 0.3, opts.jiggleAmount);
      const p2 = this.controlPoint(p3, p0, 0.3, opts.jiggleAmount);

      segments.push({
        p0,
        p1,
        p2,
        p3,
        length: this.distance(p0, p3)
      });
    }

    return segments;
  }

  // -------------------------------------------------------
  // SEGMENT ANIMATION
  // -------------------------------------------------------

  private animateSegment(
    overlay: HTMLElement,
    seg: PathSegment
  ): Promise<void> {

    return new Promise(resolve => {
      const duration = 200 + seg.length * 0.6 + (Math.random() * 80 - 40);
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const pos = this.cubic(seg.p0, seg.p1, seg.p2, seg.p3, t);

        overlay.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };

      requestAnimationFrame(tick);
    });
  }

  // -------------------------------------------------------
  // FINAL SPRING SETTLE
  // -------------------------------------------------------

  private springSettle(overlay: HTMLElement, dest: Point): Promise<void> {
    return new Promise(resolve => {
      const rect = overlay.getBoundingClientRect();
      const startPos = { x: rect.left, y: rect.top };

      const duration = 300;
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = this.springEase(t);

        const x = startPos.x + (dest.x - startPos.x) * eased;
        const y = startPos.y + (dest.y - startPos.y) * eased;

        overlay.style.transform = `translate(${x}px, ${y}px)`;

        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };

      requestAnimationFrame(tick);
    });
  }

  // -------------------------------------------------------
  // UTILITIES
  // -------------------------------------------------------

  private centerOf(el: HTMLElement): Point {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  private controlPoint(from: Point, to: Point, factor: number, jiggle: number): Point {
    const base = {
      x: from.x + (to.x - from.x) * factor,
      y: from.y + (to.y - from.y) * factor
    };
    return {
      x: base.x + (Math.random() - 0.5) * jiggle,
      y: base.y + (Math.random() - 0.5) * jiggle
    };
  }

  private cubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;

    return {
      x:
        u * uu * p0.x +
        3 * uu * t * p1.x +
        3 * u * tt * p2.x +
        tt * t * p3.x,
      y:
        u * uu * p0.y +
        3 * uu * t * p1.y +
        3 * u * tt * p2.y +
        tt * t * p3.y,
    };
  }

  private distance(a: Point, b: Point) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  private springEase(t: number) {
    const damping = 0.55;
    const stiffness = 5.5;
    return 1 - Math.exp(-stiffness * t) * Math.cos(damping * t * Math.PI * 2);
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}