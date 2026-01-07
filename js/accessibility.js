/* =================================================================
   MINDSPACE - Accessibility Panel JavaScript
   Widget sempre visibile per accessibilità avanzata
   Funzionalità: Focus Mode, Dyslexic Font, Warm Contrast, Font Size
   ================================================================= */

'use strict';

const AccessibilityPanel = {
  init: function() {
    this.panel = document.getElementById('accessibility-panel');
    this.toggle = document.querySelector('.accessibility-toggle');
    this.content = document.querySelector('.accessibility-content');
    this.buttons = {
      focusMode: document.getElementById('focus-mode'),
      dyslexicFont: document.getElementById('dyslexic-font'),
      warmContrast: document.getElementById('warm-contrast'),
      increaseFont: document.getElementById('increase-font')
    };
    
    this.state = {
      isOpen: false,
      focusMode: false,
      dyslexicFont: false,
      warmContrast: false,
      increasedFont: false
    };
    
    this.bindEvents();
    this.loadSettings();
    this.setupKeyboardNavigation();
  },

  bindEvents: function() {
    // Toggle panel
    if (this.toggle) {
      this.toggle.addEventListener('click', () => this.togglePanel());
    }

    // Accessibility buttons
    Object.keys(this.buttons).forEach(key => {
      const button = this.buttons[key];
      if (button) {
        button.addEventListener('click', () => this.toggleFeature(key));
      }
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (this.state.isOpen && !this.panel.contains(e.target)) {
        this.closePanel();
      }
    });

    // Close panel with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isOpen) {
        this.closePanel();
        this.toggle.focus();
      }
    });

    // Listen for system preference changes
    this.setupSystemPreferences();
  },

  togglePanel: function() {
    if (this.state.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  },

  openPanel: function() {
    this.state.isOpen = true;
    this.panel.classList.add('open');
    this.toggle.setAttribute('aria-expanded', 'true');
    this.content.setAttribute('aria-hidden', 'false');
    
    // Focus first button when panel opens
    setTimeout(() => {
      const firstButton = this.content.querySelector('.accessibility-btn');
      if (firstButton) {
        firstButton.focus();
      }
    }, 100);
  },

  closePanel: function() {
    this.state.isOpen = false;
    this.panel.classList.remove('open');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.content.setAttribute('aria-hidden', 'true');
  },

  toggleFeature: function(feature) {
    const button = this.buttons[feature];
    const isActive = button.classList.contains('active');
    
    if (isActive) {
      this.deactivateFeature(feature);
    } else {
      this.activateFeature(feature);
    }
    
    this.saveSettings();
    this.announceChange(feature, !isActive);
  },

  activateFeature: function(feature) {
    const button = this.buttons[feature];
    
    switch(feature) {
      case 'focusMode':
        this.activateFocusMode();
        break;
      case 'dyslexicFont':
        this.activateDyslexicFont();
        break;
      case 'warmContrast':
        this.activateWarmContrast();
        break;
      case 'increaseFont':
        this.activateIncreasedFont();
        break;
    }
    
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
    this.state[feature] = true;
  },

  deactivateFeature: function(feature) {
    const button = this.buttons[feature];
    
    switch(feature) {
      case 'focusMode':
        this.deactivateFocusMode();
        break;
      case 'dyslexicFont':
        this.deactivateDyslexicFont();
        break;
      case 'warmContrast':
        this.deactivateWarmContrast();
        break;
      case 'increaseFont':
        this.deactivateIncreasedFont();
        break;
    }
    
    button.classList.remove('active');
    button.setAttribute('aria-pressed', 'false');
    this.state[feature] = false;
  },

  // Focus Mode Implementation
  activateFocusMode: function() {
    document.body.classList.add('focus-mode');
    
    // Disable animations
    if (window.MindSpaceApp && window.MindSpaceApp.RevealAnimations) {
      window.MindSpaceApp.RevealAnimations.toggleAnimations(false);
    }
    
    // Reduce visual distractions
    this.reduceVisualDistractions();
  },

  deactivateFocusMode: function() {
    document.body.classList.remove('focus-mode');
    
    // Re-enable animations
    if (window.MindSpaceApp && window.MindSpaceApp.RevealAnimations) {
      window.MindSpaceApp.RevealAnimations.toggleAnimations(true);
    }
    
    // Restore visual elements
    this.restoreVisualElements();
  },

  reduceVisualDistractions: function() {
    // Add overlay to reduce contrast
    const overlay = document.createElement('div');
    overlay.id = 'focus-mode-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.05);
      pointer-events: none;
      z-index: 1;
    `;
    document.body.appendChild(overlay);
  },

  restoreVisualElements: function() {
    const overlay = document.getElementById('focus-mode-overlay');
    if (overlay) {
      overlay.remove();
    }
  },

  // Dyslexic Font Implementation
  activateDyslexicFont: function() {
    document.body.classList.add('dyslexic-font');
    
    // Increase letter spacing and line height
    this.applyDyslexicStyles();
  },

  deactivateDyslexicFont: function() {
    document.body.classList.remove('dyslexic-font');
    
    // Remove custom styles
    this.removeDyslexicStyles();
  },

  applyDyslexicStyles: function() {
    const style = document.createElement('style');
    style.id = 'dyslexic-font-styles';
    style.textContent = `
      body.dyslexic-font * {
        letter-spacing: 0.1em !important;
        line-height: 1.8 !important;
        word-spacing: 0.1em !important;
      }
      
      body.dyslexic-font h1,
      body.dyslexic-font h2,
      body.dyslexic-font h3 {
        letter-spacing: 0.05em !important;
      }
    `;
    document.head.appendChild(style);
  },

  removeDyslexicStyles: function() {
    const style = document.getElementById('dyslexic-font-styles');
    if (style) {
      style.remove();
    }
  },

  // Warm Contrast Implementation
  activateWarmContrast: function() {
    document.body.classList.add('warm-contrast');
    
    // Apply warm color scheme
    this.applyWarmContrastStyles();
  },

  deactivateWarmContrast: function() {
    document.body.classList.remove('warm-contrast');
    
    // Remove warm styles
    this.removeWarmContrastStyles();
  },

  applyWarmContrastStyles: function() {
    const style = document.createElement('style');
    style.id = 'warm-contrast-styles';
    style.textContent = `
      body.warm-contrast {
        background: #F5E6D3 !important;
        color: #5D4E37 !important;
      }
      
      body.warm-contrast * {
        color: #5D4E37 !important;
      }
      
      body.warm-contrast .header-transparent.scrolled {
        background: rgba(245, 230, 211, 0.95) !important;
      }
      
      body.warm-contrast .service-card,
      body.warm-contrast .team-member,
      body.warm-contrast .blog-card,
      body.warm-contrast .method-step {
        background: #FFF8DC !important;
        border-color: #DEB887 !important;
      }
      
      body.warm-contrast .modal-content {
        background: #FFF8DC !important;
      }
      
      body.warm-contrast input,
      body.warm-contrast select,
      body.warm-contrast textarea {
        background: #FFF8DC !important;
        border-color: #DEB887 !important;
        color: #5D4E37 !important;
      }
      
      body.warm-contrast .service-option,
      body.warm-contrast .quiz-option {
        background: #FFF8DC !important;
        border-color: #DEB887 !important;
      }
      
      body.warm-contrast .service-option.selected,
      body.warm-contrast .quiz-option.selected {
        background: #DEB887 !important;
      }
    `;
    document.head.appendChild(style);
  },

  removeWarmContrastStyles: function() {
    const style = document.getElementById('warm-contrast-styles');
    if (style) {
      style.remove();
    }
  },

  // Increased Font Implementation
  activateIncreasedFont: function() {
    document.body.classList.add('increased-font');
    
    // Apply larger font sizes
    this.applyIncreasedFontStyles();
  },

  deactivateIncreasedFont: function() {
    document.body.classList.remove('increased-font');
    
    // Remove larger font styles
    this.removeIncreasedFontStyles();
  },

  applyIncreasedFontStyles: function() {
    const style = document.createElement('style');
    style.id = 'increased-font-styles';
    style.textContent = `
      body.increased-font {
        font-size: 18px !important;
      }
      
      body.increased-font .hero-title {
        font-size: 4rem !important;
      }
      
      body.increased-font .section-title {
        font-size: 3rem !important;
      }
      
      body.increased-font .service-title,
      body.increased-font .member-name,
      body.increased-font .blog-title {
        font-size: 1.6rem !important;
      }
      
      body.increased-font .service-description,
      body.increased-font .member-bio,
      body.increased-font .blog-excerpt {
        font-size: 1.1rem !important;
      }
      
      body.increased-font .cta-primary,
      body.increased-font .cta-secondary,
      body.increased-font .service-cta {
        font-size: 1.2rem !important;
        padding: 1.2rem 2.8rem !important;
      }
    `;
    document.head.appendChild(style);
  },

  removeIncreasedFontStyles: function() {
    const style = document.getElementById('increased-font-styles');
    if (style) {
      style.remove();
    }
  },

  // Settings persistence
  saveSettings: function() {
    const settings = {
      focusMode: this.state.focusMode,
      dyslexicFont: this.state.dyslexicFont,
      warmContrast: this.state.warmContrast,
      increasedFont: this.state.increasedFont
    };
    
    try {
      localStorage.setItem('mindspace-accessibility', JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save accessibility settings:', e);
    }
  },

  loadSettings: function() {
    try {
      const saved = localStorage.getItem('mindspace-accessibility');
      if (saved) {
        const settings = JSON.parse(saved);
        
        Object.keys(settings).forEach(key => {
          if (settings[key] && this.buttons[key]) {
            this.activateFeature(key);
          }
        });
      }
    } catch (e) {
      console.warn('Could not load accessibility settings:', e);
    }
  },

  // System preferences detection
  setupSystemPreferences: function() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Automatically enable focus mode for users who prefer reduced motion
      if (!this.state.focusMode) {
        this.activateFeature('focusMode');
      }
    }

    // Check for high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      // Could automatically enable warm contrast
      console.log('High contrast mode detected');
    }

    // Listen for preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches && !this.state.focusMode) {
        this.activateFeature('focusMode');
      }
    });
  },

  // Keyboard navigation
  setupKeyboardNavigation: function() {
    // Trap focus within panel when open
    this.panel.addEventListener('keydown', (e) => {
      if (!this.state.isOpen) return;
      
      const focusableElements = this.panel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  },

  // Screen reader announcements
  announceChange: function(feature, activated) {
    const announcements = {
      focusMode: activated ? 'Modalità focus attivata' : 'Modalità focus disattivata',
      dyslexicFont: activated ? 'Font per dislessia attivato' : 'Font per dislessia disattivato',
      warmContrast: activated ? 'Contrasto caldo attivato' : 'Contrasto caldo disattivato',
      increaseFont: activated ? 'Dimensione font aumentata' : 'Dimensione font ripristinata'
    };
    
    const message = announcements[feature];
    if (message) {
      this.announceToScreenReader(message);
    }
  },

  announceToScreenReader: function(message) {
    // Create or update live region
    let liveRegion = document.getElementById('accessibility-live-region');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'accessibility-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  },

  // Reset all settings
  resetAll: function() {
    Object.keys(this.state).forEach(key => {
      if (this.state[key] && key !== 'isOpen') {
        this.deactivateFeature(key);
      }
    });
    
    this.saveSettings();
    this.announceToScreenReader('Impostazioni accessibilità ripristinate');
  },

  // Get current state
  getState: function() {
    return { ...this.state };
  }
};

// Initialize accessibility panel when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  AccessibilityPanel.init();
  
  // Make it globally available
  window.AccessibilityPanel = AccessibilityPanel;
  
  console.log('♿ Accessibility Panel Ready');
});

// Export for testing or external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityPanel;
}
