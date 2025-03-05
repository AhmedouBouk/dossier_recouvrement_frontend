import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Agence } from '../../../shared/services/agence.service';

@Component({
  selector: 'app-agence-form',
  templateUrl: './agence-form.component.html',
  styleUrls: ['./agence-form.component.css']
})
export class AgenceFormComponent implements OnInit, OnChanges {
  @Input() agence: Agence | null = null;
  @Output() formSubmit = new EventEmitter<Omit<Agence, 'id'>>();
  @Output() formCancel = new EventEmitter<void>();

  agenceForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.agenceForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['agence'] && this.agenceForm) {
      this.initializeForm();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      nom: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  private initializeForm(): void {
    if (this.agence) {
      this.agenceForm.patchValue({
        code: this.agence.code,
        nom: this.agence.nom
      });
    } else {
      this.agenceForm.reset();
    }
    this.submitted = false;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.agenceForm.invalid) {
      return;
    }

    const formData = this.agenceForm.value;
    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  // Getters for form controls to simplify validation in the template
  get f() { return this.agenceForm.controls; }
}
