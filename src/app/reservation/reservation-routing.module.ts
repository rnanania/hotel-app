import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationFormComponent } from '../reservation-form/reservation-form.component';
import { ReservationListComponent } from '../reservation-list/reservation-list.component';

const routes: Routes = [
  {
    path: '',
    component: ReservationListComponent
  },
  {
    path: 'new',
    component: ReservationFormComponent
  },
  {
    path: ':id/edit',
    component: ReservationFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationRoutingModule { }

