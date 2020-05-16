import { Component, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router, NavigationEnd } from '@angular/router';
import { SocketService } from './socket.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  sub1$: any;
  sub2$: any;
  current_route: string;
  routerEvent: any;
  reload_routes = ['/', '/home', '/chat'];

  constructor(private platform: Platform, private splashScreen: SplashScreen, private statusBar: StatusBar,  private router: Router, public zone: NgZone, public socket: SocketService){
    this.initializeApp();
    this.routerEvent = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.current_route = event.url.split('?')[0];
      }
    });  
  }

  ngOnDestroy(){
    this.routerEvent.unsubscribe();
    this.sub1$.unsubscribe();
    this.sub2$.unsubscribe();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();;
      this.splashScreen.hide();
      this.sub1$ = this.platform.pause.subscribe(() => {        
        this.socket.saveChats();
        this.socket.io.removeAllListeners("message");
        this.socket.count = 1;
      });  
      this.sub2$ = this.platform.resume.subscribe(() => {      
        this.zone.run(() => {
          if(this.reload_routes.indexOf(this.current_route)>-1){
            this.router.navigateByUrl('home', { replaceUrl: true });
          }
        });
      });
    });
  }
}
