import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotUsernameComponent } from './find-username';

describe('FindUsername', () => {
  let component: ForgotUsernameComponent;
  let fixture: ComponentFixture<ForgotUsernameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotUsernameComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
