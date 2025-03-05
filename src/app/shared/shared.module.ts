// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationHeaderComponent } from '../admin/navigation-header/navigation-header.component';

@NgModule({
  declarations: [
    NavigationHeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    NavigationHeaderComponent
  ]
})
export class SharedModule { }