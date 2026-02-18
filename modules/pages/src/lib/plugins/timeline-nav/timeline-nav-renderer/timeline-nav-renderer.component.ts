import { Component, Input, inject } from '@angular/core';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { TimelineEngineService } from '@rollthecloudinc/detour';
import { Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { TimelineNav } from '../../../models/plugin.models';
import { TimelineNavContentHandler } from '../../../handlers/timeline-nav-content.handler';

@Component({
  selector: 'classifieds-ui-timeline-nav-renderer',
  templateUrl: './timeline-nav-renderer.component.html',
  styleUrls: ['./timeline-nav-renderer.component.scss'],
  standalone: false
})
export class TimelineNavRendererComponent {

  private handler = inject(TimelineNavContentHandler);
  private timeline = inject(TimelineEngineService);

  @Input()
  set settings(v: Array<AttributeValue>) {
    this.settings$.next(v);
  }

  @Input()
  set resolvedContext(_: any) {}

  settings$ = new Subject<Array<AttributeValue>>();
  nav$ = new Subject<TimelineNav>();

  group = '__default__';
  steps: Array<{ weight: number; title?: string; description?: string }> = [];
  activeStepWeight: number | null = null;

  settingsSub = this.settings$.pipe(
    switchMap(s => this.handler.toObject(s)),
    tap(nav => this.nav$.next(nav))
  ).subscribe();

  navSub = this.nav$.pipe(
    tap(nav => {
      this.group = nav.group || '__default__';

      const groupData = (this.timeline as any).groups?.get(this.group);
      if (groupData) {
        this.steps = groupData.steps.map(s => ({
          weight: s.weight,
          title: s.title,
          description: s.description
        }));
      }

      const rt = (this.timeline as any).runtime?.get(this.group);
      if (rt) {
        rt.currentWeight$.subscribe(w => {
          this.activeStepWeight = w;
        });
      }
    })
  ).subscribe();

  goTo(weight: number) {
    console.log('goto step', weight);
    this.timeline.goTo(this.group, weight);
  }
}
