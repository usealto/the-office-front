import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'alto-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent implements OnInit {
  i = true;

  ngOnInit(): void {
    // Removes Splashscreen
    setTimeout(
      () => {
        document.getElementsByClassName('first-loader').item(0)?.remove();
      },
      environment.production ? 500 : 500,
    );
  }
}
