/**
 * ============================================
 * CONFIRM DIALOG COMPONENT
 * ============================================
 * 
 * Reusable modal dialog for confirmation actions:
 * - Generic confirm/cancel flow
 * - Customizable title and message
 * - Danger/warning color scheme
 * - Fullscreen overlay with backdrop
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {
  // ============================================
  // Inputs
  // ============================================
  
  /** Dialog title */
  @Input() title: string = 'Conferma azione';
  
  /** Dialog message/description */
  @Input() message: string = 'Sei sicuro di voler procedere?';
  
  /** Confirm button text */
  @Input() confirmText: string = 'Conferma';
  
  /** Cancel button text */
  @Input() cancelText: string = 'Annulla';
  
  /** Show danger styling (red) */
  @Input() danger: boolean = false;

  // ============================================
  // Outputs
  // ============================================
  
  /** Emitted when user confirms */
  @Output() confirm = new EventEmitter<void>();
  
  /** Emitted when user cancels */
  @Output() cancel = new EventEmitter<void>();

  // ============================================
  // Methods
  // ============================================
  
  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
