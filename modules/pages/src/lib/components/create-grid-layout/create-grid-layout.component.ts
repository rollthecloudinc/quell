import { Component, OnInit } from '@angular/core';
import { EntityServices, EntityCollectionService } from '@ngrx/data';
import { GridLayout } from '../../models/page.models';

@Component({
  selector: 'classifieds-ui-create-grid-layout',
  templateUrl: './create-grid-layout.component.html',
  styleUrls: ['./create-grid-layout.component.scss']
})
export class CreateGridLayoutComponent implements OnInit {

  private layoutService: EntityCollectionService<GridLayout>;

  constructor(es: EntityServices) {
    this.layoutService = es.getEntityCollectionService('GridLayout');
  }

  ngOnInit(): void {
  }

  onSubmit(layout: GridLayout) {
    //console.log(layout);
    this.layoutService.add(layout).subscribe(() => {
      alert('layout added');
    })
  }

}
