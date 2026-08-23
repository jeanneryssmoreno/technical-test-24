import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div
      class="animate-pulse bg-surface-container-high rounded-lg"
      [style.width]="width()"
      [style.height]="height()"
    ></div>
  `
})
export class SkeletonComponent {
  width = input('100%');
  height = input('1rem');
}
