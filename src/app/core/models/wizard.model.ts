export type WizardStepId = 'business' | 'contact' | 'banking' | 'review';

export interface WizardStep {
  id: WizardStepId;
  label: string;
  index: number;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 'business', label: 'Business Info',  index: 0 },
  { id: 'contact',  label: 'Contact Info',   index: 1 },
  { id: 'banking',  label: 'Banking Details', index: 2 },
  { id: 'review',   label: 'Review & Submit', index: 3 },
];
