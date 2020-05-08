import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewcontactPageRoutingModule } from './newcontact-routing.module';

import { NewcontactPage } from './newcontact.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewcontactPageRoutingModule
  ],
  declarations: [NewcontactPage]
})
export class NewcontactPageModule {}
