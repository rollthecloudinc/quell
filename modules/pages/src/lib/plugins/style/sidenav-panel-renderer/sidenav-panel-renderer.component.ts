import { Component, inject, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { InlineContext } from '@rollthecloudinc/context';
import { InteractionListener } from '@rollthecloudinc/detour';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { Pane, Panel, SidenavRole } from '@rollthecloudinc/panels';
import { Sidenav } from '../../../models/plugin.models';
import * as cssJson from 'cssjson';
import { RoleMixin } from '@rollthecloudinc/utils';
import { RegisterRole } from '@rollthecloudinc/utils';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'classifieds-ui-sidenav-panel-renderer',
  templateUrl: './sidenav-panel-renderer.component.html',
  styleUrls: ['./sidenav-panel-renderer.component.scss'],
  standalone: false
})
@RegisterRole('sidenav')
export class SidenavPanelRendererComponent implements SidenavRole {

  public serializer = inject<AttributeSerializerService>(AttributeSerializerService);
  public injector = inject<Injector>(Injector);

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

  @ViewChild(MatSidenav) matSidenav!: MatSidenav;

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

  toggle() {
    console.log('toggling sidenav from', this.sidenavOpened);
    this.sidenavOpened = !this.sidenavOpened;
  }

  open() {
    this.sidenavOpened = true;
  }

  close() {
    this.sidenavOpened = false;
  }
}