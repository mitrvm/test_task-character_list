import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-section',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './loading-section.component.scss',
  template: `
    <div class="loading-section">
      <div class="card">
        <div class="spinner-border"></div>
      </div>
    </div>
  `,
})
export class LoadingSectionComponent {}
