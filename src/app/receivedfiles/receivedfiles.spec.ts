import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedFilesComponent } from './receivedfiles';

describe('Receivedfiles', () => {
  let component: ReceivedFilesComponent;
  let fixture: ComponentFixture<ReceivedFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedFilesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceivedFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
