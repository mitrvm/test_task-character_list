import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-item.component.html',
  styleUrl: './info-item.component.scss',
})
export class InfoItemComponent {
  @Input() label!: string;
  @Input() value?: string;
  @Input() isSpoiler: boolean = false;
  @Input() isRevealed: boolean = false;
  @Input() spoilerClass: string = '';

  @Output() spoilerToggle = new EventEmitter<void>();

  toggleSpoiler(): void {
    if (this.isSpoiler) {
      this.spoilerToggle.emit();
    }
  }
  capitalizeFirstLetter(str: string | undefined | null): string {
    if (!str) return 'Unknown';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
