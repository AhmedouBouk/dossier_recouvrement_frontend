import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgenceListComponent } from './agence-list/agence-list.component';
import { AgenceFormComponent } from './agence-form/agence-form.component';

@NgModule({
  declarations: [
    AgenceListComponent,
    AgenceFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    AgenceListComponent,
    AgenceFormComponent
  ]
})
export class AgenceModule { }
