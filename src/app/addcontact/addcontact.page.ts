import { Component } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { SocketService } from '../socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-addcontact',
  templateUrl: './addcontact.page.html',
  styleUrls: ['./addcontact.page.scss'],
})

export class AddcontactPage {
  contact_nickname = '';
  contact_email = '';
  new_contact_list = [];
  constructor(public socket: SocketService, public alertController: AlertController, public toastController: ToastController, public modalController: ModalController, private router: Router) { }

  async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [{
        text: 'OK',
        role: 'ok',
        cssClass: 'secondary'}]
    });
    await alert.present();
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  addToContacts(){
    if(this.contact_email.length>0 && this.contact_nickname.length>0){
      var contact = this.socket.contacts.find(item => item.email===this.contact_email);
      if(contact){
        this.new_contact_list = [contact];
        this.presentAlert('Message','<strong>User is already in your contact list !</strong>');
      }
      else{
        this.socket.io.emit('add-contact', {"contact_email":this.contact_email, "name":this.contact_nickname}, (data)=>{
          if(data.status){
            this.socket.contacts.push(data.value);
            this.new_contact_list.push(data.value);
            this.presentToast('User added to contact');
          }
          else{
            this.presentAlert('Message',data.value);
          }
        });
      }
    }
    else{
      this.presentAlert('Message','<strong>Please enter all fields correctly!</strong>');
    }
  }
  
  gotoChat(email, name, avatar){
    this.dismissModal();
    this.router.navigate(['/chat'], { queryParams: {email: email, name: name, avatar: avatar}});
  }

  dismissModal(){
    this.modalController.dismiss({
      'dismissed': true
    });
  }
  
}
