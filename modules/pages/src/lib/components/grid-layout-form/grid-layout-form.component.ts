import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { GridLayout } from '../../models/page.models';
import { GridLayoutComponent } from '../grid-layout/grid-layout.component';
import { DisplayGrid, GridsterConfig, GridType } from 'angular-gridster2';

@Component({
  selector: 'classifieds-ui-grid-layout-form',
  templateUrl: './grid-layout-form.component.html',
  styleUrls: ['./grid-layout-form.component.scss']
})
export class GridLayoutFormComponent implements OnInit {

  @Output()
  submitted = new EventEmitter<GridLayout>();

  layoutForm = this.fb.group({});

  options: GridsterConfig = {
    gridType: GridType.Fit,
    displayGrid: DisplayGrid.Always,
    pushItems: true,
    draggable: {
      enabled: true
    },
    resizable: {
      enabled: true
    }
  };

  @ViewChild(GridLayoutComponent,{static: true}) gridLayout: GridLayoutComponent;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  submit() {
    this.submitted.emit(new GridLayout({
      id: undefined,
      site: 'main',
      gridItems: this.gridLayout.grid.map((gi, i) => ({ ...gi, weight: i })),
    }));
  }

}
