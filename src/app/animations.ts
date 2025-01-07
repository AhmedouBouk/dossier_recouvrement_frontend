import { trigger, state, style, transition, animate } from '@angular/animations';

export const slideInOut = trigger('slideInOut', [
  state('in', style({
    opacity: 1,
    transform: 'translateY(0)'
  })),
  state('out', style({
    opacity: 0,
    transform: 'translateY(-20px)'
  })),
  transition('in => out', animate('200ms ease-out')),
  transition('out => in', animate('200ms ease-in'))
]);