import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexLayoutComponent } from './flex-layout.component';

describe('FlexLayoutComponent', () => {
  let component: FlexLayoutComponent;
  let fixture: ComponentFixture<FlexLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlexLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlexLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
