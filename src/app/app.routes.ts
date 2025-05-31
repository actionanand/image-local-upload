import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./components/home/home').then(m => m.Home) },
  {
    path: 'detail/:id',
    loadComponent: () => import('./components/image-detail/image-detail').then(m => m.ImageDetail),
  },
  { path: '**', redirectTo: '/home' },
];
