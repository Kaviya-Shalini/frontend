import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Receivedfiles } from './receivedfiles';

describe('Receivedfiles', () => {
  let component: Receivedfiles;
  let fixture: ComponentFixture<Receivedfiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Receivedfiles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Receivedfiles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
