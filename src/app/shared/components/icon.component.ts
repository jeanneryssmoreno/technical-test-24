import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <span 
      class="material-symbols-outlined"
      [class.icon-filled]="fill()"
      [class.icon-outlined]="!fill()"
      [style.font-size.px]="size()"
    >{{ name() }}</span>
  `
})
export class IconComponent {
  name = input.required<string>();
  size = input(24);
  fill = input(false);
}
