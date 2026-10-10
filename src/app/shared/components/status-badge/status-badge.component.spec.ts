import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { StatusBadgeComponent } from './status-badge.component';
import { ApplicationStatus } from '../../../core/models/application.model';

@Component({
  standalone: true,
  imports: [StatusBadgeComponent],
  template: `<app-status-badge [status]="status()" />`,
})
class TestHostComponent {
  status = signal<ApplicationStatus>('DRAFT');
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
    expect(host).toBeTruthy();
  });

  it('should render DRAFT badge with correct class', () => {
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.classList).toContain('badge-draft');
    expect(el.textContent.trim()).toBe('DRAFT');
  });

  it('should render APPROVED badge with correct class', () => {
    host.status.set('APPROVED');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.classList).toContain('badge-approved');
    expect(el.textContent.trim()).toBe('APPROVED');
  });

  it('should render REJECTED badge with correct class', () => {
    host.status.set('REJECTED');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.classList).toContain('badge-rejected');
  });

  it('should render SUBMITTED badge', () => {
    host.status.set('SUBMITTED');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.classList).toContain('badge-submitted');
  });

  it('should render ON_HOLD badge', () => {
    host.status.set('ON_HOLD');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.classList).toContain('badge-hold');
  });

  it('should replace underscores with spaces in label', () => {
    host.status.set('UNDER_REVIEW');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.textContent.trim()).toBe('UNDER REVIEW');
  });
});
