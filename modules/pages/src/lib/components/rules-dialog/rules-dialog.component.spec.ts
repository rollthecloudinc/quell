import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesDialogComponent } from './rules-dialog.component';

describe('RulesDialogComponent', () => {
  let component: RulesDialogComponent;
  let fixture: ComponentFixture<RulesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RulesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RulesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
