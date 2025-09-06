import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Otpforpassword } from './otpforpassword';

describe('Otpforpassword', () => {
  let component: Otpforpassword;
  let fixture: ComponentFixture<Otpforpassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Otpforpassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Otpforpassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
