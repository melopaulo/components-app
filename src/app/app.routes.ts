import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/theme-demo',
    pathMatch: 'full'
  },
  {
    path: 'theme-demo',
    loadComponent: () => import('./components/theme-demo/theme-demo.component').then(m => m.ThemeDemoComponent)
  },
  {
    path: 'custom-select',
    loadComponent: () => import('./components/custom-select/custom-select-demo.component').then(m => m.CustomSelectDemoComponent)
  },
  {
    path: 'custom-mat-select',
    loadComponent: () => import('./components/custom-mat-select/custom-mat-select-demo.component').then(m => m.CustomMatSelectDemoComponent)
  },
  {
    path: 'custom-mat-select3',
    loadComponent: () => import('./components/custom-mat-select3/custom-mat-select3-demo.component').then(m => m.CustomMatSelect3DemoComponent)
  },
  {
    path: 'custom-mat-select4',
    loadComponent: () => import('./components/custom-mat-select4/custom-mat-select4-demo.component').then(m => m.CustomMatSelect4DemoComponent)
  },
  {
    path: 'custom-mat-select5',
    loadComponent: () => import('./components/custom-mat-select5/custom-mat-select5-demo.component').then(m => m.CustomMatSelect5DemoComponent)
  }
];
