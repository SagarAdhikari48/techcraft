import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HasPermissionDirective } from './has-permission.directive';
import { PermissionService } from '../../core/permissions/permission.service';
import { vi } from 'vitest';

function buildPermStub(allow: boolean) {
  return { can: vi.fn().mockReturnValue(allow) };
}

@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: `
    <div *appHasPermission="'application:create'" id="shown">Visible</div>
    <ng-template #denied><div id="fallback">Denied</div></ng-template>
    <div *appHasPermission="'admin:access'; else denied" id="admin">Admin</div>
  `,
})
class TestHostComponent {}

describe('HasPermissionDirective', () => {
  function setup(allow: boolean): ComponentFixture<TestHostComponent> {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: PermissionService, useValue: buildPermStub(allow) }],
    }).compileComponents();
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => TestBed.resetTestingModule());

  it('should render content when permission is granted', () => {
    const fixture = setup(true);
    expect(fixture.nativeElement.querySelector('#shown')).toBeTruthy();
  });

  it('should not render content when permission is denied', () => {
    const fixture = setup(false);
    expect(fixture.nativeElement.querySelector('#shown')).toBeNull();
  });

  it('should render else template when permission is denied', () => {
    const fixture = setup(false);
    expect(fixture.nativeElement.querySelector('#fallback')).toBeTruthy();
  });

  it('should not render else template when permission is granted', () => {
    const fixture = setup(true);
    expect(fixture.nativeElement.querySelector('#fallback')).toBeNull();
  });
});
