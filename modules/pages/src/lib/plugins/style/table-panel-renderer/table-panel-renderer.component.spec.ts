import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePanelRendererComponent } from './table-panel-renderer.component';

describe('TablePanelRendererComponent', () => {
  let component: TablePanelRendererComponent;
  let fixture: ComponentFixture<TablePanelRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablePanelRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablePanelRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
