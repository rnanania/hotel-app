import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reservation } from '../models/reservation';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly apiUrl = 'http://localhost:3000/reservations';

  constructor(private http: HttpClient) { }

  private parseDateFromServer(dateValue: string | Date): Date {
    // If it's already a Date object (shouldn't happen, but handle it)
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // If it's an ISO string, parse it and extract the date part
    if (typeof dateValue === 'string') {
      // Check if it's in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const [year, month, day] = dateValue.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      // If it's an ISO string, parse and convert to local date
      const date = new Date(dateValue);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    
    // Fallback
    return new Date(dateValue);
  }

  private formatDateForServer(date: Date): string {
    // Send as YYYY-MM-DD to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private transformReservation(reservation: any): Reservation {
    return {
      ...reservation,
      checkInDate: this.parseDateFromServer(reservation.checkInDate),
      checkOutDate: this.parseDateFromServer(reservation.checkOutDate)
    };
  }

  private transformReservationForServer(reservation: Reservation): any {
    return {
      ...reservation,
      checkInDate: this.formatDateForServer(reservation.checkInDate),
      checkOutDate: this.formatDateForServer(reservation.checkOutDate)
    };
  }

  private transformReservationForCreate(reservation: Reservation): any {
    // Exclude id when creating a new reservation (server will generate it)
    const { id, ...reservationWithoutId } = reservation;
    return {
      ...reservationWithoutId,
      checkInDate: this.formatDateForServer(reservation.checkInDate),
      checkOutDate: this.formatDateForServer(reservation.checkOutDate)
    };
  }

  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl).pipe(
      map(reservations => reservations.map(r => this.transformReservation(r)))
    );
  }

  getReservationById(id: string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`).pipe(
      map(reservation => this.transformReservation(reservation))
    );
  }

  addReservation(reservation: Reservation): Observable<Reservation> {
    const payload = this.transformReservationForCreate(reservation);
    return this.http.post<Reservation>(this.apiUrl, payload).pipe(
      map(reservation => this.transformReservation(reservation))
    );
  }

  updateReservation(reservation: Reservation): Observable<Reservation> {
    const payload = this.transformReservationForServer(reservation);
    return this.http.put<Reservation>(`${this.apiUrl}/${reservation.id}`, payload).pipe(
      map(reservation => this.transformReservation(reservation))
    );
  }

  deleteReservation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
