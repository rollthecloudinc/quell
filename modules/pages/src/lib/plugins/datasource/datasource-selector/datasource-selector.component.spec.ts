import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasourceSelectorComponent } from './datasource-selector.component';

describe('DatasourceSelectorComponent', () => {
  let component: DatasourceSelectorComponent;
  let fixture: ComponentFixture<DatasourceSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasourceSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasourceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
