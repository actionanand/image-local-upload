import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./app').then(m => m.App) },
  {
    path: 'detail/:id',
    loadComponent: () => import('./components/image-detail/image-detail').then(m => m.ImageDetail),
  },
  { path: '**', redirectTo: '/home' },
];
