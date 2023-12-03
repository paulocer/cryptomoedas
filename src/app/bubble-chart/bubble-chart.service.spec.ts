import { TestBed } from '@angular/core/testing';

import { BubbleChartService } from './bubble-chart.service';

describe('BubbleChartService', () => {
  let service: BubbleChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BubbleChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
