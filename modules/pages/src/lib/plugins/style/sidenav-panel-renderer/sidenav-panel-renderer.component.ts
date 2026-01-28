import { Component, Input } from '@angular/core';
import { InlineContext } from '@rollthecloudinc/context';
import { InteractionListener } from '@rollthecloudinc/detour';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { Pane, Panel } from '@rollthecloudinc/panels';
import * as cssJson from 'cssjson';
import { Sidenav } from '../../../models/plugin.models';

@Component({
  selector: 'classifieds-ui-sidenav-panel-renderer',
  templateUrl: './sidenav-panel-renderer.component.html',
  styleUrls: ['./sidenav-panel-renderer.component.scss'],
  standalone: false
})
export class SidenavPanelRendererComponent {
  @Input() panel!: Panel;
  @Input() panes: Pane[] = [];
  @Input() originPanes: Pane[] = [];
  @Input() originMappings: number[] = [];
  @Input() displayType: string = '';
  @Input() contexts: InlineContext[] = [];
  @Input() resolvedContext: {} = {};
  @Input() indexPosition = 0;
  @Input() ancestory: number[] = [];
  @Input() filteredCss: { css: cssJson.cssJson.JSONNode, classes: any } = { css: {}, classes: {} };
  @Input() filteredListeners: InteractionListener[] = [];

  sidebarWidth = 200;
  sidenavMode: 'side' | 'push' | 'over' = 'side';
  sidenavPosition: 'start' | 'end' = 'start';
  sidenavOpened = true;

  constructor(private serializer: AttributeSerializerService) {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    if (!this.panel?.settings) return;

    // Convert settings → QSidenav
    const raw = this.serializer.deserializeAsObject(this.panel.settings);
    const sidenav = new Sidenav(raw);

    // Apply to renderer
    this.sidebarWidth = sidenav.width ?? this.sidebarWidth;
    this.sidenavMode = sidenav.mode;
    this.sidenavPosition = sidenav.position;
    this.sidenavOpened = sidenav.opened;
  }
}