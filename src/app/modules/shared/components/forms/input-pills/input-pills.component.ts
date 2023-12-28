import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { Subscription, startWith } from 'rxjs';

import { PillOption } from '../../../models/select-option.model';

@Component({
  selector: 'alto-input-pills',
  templateUrl: './input-pills.component.html',
  styleUrls: ['input-pills.component.scss'],
})
export class InputPillsComponent implements OnInit, OnDestroy {
  @Input() placeholder = '';
  @Input() control: FormArray = new FormArray([] as FormControl[]);
  @Input() options: PillOption[] = [];

  isDropdownOpen = false;
  filteredOptions: PillOption[] = [];
  private readonly controlDisabled = this.control.disabled;

  private readonly inputPillsSubscription = new Subscription();

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.inputPillsSubscription.add(
      this.control.valueChanges.pipe(startWith(null)).subscribe(() => {
        this.setFilteredOptions();
        if (this.control.disabled !== this.controlDisabled) {
          this.controlDisabled
            ? this.control.disable({ emitEvent: false })
            : this.control.enable({ emitEvent: false });
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.inputPillsSubscription.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  private setFilteredOptions(): void {
    this.filteredOptions = this.options
      .filter(({ value }) => {
        return (this.control.value as PillOption[]).every((opt) => opt.value !== value);
      })
      .map((option) => new PillOption(option.rawData));
    if (this.filteredOptions.length === 0) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    if (this.control.enabled) {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  addPill(value: PillOption): void {
    this.control.push(new FormControl(value));
  }

  removePill(index: number): void {
    if (this.control.at(index).enabled) {
      this.control.removeAt(index);
    }
  }

  addAll(): void {
    this.filteredOptions.forEach((option) => {
      this.control.push(new FormControl(option));
    });

    this.isDropdownOpen = false;
  }

  removeAll(): void {
    const filteredControls = this.control.controls.filter((control) => control.enabled);
    filteredControls.forEach((control) => {
      this.control.removeAt(this.control.controls.indexOf(control));
    });
  }
}
