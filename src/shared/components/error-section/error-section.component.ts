import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-section',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './error-section.component.scss',
  template: `
    <div class="error-section">
      <div class="card">
        <div>An error has occurred.</div>
        <p>{{ message }}</p>
        <button class="btn btn-primary" (click)="retry.emit()">Try Again</button>
      </div>
    </div>
  `,
})
export class ErrorSectionComponent {
  @Input() message: string = '';
  @Output() retry = new EventEmitter<void>();
}
