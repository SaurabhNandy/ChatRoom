import { Component } from '@angular/core';
import { SocketService } from '../socket.service';
import { Router } from '@angular/router';
import { PopoverController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-homepopover',
  templateUrl: './homepopover.component.html',
  styleUrls: ['./homepopover.component.scss'],
})
export class HomepopoverComponent {

  constructor(public socket: SocketService, private router: Router, private storage: Storage, private popoverController: PopoverController, public toastController: ToastController) { }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  logout(){
    this.socket.saveChats();
    this.socket.io.emit('logout',{email:this.socket.email},(data)=>{
      if(data.status){
        this.socket.resetVariables();
        this.popoverController.dismiss();
        this.storage.remove('chatroom-user-token').then((val) => {
          this.router.navigateByUrl('login', { replaceUrl: true });  
        });
      }
      else{
        this.popoverController.dismiss();
        this.presentToast('Unable to logout. Please try again');
      }
    }); 
  }

}
