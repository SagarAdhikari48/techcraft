import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationWizardComponent } from './application-wizard.component';

describe('ApplicationWizardComponent', () => {
  let fixture: ComponentFixture<ApplicationWizardComponent>;
  let component: ApplicationWizardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationWizardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
