import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'alto-unknown-error',
  templateUrl: './unknown-error.component.html',
  styleUrls: ['./unknown-error.component.scss'],
})
export class UnknownErrorComponent implements OnInit {
  constructor(public route: ActivatedRoute) {}
  errorMessage: string = '';

  ngOnInit() {
    this.errorMessage = this.route.snapshot.paramMap.get('error') || '';
  }
}
