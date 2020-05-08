import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewcontactPage } from './newcontact.page';

const routes: Routes = [
  {
    path: '',
    component: NewcontactPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewcontactPageRoutingModule {}
