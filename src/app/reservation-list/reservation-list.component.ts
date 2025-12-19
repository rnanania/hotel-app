import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Reservation } from '../models/reservation';
import { ReservationService } from '../reservation/reservation.service';

@Component({
  selector: 'app-reservation-list',
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.css']
})
export class ReservationListComponent implements OnInit {
  reservations: Reservation[] = [];

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.getReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.reservations = [];
      }
    });
  }

  deleteReservation(id: string): void {
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.reservationService.deleteReservation(id).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (error) => {
          console.error('Error deleting reservation:', error);
          alert('Failed to delete reservation. Please try again.');
        }
      });
    }
  }

  editReservation(id: string): void {
    this.router.navigate(['/reservations', id, 'edit']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
