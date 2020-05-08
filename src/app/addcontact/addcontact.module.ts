import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddcontactPageRoutingModule } from './addcontact-routing.module';

import { AddcontactPage } from './addcontact.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddcontactPageRoutingModule
  ],
  declarations: [AddcontactPage]
})
export class AddcontactPageModule {}
