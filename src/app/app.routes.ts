import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: AppComponent },
  { path: 'detail/:id', component: ImageDetailComponent },
  { path: '**', redirectTo: '/home' },
];
