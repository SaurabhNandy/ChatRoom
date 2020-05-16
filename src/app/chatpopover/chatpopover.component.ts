import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { AddcontactPage } from '../addcontact/addcontact.page';

@Component({
  selector: 'app-chatpopover',
  templateUrl: './chatpopover.component.html',
  styleUrls: ['./chatpopover.component.scss'],
})

export class ChatpopoverComponent {
  email = '';
  constructor(private route: ActivatedRoute, public modalController: ModalController, private popoverController: PopoverController) { 
    this.email = route.snapshot.queryParamMap.get('email');
  }

  async addToContact(){
    this.popoverController.dismiss();
    const modal = await this.modalController.create({
      component: AddcontactPage,
      componentProps:{'email': this.email},
      animated: true
    });
    return await modal.present();
  }

}
