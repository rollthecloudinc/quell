import { Component, OnInit, Input, TemplateRef, ComponentRef, ViewChild, inject, Injector } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { LayoutEditorBaseComponent, GridItem } from '@rollthecloudinc/panels';
import { SplitLayoutComponent } from '../split-layout/split-layout.component';
import { LayoutEditorRole } from '../../models/layout.models';
import { MatSidenav } from '@angular/material/sidenav';
import { RegisterRole } from '@rollthecloudinc/utils';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

@Component({
    selector: 'classifieds-ui-split-layout-editor',
    templateUrl: './split-layout-editor.component.html',
    styleUrls: ['./split-layout-editor.component.scss'],
    standalone: false
})
@RegisterRole('layout_editor')
export class SplitLayoutEditorComponent extends LayoutEditorBaseComponent implements OnInit, LayoutEditorRole {

  public injector = inject<Injector>(Injector);
  
  @ViewChild('splitLayout') splitLayout: SplitLayoutComponent;
  @ViewChild('drawer') drawerRef: MatSidenav;
  @ViewChild('panelsMenuTrigger') panelsMenuTriggerRef: MatMenuTrigger

  get gridItems(): Array<GridItem> {
    return this.dashboard.map((gi, i) => ({ ...gi, cols: Math.floor(gi.cols), weight: i }));
  }

  constructor(public controlContainer: ControlContainer) { 
    super(controlContainer);
  }

  ngOnInit(): void {
  }

  toggle() {
    this.drawerRef.toggle();
  }

  open() {
    this.drawerRef.open();
  }

  close() {
    this.drawerRef.close();
  }

  toggleMenu() {
    this.panelsMenuTriggerRef.toggleMenu()
  }

  openMenu() {
    this.panelsMenuTriggerRef.openMenu()
  }

  closeMenu() {
    this.panelsMenuTriggerRef.closeMenu()
  }

}