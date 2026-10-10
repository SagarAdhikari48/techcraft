import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { StepperComponent } from './stepper.component';
import { WIZARD_STEPS } from '../../../core/models/wizard.model';

@Component({
  standalone: true,
  imports: [StepperComponent],
  template: `<app-stepper [steps]="steps()" [currentIndex]="current()" />`,
})
class TestHostComponent {
  steps = signal(WIZARD_STEPS);
  current = signal(0);
}

describe('StepperComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(host).toBeTruthy());

  it('should render all 4 step labels', () => {
    const labels = fixture.nativeElement.querySelectorAll('.stepper__label');
    expect(labels.length).toBe(4);
  });

  it('should mark step 0 as active on init', () => {
    const items = fixture.nativeElement.querySelectorAll('.stepper__item:not(.stepper__connector)');
    expect(items[0].classList).toContain('is-active');
  });

  it('should mark previous steps as done when currentIndex advances', () => {
    host.current.set(2);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.stepper__item:not(.stepper__connector)');
    expect(items[0].classList).toContain('is-done');
    expect(items[1].classList).toContain('is-done');
    expect(items[2].classList).toContain('is-active');
  });

  it('should set aria-current="step" on active item only', () => {
    host.current.set(1);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('[aria-current="step"]');
    expect(items.length).toBe(1);
  });
});
