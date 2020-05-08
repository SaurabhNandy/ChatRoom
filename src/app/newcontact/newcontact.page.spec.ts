import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewcontactPage } from './newcontact.page';

describe('NewcontactPage', () => {
  let component: NewcontactPage;
  let fixture: ComponentFixture<NewcontactPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewcontactPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewcontactPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
