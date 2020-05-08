import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddcontactPage } from './addcontact.page';

describe('AddcontactPage', () => {
  let component: AddcontactPage;
  let fixture: ComponentFixture<AddcontactPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddcontactPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddcontactPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
