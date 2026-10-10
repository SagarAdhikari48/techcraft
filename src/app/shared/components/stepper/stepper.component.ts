import { Component, input } from '@angular/core';
import { WizardStep } from '../../../core/models/wizard.model';

@Component({
  selector: 'app-stepper',
  standalone: true,
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
})
export class StepperComponent {
  steps = input.required<WizardStep[]>();
  currentIndex = input.required<number>();
}
