import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatasourceSelectorComponent } from './datasource-selector.component';

describe('DatasourceSelectorComponent', () => {
  let component: DatasourceSelectorComponent;
  let fixture: ComponentFixture<DatasourceSelectorComponent>;

  beforeEach(waitForAsync(() => {
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
