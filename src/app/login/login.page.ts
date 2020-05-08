import { Component } from '@angular/core';
import { SocketService } from '../socket.service';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage{

  email = '';
  password = '';
  connect_error = false;
  constructor(public socket:SocketService, private storage: Storage, public alertController: AlertController, private router: Router) { 
    this.storage.get('chatroom-user-token').then((val) => {
      if(val){
        this.router.navigateByUrl('home');
      }
    });
    this.socket.io.on('connect_error',()=> {
      if(!this.connect_error){
        this.presentAlert('Message','An error occurred while trying to establish a connection!<br>Please check your internet connection or restart app again');
        this.connect_error = true;
      }
   });
  }

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

  login(){
    if(this.email.length>0 && this.password.length>0){
      var hash = CryptoJS.SHA512(this.email+'|'+this.password).toString(CryptoJS.enc.Base64);
      this.socket.io.emit('verify-user',{"email":this.email, "password":hash}, (data)=>{
        if(data.status){
          //this.socket.token = data.value;
          this.storage.set('chatroom-user-token', data.value);
          setTimeout(()=>{
            this.email = '';
            this.password = '';
            this.router.navigateByUrl('home');
          },500);
        }
        else{
          this.presentAlert("Error",data.value);
        }
      });
    }
    else{
      this.presentAlert('Message','<strong>Please enter all fields correctly!</strong>');
    }
  }
}
