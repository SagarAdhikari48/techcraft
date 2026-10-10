import { Component, input } from '@angular/core';
import { ApplicationStatus } from '../../../core/models/application.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  status = input.required<ApplicationStatus>();

  get label(): string {
    return this.status().replace(/_/g, ' ');
  }

  get badgeClass(): string {
    const map: Record<ApplicationStatus, string> = {
      DRAFT: 'badge-draft',
      SUBMITTED: 'badge-submitted',
      UNDER_REVIEW: 'badge-review',
      APPROVED: 'badge-approved',
      REJECTED: 'badge-rejected',
      ON_HOLD: 'badge-hold',
    };
    return map[this.status()];
  }
}
