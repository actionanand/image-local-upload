import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Toast } from './components/toast/toast';
import { ConfirmationComponent } from './components/confirmation/confirmation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'Image Local Upload';
}
