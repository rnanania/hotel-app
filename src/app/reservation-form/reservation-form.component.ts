import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Reservation } from '../models/reservation';
import { ReservationService } from '../reservation/reservation.service';

@Component({
  selector: 'app-reservation-form',
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent implements OnInit, OnDestroy {
  reservationForm!: FormGroup;
  isEditMode = false;
  reservationId: number | null = null;
  private routeSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // Subscribe to route parameter changes to handle navigation between edit routes
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.reservationId = parseInt(id, 10);
        this.loadReservation(this.reservationId);
      } else {
        this.isEditMode = false;
        this.reservationId = null;
        this.resetForm();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.reservationForm = this.fb.group({
      guestName: ['', [Validators.required, Validators.minLength(2)]],
      guestEmail: ['', [Validators.required, Validators.email]],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      roomNumber: ['', [Validators.required, Validators.min(1)]]
    }, {
      validators: this.dateValidator.bind(this)
    });
  }

  private resetForm(): void {
    this.reservationForm.reset();
    this.reservationForm.markAsUntouched();
  }

  loadReservation(id: number): void {
    const reservation = this.reservationService.getReservationById(id);
    if (reservation) {
      // Format dates for input fields (YYYY-MM-DD)
      const checkInDate = new Date(reservation.checkInDate);
      const checkOutDate = new Date(reservation.checkOutDate);
      
      this.reservationForm.patchValue({
        guestName: reservation.guestName,
        guestEmail: reservation.guestEmail,
        checkInDate: this.formatDateForInput(checkInDate),
        checkOutDate: this.formatDateForInput(checkOutDate),
        roomNumber: reservation.roomNumber
      });
    } else {
      // Reservation not found, redirect to list
      this.router.navigate(['/reservations']);
    }
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDateFromInput(dateString: string): Date {
    // Parse YYYY-MM-DD format and create date in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  dateValidator(form: FormGroup) {
    const checkIn = form.get('checkInDate')?.value;
    const checkOut = form.get('checkOutDate')?.value;
    
    if (checkIn && checkOut) {
      const checkInDate = this.parseDateFromInput(checkIn);
      const checkOutDate = this.parseDateFromInput(checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Only validate past dates for new reservations, not when editing
      if (!this.isEditMode && checkInDate < today) {
        return { pastDate: true };
      }
      
      if (checkOutDate <= checkInDate) {
        return { invalidDateRange: true };
      }
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.reservationForm.valid) {
      const formValue = this.reservationForm.value;
      const reservation: Reservation = {
        id: this.isEditMode ? this.reservationId! : 0,
        guestName: formValue.guestName,
        guestEmail: formValue.guestEmail,
        checkInDate: this.parseDateFromInput(formValue.checkInDate),
        checkOutDate: this.parseDateFromInput(formValue.checkOutDate),
        roomNumber: parseInt(formValue.roomNumber)
      };

      if (this.isEditMode) {
        this.reservationService.updateReservation(reservation);
      } else {
        this.reservationService.addReservation(reservation);
      }
      
      this.router.navigate(['/reservations']);
    } else {
      this.markFormGroupTouched(this.reservationForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get guestName() {
    return this.reservationForm.get('guestName');
  }

  get guestEmail() {
    return this.reservationForm.get('guestEmail');
  }

  get checkInDate() {
    return this.reservationForm.get('checkInDate');
  }

  get checkOutDate() {
    return this.reservationForm.get('checkOutDate');
  }

  get roomNumber() {
    return this.reservationForm.get('roomNumber');
  }
}
