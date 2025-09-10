import { ComponentFixture, TestBed } from '@angular/core/testing';

import { otpforpasswordreset } from './otpforpassword';

describe('Otpforpassword', () => {
  let component: otpforpasswordreset;
  let fixture: ComponentFixture<otpforpasswordreset>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [otpforpasswordreset],
    }).compileComponents();

    fixture = TestBed.createComponent(otpforpasswordreset);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
