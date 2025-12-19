import { Injectable } from '@angular/core';
import { Reservation } from '../models/reservation';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly STORAGE_KEY = 'hotel_reservations';
  private reservations: Reservation[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects in local timezone
        this.reservations = parsed.map((r: any) => ({
          ...r,
          checkInDate: this.parseDateFromStorage(r.checkInDate),
          checkOutDate: this.parseDateFromStorage(r.checkOutDate)
        }));
      }
    } catch (error) {
      console.error('Error loading reservations from localStorage:', error);
      this.reservations = [];
    }
  }

  private parseDateFromStorage(dateValue: string | Date): Date {
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

  private formatDateForStorage(date: Date): string {
    // Store as YYYY-MM-DD to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private saveToStorage(): void {
    try {
      // Serialize dates as date-only strings to avoid timezone issues
      const serialized = this.reservations.map(r => ({
        ...r,
        checkInDate: this.formatDateForStorage(r.checkInDate),
        checkOutDate: this.formatDateForStorage(r.checkOutDate)
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving reservations to localStorage:', error);
    }
  }

  addReservation(reservation: Reservation): void {
    this.reservations.push({ ...reservation, id: Date.now() });
    this.saveToStorage();
  }

  getReservations(): Reservation[] {
    return this.reservations;
  }

  getReservationById(id: number): Reservation | undefined {
    return this.reservations.find(r => r.id === id);
  }

  updateReservation(reservation: Reservation): void {
    const index = this.reservations.findIndex(r => r.id === reservation.id);
    if (index !== -1) {
      this.reservations[index] = reservation;
      this.saveToStorage();
    }
  }

  deleteReservation(id: number): void {
    this.reservations = this.reservations.filter(r => r.id !== id);
    this.saveToStorage();
  }
}
