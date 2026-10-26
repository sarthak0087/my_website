/**
 * Le Rêve Salon and Spa - Interactive Scripting
 * Handles:
 * - Sticky navigation header scroll state
 * - Mobile hamburger menu drawer transitions
 * - Dynamic form validations and custom visual error rendering
 * - Multi-stage appointment time-date future check
 * - Interactive reservation success modal
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // 1. STICKY HEADER SCROLL TRANSITION
  // ==========================================================================
  const header = document.getElementById('site-header');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  // Run once initially to check scroll state on reload
  handleScroll();

  // ==========================================================================
  // 2. RESPONSIVE MOBILE DRAWER MENU
  // ==========================================================================
  const burgerMenu = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const drawerLinks = document.querySelectorAll('.mobile-drawer-link');

  const toggleMobileMenu = () => {
    burgerMenu.classList.toggle('active');
    mobileDrawer.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    // Toggle body scroll locking when mobile menu is active
    document.body.style.overflow = mobileDrawer.classList.contains('active') ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    burgerMenu.classList.remove('active');
    mobileDrawer.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  burgerMenu.addEventListener('click', toggleMobileMenu);
  mobileOverlay.addEventListener('click', closeMobileMenu);
  
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ==========================================================================
  // 3. APPOINTMENT FORM VALIDATION & SUCCESS MODAL
  // ==========================================================================
  const appointmentForm = document.getElementById('appointment-form');
  const successModal = document.getElementById('success-modal-overlay');
  const successModalClose = document.getElementById('success-modal-close-btn');
  const successModalMsg = document.getElementById('success-modal-msg');

  // Input elements
  const inputName = document.getElementById('booking-name');
  const inputPhone = document.getElementById('booking-phone');
  const inputEmail = document.getElementById('booking-email');
  const inputService = document.getElementById('booking-service');
  const inputDate = document.getElementById('booking-date');
  const inputTime = document.getElementById('booking-time');

  // Error spans
  const errorName = document.getElementById('error-name');
  const errorPhone = document.getElementById('error-phone');
  const errorEmail = document.getElementById('error-email');
  const errorService = document.getElementById('error-service');
  const errorDatetime = document.getElementById('error-datetime');

  // Set minimum date selector to today's date
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  inputDate.min = `${yyyy}-${mm}-${dd}`;

  // Form Submission Interception
  appointmentForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Stop page reload

    // Reset error visuals
    const errorSpans = document.querySelectorAll('.form-error');
    errorSpans.forEach(span => span.style.display = 'none');
    
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(ctrl => ctrl.style.borderColor = 'rgba(0, 0, 0, 0.1)');

    let isValid = true;
    let firstErrorElement = null;

    // Helper: Mark field as invalid
    const invalidateField = (inputElement, errorElement) => {
      isValid = false;
      inputElement.style.borderColor = '#D32F2F';
      errorElement.style.display = 'block';
      if (!firstErrorElement) {
        firstErrorElement = inputElement;
      }
    };

    // 1. Full Name Validation
    if (inputName.value.trim().length < 2) {
      invalidateField(inputName, errorName);
    }

    // 2. Phone Number Validation (Regex checks simple 10 digit patterns)
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    const cleanPhone = inputPhone.value.trim().replace(/\D/g, ''); // strip non-numeric for check
    if (!phoneRegex.test(inputPhone.value.trim()) || cleanPhone.length !== 10) {
      invalidateField(inputPhone, errorPhone);
    }

    // 3. Email Address Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail.value.trim())) {
      invalidateField(inputEmail, errorEmail);
    }

    // 4. Service Category Selection
    if (!inputService.value) {
      invalidateField(inputService, errorService);
    }

    // 5. Date & Time future validation
    if (!inputDate.value || !inputTime.value) {
      invalidateField(inputDate, errorDatetime);
    } else {
      const selectedDateTime = new Date(`${inputDate.value}T${inputTime.value}`);
      const now = new Date();
      if (selectedDateTime <= now) {
        invalidateField(inputDate, errorDatetime);
      }
    }

    // If validation fails, scroll the first error into viewport
    if (!isValid) {
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorElement.focus();
      }
      return;
    }

    // If valid, format information and display the modal
    const clientName = inputName.value.trim();
    const selectedService = inputService.options[inputService.selectedIndex].text;
    const bookingDateStr = formatDateString(inputDate.value);
    const bookingTimeStr = formatTimeString(inputTime.value);

    // Set Modal Message Dynamic Content
    successModalMsg.innerHTML = `
      Thank you, <strong>${clientName}</strong>. Your appointment request for <strong>${selectedService}</strong> has been received successfully.<br><br>
      We look forward to welcoming you on <strong>${bookingDateStr}</strong> at <strong>${bookingTimeStr}</strong>. A concierge team member will contact you shortly via call or email to confirm your booking details.
    `;

    // Activate Modal Overlay
    successModal.classList.add('active');

    // Reset the form fields
    appointmentForm.reset();
  });

  // Modal Dismiss Listeners
  const closeModal = () => {
    successModal.classList.remove('active');
  };

  successModalClose.addEventListener('click', closeModal);
  successModal.addEventListener('click', (event) => {
    // Only close if user clicked the dark overlay itself
    if (event.target === successModal) {
      closeModal();
    }
  });

  // ==========================================================================
  // HELPER FORMATTING FUNCTIONS
  // ==========================================================================
  
  // Convert YYYY-MM-DD to readable "Month Day, Year"
  function formatDateString(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Convert 24h format "HH:MM" to 12h format "H:MM AM/PM"
  function formatTimeString(timeStr) {
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  }

});
