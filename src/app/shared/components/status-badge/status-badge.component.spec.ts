import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [StatusBadgeComponent],
  template: `<app-status-badge [status]="status" />`,
})
class TestHostComponent {
  status: any = 'DRAFT';
}

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render APPROVED badge with correct class', () => {
    host.status = 'APPROVED';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.classList).toContain('badge-approved');
    expect(el.textContent.trim()).toBe('APPROVED');
  });

  it('should render REJECTED badge', () => {
    host.status = 'REJECTED';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.classList).toContain('badge-rejected');
  });

  it('should replace underscores with spaces in label', () => {
    host.status = 'UNDER_REVIEW';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.textContent.trim()).toBe('UNDER REVIEW');
  });
});
