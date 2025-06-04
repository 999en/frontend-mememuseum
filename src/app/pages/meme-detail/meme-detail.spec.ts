import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemeDetail } from './meme-detail';

describe('MemeDetail', () => {
  let component: MemeDetail;
  let fixture: ComponentFixture<MemeDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemeDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemeDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
