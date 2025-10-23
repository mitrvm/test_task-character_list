import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  template: `
    <img
      [src]="'/icons/' + name + '.svg'"
      [alt]="alt || name"
      [width]="size"
      [height]="size"
      [class]="className"
      [style.display]="'block'"
    />
  `,
  standalone: true,
})
export class IconComponent {
  @Input() name!: string;
  @Input() size: number = 24;
  @Input() className: string = '';
  @Input() alt: string = '';
}
