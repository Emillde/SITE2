/* =================================================================
   MINDSPACE - Interactive Quiz JavaScript
   "Trova il percorso adatto a te" con logica condizionale
   Algoritmo di matching personalizzato per servizi MindSpace
   ================================================================= */

'use strict';

const QuizSystem = {
  init: function() {
    this.modal = document.getElementById('quiz-modal');
    this.form = document.getElementById('quiz-form');
    this.currentStep = 1;
    this.totalSteps = 3;
    this.quizData = {};
    this.results = {};
    
    this.elements = {
      steps: this.form.querySelectorAll('.quiz-step'),
      nextButtons: this.form.querySelectorAll('.next-quiz-step'),
      prevButtons: this.form.querySelectorAll('.prev-quiz-step'),
      submitButton: this.form.querySelector('#quiz-form button[type="submit"]'),
      quizOptions: this.form.querySelectorAll('.quiz-option'),
      resultContainer: document.getElementById('quiz-result'),
      resultContent: document.getElementById('result-content'),
      startBookingBtn: document.getElementById('start-booking')
    };
    
    // Quiz configuration
    this.quizConfig = {
      questions: {
        q1: {
          weight: {
            stress: { terapia: 3, evolutiva: 1 },
            confused: { terapia: 2, evolutiva: 2 },
            blocked: { terapia: 2, evolutiva: 3 },
            curious: { terapia: 1, evolutiva: 3 }
          }
        },
        q2: {
          weight: {
            wellbeing: { terapia: 3, evolutiva: 1 },
            skills: { terapia: 1, evolutiva: 3 },
            relationships: { terapia: 3, evolutiva: 2 },
            performance: { terapia: 2, evolutiva: 3 }
          }
        },
        q3: {
          weight: {
            intensive: { terapia: 2, evolutiva: 3 },
            moderate: { terapia: 3, evolutiva: 3 },
            light: { terapia: 2, evolutiva: 2 }
          }
        }
      },
      services: {
        terapia: {
          name: 'Area Terapia',
          description: 'Supporto psicologico professionale per affrontare sfide emotive e mentali',
          icon: '🧠',
          benefits: [
            'Gestione dello stress e dell\'ansia',
            'Sviluppo di resilienza emotiva',
            'Miglioramento del benessere mentale',
            'Supporto per difficoltà relazionali'
          ],
          idealFor: [
            'Chi si sente stressato o ansioso',
            'Chi affronta periodi di cambiamento',
            'Chi vuole migliorare le relazioni',
            'Chi cerca supporto emotivo'
          ]
        },
        evolutiva: {
          name: 'Area Evolutiva',
          description: 'Percorsi educativi per lo sviluppo personale e professionale',
          icon: '🌱',
          benefits: [
            'Sviluppo di nuove competenze',
            'Miglioramento della performance',
            'Crescita personale continua',
            'Ottimizzazione del potenziale'
          ],
          idealFor: [
            'Chi vuole migliorare le proprie competenze',
            'Chi cerca crescita professionale',
            'Chi è in un periodo di transizione',
            'Chi vuole raggiungere obiettivi specifici'
          ]
        }
      },
      thresholds: {
        clear_match: 8,
        moderate_match: 6,
        slight_match: 4
      }
    };
    
    this.bindEvents();
    this.updateStepDisplay();
  },

  bindEvents: function() {
    // Modal controls
    const modalTriggers = document.querySelectorAll('[data-open-quiz]');
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
    
    // Quiz navigation
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
        this.submitQuiz();
      });
    }
    
    // Quiz option selection
    this.elements.quizOptions.forEach(option => {
      option.addEventListener('change', () => {
        this.updateOptionSelection(option);
        this.validateCurrentStep();
      });
    });
    
    // Start booking button
    if (this.elements.startBookingBtn) {
      this.elements.startBookingBtn.addEventListener('click', () => {
        this.startBookingWithRecommendation();
      });
    }
    
    // Option hover effects
    this.elements.quizOptions.forEach(option => {
      option.addEventListener('mouseenter', () => {
        option.classList.add('hovered');
      });
      
      option.addEventListener('mouseleave', () => {
        option.classList.remove('hovered');
      });
    });
  },

  openModal: function() {
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Reset quiz if needed
    if (this.currentStep !== 1) {
      this.resetQuiz();
    }
    
    // Focus first option
    setTimeout(() => {
      const firstOption = this.form.querySelector('.quiz-option input');
      if (firstOption) {
        firstOption.focus();
      }
    }, 100);
  },

  closeModal: function() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Return focus to trigger
    const trigger = document.querySelector('[data-open-quiz]:focus');
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
    
    // Update navigation buttons
    this.updateNavigationButtons();
    
    // Focus first option of current step
    setTimeout(() => {
      const currentStepElement = this.form.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
      const firstOption = currentStepElement.querySelector('.quiz-option input');
      if (firstOption) {
        firstOption.focus();
      }
    }, 100);
  },

  updateNavigationButtons: function() {
    const currentStepElement = this.form.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
    const prevButton = currentStepElement.querySelector('.prev-quiz-step');
    const nextButton = currentStepElement.querySelector('.next-quiz-step');
    const submitButton = currentStepElement.querySelector('button[type="submit"]');
    
    // Show/hide previous button
    if (prevButton) {
      prevButton.style.display = this.currentStep === 1 ? 'none' : 'block';
    }
    
    // Show/hide next vs submit button
    if (nextButton && submitButton) {
      if (this.currentStep === this.totalSteps) {
        nextButton.style.display = 'none';
        submitButton.style.display = 'block';
      } else {
        nextButton.style.display = 'block';
        submitButton.style.display = 'none';
      }
    }
  },

  validateCurrentStep: function() {
    const currentStepElement = this.form.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
    const selectedOption = currentStepElement.querySelector('input[type="radio"]:checked');
    
    const isValid = !!selectedOption;
    
    // Update next button state
    const nextButton = currentStepElement.querySelector('.next-quiz-step');
    if (nextButton) {
      nextButton.disabled = !isValid;
    }
    
    return isValid;
  },

  updateOptionSelection: function(option) {
    const currentStepElement = option.closest('.quiz-step');
    const allOptions = currentStepElement.querySelectorAll('.quiz-option');
    
    allOptions.forEach(opt => {
      const input = opt.querySelector('input');
      opt.classList.toggle('selected', input.checked);
    });
  },

  saveCurrentStepData: function() {
    const currentStepElement = this.form.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
    const selectedOption = currentStepElement.querySelector('input[type="radio"]:checked');
    
    if (selectedOption) {
      this.quizData[`q${this.currentStep}`] = selectedOption.value;
    }
  },

  submitQuiz: function() {
    if (this.validateCurrentStep()) {
      this.saveCurrentStepData();
      this.calculateResults();
      this.showResults();
    }
  },

  calculateResults: function() {
    const scores = {
      terapia: 0,
      evolutiva: 0
    };
    
    // Calculate scores based on quiz configuration
    Object.keys(this.quizData).forEach(questionKey => {
      const answer = this.quizData[questionKey];
      const questionConfig = this.quizConfig.questions[questionKey];
      
      if (questionConfig && questionConfig.weight[answer]) {
        scores.terapia += questionConfig.weight[answer].terapia || 0;
        scores.evolutiva += questionConfig.weight[answer].evolutiva || 0;
      }
    });
    
    // Determine recommendation
    const totalScore = scores.terapia + scores.evolutiva;
    const terapiaPercentage = (scores.terapia / totalScore) * 100;
    const evolutivaPercentage = (scores.evolutiva / totalScore) * 100;
    
    let recommendation, confidence, explanation;
    
    if (Math.abs(terapiaPercentage - evolutivaPercentage) <= 10) {
      // Close match - recommend both with explanation
      recommendation = 'both';
      confidence = 'moderate';
      explanation = 'I tuoi bisogni sono equilibrati tra supporto emotivo e crescita personale. Entrambi i percorsi possono essere utili per te.';
    } else if (terapiaPercentage > evolutivaPercentage) {
      recommendation = 'terapia';
      confidence = terapiaPercentage >= 70 ? 'high' : 'moderate';
      explanation = 'Il tuo profilo indica che potresti beneficiare principalmente di supporto psicologico per affrontare le sfide attuali.';
    } else {
      recommendation = 'evolutiva';
      confidence = evolutivaPercentage >= 70 ? 'high' : 'moderate';
      explanation = 'Il tuo profilo suggerisce che sei pronto/a per un percorso di crescita e sviluppo personale.';
    }
    
    this.results = {
      recommendation,
      confidence,
      explanation,
      scores: {
        terapia: Math.round(terapiaPercentage),
        evolutiva: Math.round(evolutivaPercentage)
      },
      details: {
        stress: this.quizData.q1 === 'stress',
        growth: this.quizData.q1 === 'curious' || this.quizData.q1 === 'blocked',
        emotional: this.quizData.q2 === 'wellbeing' || this.quizData.q2 === 'relationships',
        skills: this.quizData.q2 === 'skills' || this.quizData.q2 === 'performance',
        commitment: this.quizData.q3
      }
    };
  },

  showResults: function() {
    // Hide quiz form
    this.form.style.display = 'none';
    
    // Show results
    this.elements.resultContainer.style.display = 'block';
    
    // Generate result content
    const resultHTML = this.generateResultHTML();
    this.elements.resultContent.innerHTML = resultHTML;
    
    // Track quiz completion
    this.trackQuizCompletion();
  },

  generateResultHTML: function() {
    const { recommendation, confidence, explanation, scores } = this.results;
    
    let html = `
      <div class="quiz-result-header">
        <div class="result-icon">${this.getResultIcon(recommendation)}</div>
        <h4>${this.getResultTitle(recommendation)}</h4>
        <div class="confidence-indicator">
          <span class="confidence-label">Affidabilità:</span>
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${this.getConfidencePercentage(confidence)}%"></div>
          </div>
          <span class="confidence-text">${this.getConfidenceText(confidence)}</span>
        </div>
      </div>
      
      <div class="result-explanation">
        <p>${explanation}</p>
      </div>
      
      <div class="score-breakdown">
        <h5>Analisi dettagliata:</h5>
        <div class="score-bars">
          <div class="score-item">
            <span class="score-label">Area Terapia</span>
            <div class="score-bar">
              <div class="score-fill terapia" style="width: ${scores.terapia}%"></div>
            </div>
            <span class="score-value">${scores.terapia}%</span>
          </div>
          <div class="score-item">
            <span class="score-label">Area Evolutiva</span>
            <div class="score-bar">
              <div class="score-fill evolutiva" style="width: ${scores.evolutiva}%"></div>
            </div>
            <span class="score-value">${scores.evolutiva}%</span>
          </div>
        </div>
      </div>
    `;
    
    if (recommendation === 'both') {
      html += `
        <div class="dual-recommendation">
          <h5>Entrambe le aree possono essere utili per te:</h5>
          <div class="dual-options">
            ${this.generateServiceCard('terapia')}
            ${this.generateServiceCard('evolutiva')}
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="primary-recommendation">
          ${this.generateServiceCard(recommendation)}
        </div>
      `;
    }
    
    return html;
  },

  getResultIcon: function(recommendation) {
    const icons = {
      'terapia': '🧠',
      'evolutiva': '🌱',
      'both': '⚖️'
    };
    return icons[recommendation] || '🎯';
  },

  getResultTitle: function(recommendation) {
    const titles = {
      'terapia': 'Area Terapia è il percorso ideale per te',
      'evolutiva': 'Area Evolutiva è il percorso ideale per te',
      'both': 'Un percorso integrato è ideale per te'
    };
    return titles[recommendation] || 'Il tuo percorso personale';
  },

  getConfidencePercentage: function(confidence) {
    const percentages = {
      'high': 90,
      'moderate': 70,
      'low': 50
    };
    return percentages[confidence] || 50;
  },

  getConfidenceText: function(confidence) {
    const texts = {
      'high': 'Alta',
      'moderate': 'Media',
      'low': 'Bassa'
    };
    return texts[confidence] || 'Media';
  },

  generateServiceCard: function(serviceKey) {
    const service = this.quizConfig.services[serviceKey];
    
    return `
      <div class="service-recommendation ${serviceKey}">
        <div class="service-header">
          <span class="service-icon">${service.icon}</span>
          <h6>${service.name}</h6>
        </div>
        <p class="service-description">${service.description}</p>
        <div class="service-benefits">
          <strong>Potenziali benefici:</strong>
          <ul>
            ${service.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
          </ul>
        </div>
        <div class="service-ideal">
          <strong>Ideale per:</strong>
          <ul>
            ${service.idealFor.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  },

  startBookingWithRecommendation: function() {
    // Close quiz modal
    this.closeModal();
    
    // Navigate to contatti.html with recommendation data
    setTimeout(() => {
      const recommendationData = {
        service: this.results.recommendation,
        confidence: this.results.confidence,
        scores: this.results.scores
      };
      
      // Store in sessionStorage for contact page to use
      sessionStorage.setItem('quizRecommendation', JSON.stringify(recommendationData));
      
      // Navigate to contact page
      window.location.href = 'contatti.html';
    }, 300);
    
    // Track conversion
    this.trackQuizConversion();
  },

  trackQuizCompletion: function() {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'quiz_completed', {
        'recommendation': this.results.recommendation,
        'confidence': this.results.confidence,
        'scores': this.results.scores
      });
    }
    
    console.log('Quiz completed:', this.results);
  },

  trackQuizConversion: function() {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'quiz_to_booking_conversion', {
        'recommendation': this.results.recommendation
      });
    }
    
    console.log('Quiz conversion tracked');
  },

  resetQuiz: function() {
    this.currentStep = 1;
    this.quizData = {};
    this.results = {};
    
    // Reset form
    this.form.reset();
    this.form.style.display = 'block';
    
    // Hide results
    this.elements.resultContainer.style.display = 'none';
    this.elements.resultContent.innerHTML = '';
    
    // Reset option selections
    this.elements.quizOptions.forEach(option => {
      option.classList.remove('selected', 'hovered');
    });
    
    this.updateStepDisplay();
  },

  // Public methods
  getResults: function() {
    return this.results;
  }
};

// Initialize quiz system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  QuizSystem.init();
  
  // Make it globally available
  window.QuizSystem = QuizSystem;
  
  console.log('🧭 Quiz System Ready');
});

// Export for testing or external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizSystem;
}
