import { Component } from '@angular/core';
import { SocketService } from '../socket.service';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-homepopover',
  templateUrl: './homepopover.component.html',
  styleUrls: ['./homepopover.component.scss'],
})
export class HomepopoverComponent {

  constructor(public socket: SocketService, private router: Router, private storage: Storage, private popoverController: PopoverController) { }

  logout(){
    this.socket.io.emit('logout',{},(data)=>{
      if(data.status){
        this.socket.resetVariables();
        this.popoverController.dismiss();
        this.storage.remove('chatroom-user-token').then((val) => {
          this.router.navigateByUrl('login');  
        });
      }
      else{
        console.log('unable to logout');
        this.popoverController.dismiss();
      }
    });
    
  }

}
