import { Component, OnInit } from '@angular/core';
import { Pane, PanelStyleRendererBaseComponent, PaneDatasourceService  } from '@ng-druid/panels';
import { TokenizerService } from '@ng-druid/token';

@Component({
  selector: 'lib-table-panel-renderer',
  templateUrl: './table-panel-renderer.component.html',
  styleUrls: ['./table-panel-renderer.component.scss'],
  providers: [ PaneDatasourceService ]
})
export class TablePanelRendererComponent extends PanelStyleRendererBaseComponent implements OnInit {

  trackByMapping: (index: number, pane: Pane) => string;

  // private contentPlugins: Array<ContentPlugin>;
  private trackByTpl: string

  get displayedColumns(): Array<string> {
    const targetIndex = this.panes.findIndex(p => p.contexts.findIndex(c => c.name === '_root') > -1);
    return targetIndex > -1 ? Object.keys(this.panes[targetIndex].contexts.find(c => c.name === '_root').data) : [];
  }

  constructor(
    private tokenizerService: TokenizerService,
    public paneDatasource: PaneDatasourceService
  ) { 
    super();
    this.trackByMapping = (index: number, pane: Pane): string => {
      return this.tokenizerService.replaceTokens(this.trackByTpl, this.tokenizerService.generateGenericTokens(pane.contexts[0].data));
    };
  }

  ngOnInit(): void {
    console.log(this.panes);
    this.paneDatasource.panes = this.panes;
  }

  rowData(name: string, pane: Pane): string {
    console.log(`name: ${name}`);
    return `${pane.contexts.find(c => c.name === '_root').data[name]}`;
  }

}
