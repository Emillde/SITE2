/* =================================================================
   MINDSPACE - Booking System JavaScript
   Modulo step-by-step per prenotare consulenze
   Validazione avanzata e UX ottimizzata
   ================================================================= */

'use strict';

const BookingSystem = {
  init: function() {
    this.modal = document.getElementById('booking-modal');
    this.form = document.getElementById('booking-form');
    this.currentStep = 1;
    this.totalSteps = 3;
    this.bookingData = {};
    
    this.elements = {
      steps: this.form.querySelectorAll('.form-step'),
      nextButtons: this.form.querySelectorAll('.next-step'),
      prevButtons: this.form.querySelectorAll('.prev-step'),
      submitButton: this.form.querySelector('button[type="submit"]'),
      serviceOptions: this.form.querySelectorAll('input[name="service"]'),
      progressIndicator: null
    };
    
    this.bindEvents();
    this.createProgressIndicator();
    this.updateStepDisplay();
  },

  bindEvents: function() {
    // Modal controls
    const modalTriggers = document.querySelectorAll('[data-open-booking]');
    const modalClose = this.modal.querySelector('.modal-close');
    
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    });
    
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }
    
    // Close modal on outside click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
    
    // Form navigation
    this.elements.nextButtons.forEach(button => {
      button.addEventListener('click', () => this.nextStep());
    });
    
    this.elements.prevButtons.forEach(button => {
      button.addEventListener('click', () => this.prevStep());
    });
    
    // Form submission
    if (this.elements.submitButton) {
      this.elements.submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.submitBooking();
      });
    }
    
    // Service selection change
    this.elements.serviceOptions.forEach(option => {
      option.addEventListener('change', () => {
        this.updateServiceSelection();
        this.validateCurrentStep();
      });
    });
    
    // Real-time validation
    this.form.addEventListener('input', (e) => {
      this.validateField(e.target);
      this.validateCurrentStep();
    });
    
    // Form field focus/blur effects
    this.form.addEventListener('focus', (e) => {
      if (e.target.matches('input, select, textarea')) {
        e.target.parentElement.classList.add('focused');
      }
    }, true);
    
    this.form.addEventListener('blur', (e) => {
      if (e.target.matches('input, select, textarea')) {
        e.target.parentElement.classList.remove('focused');
        this.validateField(e.target);
      }
    }, true);
  },

  createProgressIndicator: function() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'booking-progress';
    progressContainer.setAttribute('role', 'progressbar');
    progressContainer.setAttribute('aria-valuenow', '1');
    progressContainer.setAttribute('aria-valuemin', '1');
    progressContainer.setAttribute('aria-valuemax', this.totalSteps);
    
    progressContainer.innerHTML = `
      <div class="progress-steps">
        ${Array.from({length: this.totalSteps}, (_, i) => `
          <div class="progress-step ${i === 0 ? 'active' : ''}" data-step="${i + 1}">
            <span class="step-number">${i + 1}</span>
            <span class="step-label">${this.getStepLabel(i + 1)}</span>
          </div>
        `).join('')}
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(1 / this.totalSteps) * 100}%"></div>
      </div>
    `;
    
    this.form.querySelector('.modal-body').insertBefore(
      progressContainer, 
      this.form.querySelector('.form-step')
    );
    
    this.elements.progressIndicator = progressContainer;
  },

  getStepLabel: function(stepNumber) {
    const labels = {
      1: 'Servizio',
      2: 'Dati',
      3: 'Data'
    };
    return labels[stepNumber] || `Step ${stepNumber}`;
  },

  openModal: function() {
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
      const firstInput = this.form.querySelector('input:not([type="hidden"])');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
    
    // Reset form if needed
    if (this.currentStep !== 1) {
      this.resetForm();
    }
  },

  closeModal: function() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Return focus to trigger
    const trigger = document.querySelector('[data-open-booking]:focus');
    if (trigger) {
      setTimeout(() => trigger.focus(), 100);
    }
  },

  nextStep: function() {
    if (this.validateCurrentStep()) {
      this.saveCurrentStepData();
      
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.updateStepDisplay();
      }
    }
  },

  prevStep: function() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepDisplay();
    }
  },

  updateStepDisplay: function() {
    // Update step visibility
    this.elements.steps.forEach((step, index) => {
      if (index + 1 === this.currentStep) {
        step.classList.add('active');
        step.setAttribute('aria-hidden', 'false');
      } else {
        step.classList.remove('active');
        step.setAttribute('aria-hidden', 'true');
      }
    });
    
    // Update progress indicator
    this.updateProgressIndicator();
    
    // Update navigation buttons
    this.updateNavigationButtons();
    
    // Focus first input of current step
    setTimeout(() => {
      const currentStepElement = this.form.querySelector(`.form-step[data-step="${this.currentStep}"]`);
      const firstInput = currentStepElement.querySelector('input, select, textarea');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  },

  updateProgressIndicator: function() {
    if (!this.elements.progressIndicator) return;
    
    // Update step indicators
    const stepElements = this.elements.progressIndicator.querySelectorAll('.progress-step');
    stepElements.forEach((step, index) => {
      const stepNumber = index + 1;
      step.classList.toggle('active', stepNumber === this.currentStep);
      step.classList.toggle('completed', stepNumber < this.currentStep);
    });
    
    // Update progress bar
    const progressFill = this.elements.progressIndicator.querySelector('.progress-fill');
    const progress = (this.currentStep / this.totalSteps) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Update ARIA attributes
    this.elements.progressIndicator.setAttribute('aria-valuenow', this.currentStep);
  },

  updateNavigationButtons: function() {
    const prevButton = this.form.querySelector('.prev-step');
    const nextButton = this.form.querySelector('.next-step');
    const submitButton = this.form.querySelector('button[type="submit"]');
    
    // Show/hide previous button
    if (prevButton) {
      prevButton.style.display = this.currentStep === 1 ? 'none' : 'block';
    }
    
    // Show/hide next vs submit button
    if (nextButton && submitButton) {
      if (this.currentStep === this.totalSteps) {
        nextButton.style.display = 'none';
        submitButton.style.display = 'block';
        submitButton.classList.add('active');
      } else {
        nextButton.style.display = 'block';
        submitButton.style.display = 'none';
        submitButton.classList.remove('active');
      }
    }
  },

  validateCurrentStep: function() {
    const currentStepElement = this.form.querySelector(`.form-step[data-step="${this.currentStep}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    
    // Update next button state
    const nextButton = currentStepElement.querySelector('.next-step');
    if (nextButton) {
      nextButton.disabled = !isValid;
    }
    
    return isValid;
  },

  validateField: function(field) {
    let isValid = true;
    const value = field.value.trim();
    
    // Clear previous errors
    this.clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
      this.showFieldError(field, 'Questo campo è obbligatorio');
      isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.showFieldError(field, 'Inserisci un\'email valida');
        isValid = false;
      }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      const cleanPhone = value.replace(/\D/g, '');
      
      if (!phoneRegex.test(value) || cleanPhone.length < 10) {
        this.showFieldError(field, 'Inserisci un numero di telefono valido');
        isValid = false;
      }
    }
    
    // Date validation (must be in the future)
    if (field.type === 'date' && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        this.showFieldError(field, 'Seleziona una data futura');
        isValid = false;
      }
    }
    
    // Update field visual state
    field.classList.toggle('valid', isValid && value);
    field.classList.toggle('invalid', !isValid);
    
    return isValid;
  },

  showFieldError: function(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    this.clearFieldError(field);
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    
    field.parentElement.appendChild(errorDiv);
  },

  clearFieldError: function(field) {
    field.classList.remove('error');
    const errorDiv = field.parentElement.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  },

  saveCurrentStepData: function() {
    const currentStepElement = this.form.querySelector(`.form-step[data-step="${this.currentStep}"]`);
    const formData = new FormData(currentStepElement);
    
    for (let [key, value] of formData.entries()) {
      this.bookingData[key] = value;
    }
  },

  updateServiceSelection: function() {
    const selectedService = this.form.querySelector('input[name="service"]:checked');
    if (selectedService) {
      // Update UI to show selected service
      const serviceOptions = this.form.querySelectorAll('.service-option');
      serviceOptions.forEach(option => {
        const input = option.querySelector('input');
        option.classList.toggle('selected', input.checked);
      });
    }
  },

  submitBooking: function() {
    if (this.validateCurrentStep()) {
      this.saveCurrentStepData();
      
      // Show loading state
      this.showLoadingState();
      
      // Simulate API call
      setTimeout(() => {
        this.handleBookingSuccess();
      }, 2000);
    }
  },

  showLoadingState: function() {
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <span class="loading-spinner"></span>
      Prenotazione in corso...
    `;
    submitButton.classList.add('loading');
    
    // Store original text for restoration
    submitButton.dataset.originalText = originalText;
  },

  hideLoadingState: function() {
    const submitButton = this.form.querySelector('button[type="submit"]');
    
    submitButton.disabled = false;
    submitButton.textContent = submitButton.dataset.originalText || 'Prenota';
    submitButton.classList.remove('loading');
  },

  handleBookingSuccess: function() {
    this.hideLoadingState();
    
    // Show success message
    this.showSuccessMessage();
    
    // Track booking (analytics)
    this.trackBooking();
    
    // Close modal after delay
    setTimeout(() => {
      this.closeModal();
      this.resetForm();
    }, 3000);
  },

  showSuccessMessage: function() {
    const successMessage = document.createElement('div');
    successMessage.className = 'booking-success';
    successMessage.innerHTML = `
      <div class="success-icon">✓</div>
      <h3>Prenotazione confermata!</h3>
      <p>Ti contatteremo a breve per confermare i dettagli della tua consulenza.</p>
      <div class="booking-summary">
        <h4>Riepilogo prenotazione:</h4>
        <p><strong>Servizio:</strong> ${this.getServiceLabel(this.bookingData.service)}</p>
        <p><strong>Data:</strong> ${this.formatDate(this.bookingData.date)}</p>
        <p><strong>Orario:</strong> ${this.bookingData.time}</p>
      </div>
    `;
    
    // Replace form content with success message
    const modalBody = this.modal.querySelector('.modal-body');
    modalBody.innerHTML = '';
    modalBody.appendChild(successMessage);
  },

  getServiceLabel: function(serviceValue) {
    const labels = {
      'terapia': 'Area Terapia',
      'evolutiva': 'Area Evolutiva'
    };
    return labels[serviceValue] || serviceValue;
  },

  formatDate: function(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  trackBooking: function() {
    // Analytics tracking (placeholder)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'booking_completed', {
        'service': this.bookingData.service,
        'date': this.bookingData.date
      });
    }
    
    console.log('Booking tracked:', this.bookingData);
  },

  resetForm: function() {
    this.currentStep = 1;
    this.bookingData = {};
    this.form.reset();
    this.updateStepDisplay();
    
    // Clear all field errors
    this.form.querySelectorAll('.field-error').forEach(error => error.remove());
    this.form.querySelectorAll('.error, .valid, .invalid').forEach(field => {
      field.classList.remove('error', 'valid', 'invalid');
    });
    
    // Reset service selections
    this.form.querySelectorAll('.service-option.selected').forEach(option => {
      option.classList.remove('selected');
    });
    
    // Restore original form content if showing success message
    const successMessage = this.modal.querySelector('.booking-success');
    if (successMessage) {
      location.reload(); // Simple way to restore original content
    }
  },

  // Public methods
  openWithService: function(serviceType) {
    this.openModal();
    
    // Pre-select service
    setTimeout(() => {
      const serviceRadio = this.form.querySelector(`input[name="service"][value="${serviceType}"]`);
      if (serviceRadio) {
        serviceRadio.checked = true;
        serviceRadio.dispatchEvent(new Event('change'));
      }
    }, 100);
  }
};

// Initialize booking system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  BookingSystem.init();
  
  // Make it globally available
  window.BookingSystem = BookingSystem;
  
  console.log('📅 Booking System Ready');
});

// Export for testing or external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookingSystem;
}
