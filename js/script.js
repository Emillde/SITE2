/* =================================================================
   MINDSPACE - Main JavaScript
   Animazioni scroll, navigazione fluida, interazioni avanzate
   Stile Monarchies.lu con performance ottimizzata
   ================================================================= */

'use strict';

// Configurazione globale
const CONFIG = {
  scrollThreshold: 50,
  revealOffset: 100,
  debounceDelay: 100,
  animationDuration: 800,
  headerHeight: 80
};

// Stato dell'applicazione
const STATE = {
  isScrolling: false,
  lastScrollY: 0,
  mobileMenuOpen: false,
  currentSection: null,
  animationsEnabled: true
};

// Utility functions
const Utils = {
  // Debounce per performance
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle per scroll events
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Smooth scroll con offset per header fisso
  smoothScroll: (target) => {
    const element = document.querySelector(target);
    if (element) {
      const headerHeight = document.querySelector('.header-transparent').offsetHeight;
      const targetPosition = element.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  },

  // Check se elemento è in viewport
  isInViewport: (element, offset = 0) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight - offset) &&
      rect.bottom >= 0 &&
      rect.left <= window.innerWidth &&
      rect.right >= 0
    );
  },

  // Get scroll direction
  getScrollDirection: () => {
    const currentScrollY = window.pageYOffset;
    const direction = currentScrollY > STATE.lastScrollY ? 'down' : 'up';
    STATE.lastScrollY = currentScrollY;
    return direction;
  }
};

// Header Management
const Header = {
  init: function() {
    this.header = document.querySelector('.header-transparent');
    this.navToggle = document.querySelector('.nav-toggle');
    this.navMenu = document.querySelector('.nav-menu');
    
    this.bindEvents();
    this.updateHeaderState();
  },

  bindEvents: function() {
    // Scroll event per header
    window.addEventListener('scroll', Utils.throttle(() => {
      this.updateHeaderState();
    }, 16));

    // Mobile menu toggle
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Navigation links
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Check if it's an internal anchor or external page
        if (href.startsWith('#')) {
          e.preventDefault();
          Utils.smoothScroll(href);
          this.closeMobileMenu();
        } else {
          // External page navigation - let it proceed normally
          this.closeMobileMenu();
        }
      });
    });

    // Close mobile menu on resize
    window.addEventListener('resize', Utils.debounce(() => {
      if (window.innerWidth > 768 && STATE.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    }, 250));
  },

  updateHeaderState: function() {
    const scrollY = window.pageYOffset;
    const shouldBeSolid = scrollY > CONFIG.scrollThreshold;
    
    if (shouldBeSolid) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }

    // Hide/show header on scroll (mobile)
    if (window.innerWidth <= 768) {
      const scrollDirection = Utils.getScrollDirection();
      if (scrollDirection === 'down' && scrollY > 100) {
        this.header.style.transform = 'translateY(-100%)';
      } else {
        this.header.style.transform = 'translateY(0)';
      }
    }
  },

  toggleMobileMenu: function() {
    STATE.mobileMenuOpen = !STATE.mobileMenuOpen;
    
    if (STATE.mobileMenuOpen) {
      this.navMenu.classList.add('active');
      this.navToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      this.navMenu.classList.remove('active');
      this.navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  },

  closeMobileMenu: function() {
    if (STATE.mobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }
};

// Reveal on Scroll Animations
const RevealAnimations = {
  init: function() {
    this.elements = document.querySelectorAll('.reveal-element');
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.setupObserver();
    this.checkInitialElements();
  },

  setupObserver: function() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && STATE.animationsEnabled) {
          this.revealElement(entry.target);
        }
      });
    }, this.observerOptions);

    this.elements.forEach(element => {
      this.observer.observe(element);
    });
  },

  checkInitialElements: function() {
    this.elements.forEach(element => {
      if (Utils.isInViewport(element, CONFIG.revealOffset)) {
        this.revealElement(element);
      }
    });
  },

  revealElement: function(element) {
    element.classList.add('revealed');
    
    // Stagger animation for multiple elements
    const delay = element.dataset.delay || 0;
    element.style.transitionDelay = `${delay}ms`;
    
    // Remove from observer after reveal
    if (this.observer) {
      this.observer.unobserve(element);
    }
  },

  // Manual reveal for specific elements
  revealElementManually: function(selector) {
    const element = document.querySelector(selector);
    if (element && !element.classList.contains('revealed')) {
      this.revealElement(element);
    }
  },

  // Disable/enable animations
  toggleAnimations: function(enabled) {
    STATE.animationsEnabled = enabled;
    if (!enabled) {
      this.elements.forEach(element => {
        element.classList.add('revealed');
      });
    }
  }
};

// Hero Section Interactions
const HeroSection = {
  init: function() {
    this.startJourneyBtn = document.getElementById('start-journey');
    this.discoverServicesBtn = document.getElementById('discover-services');
    this.takeQuizBtn = document.getElementById('take-quiz');
    
    this.bindEvents();
    this.initHeroAnimation();
  },

  bindEvents: function() {
    if (this.startJourneyBtn) {
      this.startJourneyBtn.addEventListener('click', () => {
        window.location.href = 'servizi.html';
      });
    }

    if (this.discoverServicesBtn) {
      this.discoverServicesBtn.addEventListener('click', () => {
        window.location.href = 'servizi.html';
      });
    }

    if (this.takeQuizBtn) {
      this.takeQuizBtn.addEventListener('click', () => {
        if (window.ModalManager) {
          ModalManager.openModal('quiz-modal');
        }
      });
    }
  },

  initHeroAnimation: function() {
    // Parallax effect for hero background
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
      window.addEventListener('scroll', Utils.throttle(() => {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        heroBackground.style.transform = `translateY(${parallax}px)`;
      }, 16));
    }

    // Floating animation for hero elements
    this.animateHeroElements();
  },

  animateHeroElements: function() {
    const heroText = document.querySelector('.hero-text');
    const quizPrompt = document.querySelector('.quiz-prompt');
    
    if (heroText) {
      setTimeout(() => {
        heroText.classList.add('revealed');
      }, 300);
    }
    
    if (quizPrompt) {
      setTimeout(() => {
        quizPrompt.classList.add('revealed');
      }, 800);
    }
  }
};

// Service Cards Interactions
const ServiceCards = {
  init: function() {
    this.serviceCards = document.querySelectorAll('.service-card');
    this.serviceCTAs = document.querySelectorAll('.service-cta');
    
    this.bindEvents();
  },

  bindEvents: function() {
    this.serviceCTAs.forEach(cta => {
      cta.addEventListener('click', (e) => {
        const service = cta.dataset.service;
        this.handleServiceClick(service, e);
      });
    });

    // Hover effects with enhanced feedback
    this.serviceCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.addHoverEffect(card);
      });
      
      card.addEventListener('mouseleave', () => {
        this.removeHoverEffect(card);
      });

      // Touch feedback for mobile
      card.addEventListener('touchstart', () => {
        this.addHoverEffect(card);
      });
      
      card.addEventListener('touchend', () => {
        setTimeout(() => this.removeHoverEffect(card), 200);
      });
    });
  },

  addHoverEffect: function(card) {
    card.style.transform = 'translateY(-8px) scale(1.02)';
  },

  removeHoverEffect: function(card) {
    card.style.transform = '';
  },

  handleServiceClick: function(service, event) {
    event.preventDefault();
    
    // Navigate to servizi.html with service anchor
    window.location.href = `servizi.html#${service}`;
  }
};

// Method Section Horizontal Scroll
const MethodSection = {
  init: function() {
    this.scrollContainer = document.querySelector('.method-horizontal-scroll');
    this.methodSteps = document.querySelectorAll('.method-step');
    
    if (this.scrollContainer) {
      this.initHorizontalScroll();
      this.bindEvents();
    }
  },

  initHorizontalScroll: function() {
    // Add snap points for smooth scrolling
    this.scrollContainer.style.scrollSnapType = 'x mandatory';
    
    // Center first step on load
    if (this.methodSteps.length > 0) {
      this.methodSteps[0].scrollIntoView({ 
        behavior: 'smooth', 
        inline: 'center',
        block: 'nearest'
      });
    }
  },

  bindEvents: function() {
    // Click on step to center it
    this.methodSteps.forEach(step => {
      step.addEventListener('click', () => {
        step.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      });
    });

    // Keyboard navigation
    this.scrollContainer.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.navigateSteps('prev');
      } else if (e.key === 'ArrowRight') {
        this.navigateSteps('next');
      }
    });
  },

  navigateSteps: function(direction) {
    const currentCenter = this.getCurrentCenterStep();
    let targetStep;
    
    if (direction === 'next' && currentCenter < this.methodSteps.length - 1) {
      targetStep = this.methodSteps[currentCenter + 1];
    } else if (direction === 'prev' && currentCenter > 0) {
      targetStep = this.methodSteps[currentCenter - 1];
    }
    
    if (targetStep) {
      targetStep.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  },

  getCurrentCenterStep: function() {
    const containerRect = this.scrollContainer.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    this.methodSteps.forEach((step, index) => {
      const stepRect = step.getBoundingClientRect();
      const stepCenter = stepRect.left + stepRect.width / 2;
      const distance = Math.abs(containerCenter - stepCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    
    return closestIndex;
  }
};

// Team Section Interactions
const TeamSection = {
  init: function() {
    this.teamMembers = document.querySelectorAll('.team-member');
    
    this.bindEvents();
  },

  bindEvents: function() {
    this.teamMembers.forEach(member => {
      member.addEventListener('click', () => {
        this.showMemberDetails(member);
      });

      // Enhanced hover effects
      member.addEventListener('mouseenter', () => {
        this.addMemberHover(member);
      });
      
      member.addEventListener('mouseleave', () => {
        this.removeMemberHover(member);
      });
    });
  },

  addMemberHover: function(member) {
    const photo = member.querySelector('.member-photo');
    if (photo) {
      photo.style.transform = 'scale(1.05)';
      photo.style.transition = 'transform 0.3s ease';
    }
  },

  removeMemberHover: function(member) {
    const photo = member.querySelector('.member-photo');
    if (photo) {
      photo.style.transform = '';
    }
  },

  showMemberDetails: function(member) {
    // Navigate to team.html with member anchor
    const name = member.querySelector('.member-name').textContent;
    const memberSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[^a-z0-9-]/g, '');
    window.location.href = `team.html#${memberSlug}`;
  }
};

// Blog Section Interactions
const BlogSection = {
  init: function() {
    this.blogCards = document.querySelectorAll('.blog-card');
    this.blogLinks = document.querySelectorAll('.blog-link');
    
    this.bindEvents();
  },

  bindEvents: function() {
    this.blogLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleBlogClick(link);
      });
    });

    // Lazy loading for blog images (when real images are added)
    this.setupLazyLoading();
  },

  handleBlogClick: function(link) {
    // Navigate to blog.html with article anchor
    const title = link.closest('.blog-card').querySelector('.blog-title').textContent;
    const articleSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[^a-z0-9-]/g, '');
    window.location.href = `blog.html#${articleSlug}`;
  },

  setupLazyLoading: function() {
    // Setup for future image lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
};

// Form Validation Helper
const FormValidation = {
  validateEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePhone: function(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  showError: function(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--color-accent)';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '0.5rem';
    field.parentNode.appendChild(errorDiv);
  },

  clearError: function(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  },

  validateForm: function(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      this.clearError(field);
      
      if (!field.value.trim()) {
        this.showError(field, 'Questo campo è obbligatorio');
        isValid = false;
      } else if (field.type === 'email' && !this.validateEmail(field.value)) {
        this.showError(field, 'Inserisci un\'email valida');
        isValid = false;
      } else if (field.type === 'tel' && !this.validatePhone(field.value)) {
        this.showError(field, 'Inserisci un numero di telefono valido');
        isValid = false;
      }
    });
    
    return isValid;
  }
};

// Performance Monitor
const PerformanceMonitor = {
  init: function() {
    this.measurePageLoad();
    this.setupUserTiming();
  },

  measurePageLoad: function() {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
      
      // Log performance metrics
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0];
        console.log('Navigation timing:', {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          total: navigation.loadEventEnd - navigation.fetchStart
        });
      }
    });
  },

  setupUserTiming: function() {
    // Mark important interactions
    this.mark('app-start');
    
    // Measure time to interactive
    setTimeout(() => {
      this.mark('time-to-interactive');
      this.measure('app-start-to-interactive', 'app-start', 'time-to-interactive');
    }, 100);
  },

  mark: function(name) {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  },

  measure: function(name, startMark, endMark) {
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
      } catch (e) {
        console.warn('Performance measure failed:', e);
      }
    }
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 MindSpace Application Initializing...');
  
  // Mark app start
  PerformanceMonitor.mark('dom-ready');
  
  // Initialize components
  Header.init();
  RevealAnimations.init();
  HeroSection.init();
  ServiceCards.init();
  MethodSection.init();
  TeamSection.init();
  BlogSection.init();
  PerformanceMonitor.init();
  
  // Global error handling
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
  });
  
  // Mark app ready
  PerformanceMonitor.mark('app-ready');
  PerformanceMonitor.measure('app-initialization', 'dom-ready', 'app-ready');
  
  console.log('✅ MindSpace Application Ready');
});

// Global functions for onclick compatibility
window.openBooking = function(service = null) {
  if (window.BookingSystem) {
    if (service) {
      window.BookingSystem.openWithService(service);
    } else {
      window.BookingSystem.openModal();
    }
  } else {
    // Fallback: navigate to contatti.html
    window.location.href = 'contatti.html';
  }
};

window.openQuiz = function() {
  if (window.QuizSystem) {
    window.QuizSystem.openModal();
  } else {
    // Fallback: navigate to contatti.html with quiz intent
    window.location.href = 'contatti.html?quiz=true';
  }
};

// Export for global access
window.MindSpaceApp = {
  Utils,
  Header,
  RevealAnimations,
  FormValidation,
  PerformanceMonitor
};
