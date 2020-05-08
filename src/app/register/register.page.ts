import { Component } from '@angular/core';
import { SocketService } from '../socket.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage{

  otp_disabled = true;
  other_disabled = false;
  username = '';
  email = '';
  password = '';
  otp: number; 
  submit_btn = 'Send OTP';
  connect_error = false;
  constructor(public socket:SocketService, public alertController: AlertController, private router: Router) { 
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

  submit(){
    if(this.submit_btn=='Send OTP'){
      if(this.email.length>0 && this.password.length>0){
        var hash = CryptoJS.SHA512(this.email+'|'+this.password).toString(CryptoJS.enc.Base64);
        this.socket.io.emit('otp', {"username":this.username, "email":this.email, "password":hash},(data)=>{
          if(data.status){
            this.presentAlert('Message', data.value);
            this.submit_btn = 'Register';
            this.otp_disabled = false;
            this.other_disabled = true;
          }
          else{
            this.presentAlert('Message', data.value);
          }
        });
      }
      else{
        this.presentAlert('Message','<strong>Please enter all fields correctly</strong>');
      } 
    }
    else{
      if(this.otp.toString().length==6){
        this.socket.io.emit('register-user',{"email":this.email, "otp":this.otp}, (data)=>{
          if(data.status){
            this.router.navigateByUrl('login');
          }
          else{
            this.presentAlert('Error',data.value);
          }
        });
      }
      else{
        this.presentAlert('Message','<strong>Please enter all fields correctly </strong>');
      }
    }
  }
}
