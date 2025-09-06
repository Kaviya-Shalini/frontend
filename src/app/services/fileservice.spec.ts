import { TestBed } from '@angular/core/testing';

import { Fileservice } from './fileservice';

describe('Fileservice', () => {
  let service: Fileservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fileservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
