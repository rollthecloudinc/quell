import { Input, TemplateRef, Component, Optional } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { LayoutSetting, PanelPage } from '../../models/panels.models';

@Component({
    selector: 'classifieds-ui-layout-renderer-base',
    template: '',
    standalone: false
})
export class LayoutRendererBaseComponent {

  @Input()
  panelPage: PanelPage;

  @Input()
  displayMainControls = false;

  @Input()
  displayItemHeader = false;

  @Input()
  renderPanelTpl: TemplateRef<any>;

  get columnSettings(): Array<LayoutSetting> {
    const settings = this.panelPage ? this.panelPage.panels.reduce<Array<LayoutSetting>>((p, c) => [ ...p, new LayoutSetting(c.columnSetting) ], []) : [];
    return settings;
  }

  constructor(@Optional() public controlContainer: ControlContainer) { }

}