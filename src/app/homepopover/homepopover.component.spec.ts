import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomepopoverComponent } from './homepopover.component';

describe('HomepopoverComponent', () => {
  let component: HomepopoverComponent;
  let fixture: ComponentFixture<HomepopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomepopoverComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomepopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
