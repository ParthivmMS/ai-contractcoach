// ContractCoach JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const loadingAnimation = document.getElementById('loadingAnimation');
    const analysisResults = document.getElementById('analysisResults');
    const demoClause = document.getElementById('demoClause');
    const uploadContent = document.getElementById('uploadContent');
    const progressFill = document.getElementById('progressFill');

    // File upload handling
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileInput);
    demoClause.addEventListener('click', handleDemoAnalysis);

    // Smooth scrolling for navigation links
    initSmoothScrolling();
    
    // Initialize typing effect
    initTypingEffect();
});

function handleDragOver(e) {
    e.preventDefault();
    e.target.closest('.upload-area').classList.add('dragover');
}

function handleDragLeave(e) {
    e.target.closest('.upload-area').classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    const uploadArea = e.target.closest('.upload-area');
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (isValidFileType(file)) {
            handleFileUpload(file);
        } else {
            showError('Please upload a valid file type (PDF, DOC, DOCX, or TXT)');
        }
    }
}

function handleFileInput(e) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        if (isValidFileType(file)) {
            handleFileUpload(file);
        } else {
            showError('Please upload a valid file type (PDF, DOC, DOCX, or TXT)');
        }
    }
}

function handleDemoAnalysis() {
    console.log('Starting demo analysis...');
    startAnalysis();
}

function isValidFileType(file) {
    const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    return validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.txt');
}

function handleFileUpload(file) {
    console.log('File uploaded:', file.name, 'Size:', formatFileSize(file.size));
    
    // Check file size (30MB limit for demo)
    if (file.size > 30 * 1024 * 1024) {
        showError('File too large. Please upload files under 30MB.');
        return;
    }
    
    startAnalysis(file.name);
}

function startAnalysis(fileName = 'demo contract') {
    // Hide upload content
    const uploadContent = document.getElementById('uploadContent');
    if (uploadContent) {
        uploadContent.style.display = 'none';
    }
    
    // Show loading animation
    const loadingAnimation = document.getElementById('loadingAnimation');
    if (loadingAnimation) {
        loadingAnimation.style.display = 'block';
    }
    
    // Update loading text based on file
    const loadingText = loadingAnimation.querySelector('p');
    if (loadingText) {
        loadingText.textContent = `Analyzing ${fileName}... This may take a few seconds`;
    }
    
    // Simulate analysis progress with realistic timing
    setTimeout(() => {
        completeAnalysis();
    }, 3000 + Math.random() * 2000); // 3-5 seconds
}

function completeAnalysis() {
    const loadingAnimation = document.getElementById('loadingAnimation');
    const analysisResults = document.getElementById('analysisResults');
    const progressFill = document.getElementById('progressFill');
    
    // Hide loading animation
    if (loadingAnimation) {
        loadingAnimation.style.display = 'none';
    }
    
    // Show analysis results
    if (analysisResults) {
        analysisResults.style.display = 'block';
        
        // Animate progress bar
        setTimeout(() => {
            if (progressFill) {
                progressFill.style.width = '85%';
            }
        }, 500);
        
        // Smooth scroll to results
        analysisResults.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Add entrance animation to result items
        animateResultItems();
    }
}

function animateResultItems() {
    const clauseItems = document.querySelectorAll('.clause-item');
    clauseItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.5s, transform 0.5s';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100);
        }, index * 200);
    });
}

function showError(message) {
    // Create and show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border: 1px solid #f5c6cb;
        text-align: center;
    `;
    errorDiv.textContent = message;
    
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.appendChild(errorDiv);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function initSmoothScrolling() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initTypingEffect() {
    const heroText = document.querySelector('.hero h1');
    if (heroText) {
        const text = heroText.textContent;
        heroText.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 1000);
    }
}

// Pricing card interactions
function initPricingInteractions() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        const button = card.querySelector('.cta-button');
        if (button) {
            button.addEventListener('click', function() {
                const planName = card.querySelector('h3').textContent;
                handlePricingSelection(planName);
            });
        }
    });
}

function handlePricingSelection(planName) {
    console.log('Selected plan:', planName);
    
    // In a real application, this would redirect to payment processing
    // For demo purposes, show an alert
    alert(`Selected: ${planName}\n\nIn the full version, this would redirect to secure payment processing.`);
}

// Initialize additional features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initPricingInteractions();
    initScrollAnimations();
    initMobileMenu();
});

function initScrollAnimations() {
    // Add scroll-based animations for feature cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Observe pricing cards
    document.querySelectorAll('.pricing-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

function initMobileMenu() {
    // Add mobile menu functionality if needed
    const navLinks = document.querySelector('.nav-links');
    const logo = document.querySelector('.logo');
    
    // Create hamburger menu for mobile
    if (window.innerWidth <= 768) {
        createMobileMenu();
    }
    
    // Listen for window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-toggle')) {
            createMobileMenu();
        } else if (window.innerWidth > 768) {
            removeMobileMenu();
        }
    });
}

function createMobileMenu() {
    const nav = document.querySelector('nav');
    const navLinks = document.querySelector('.nav-links');
    
    if (!document.querySelector('.mobile-menu-toggle')) {
        // Create hamburger button
        const hamburger = document.createElement('button');
        hamburger.className = 'mobile-menu-toggle';
        hamburger.innerHTML = '☰';
        hamburger.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #333;
            display: block;
        `;
        
        // Insert hamburger before CTA button
        const ctaButton = nav.querySelector('.cta-button');
        nav.insertBefore(hamburger, ctaButton);
        
        // Add click event
        hamburger.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.backgroundColor = 'white';
            navLinks.style.padding = '1rem';
            navLinks.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        });
    }
}

function removeMobileMenu() {
    const hamburger = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.remove();
    }
    
    if (navLinks) {
        navLinks.style.display = '';
        navLinks.style.flexDirection = '';
        navLinks.style.position = '';
        navLinks.style.top = '';
        navLinks.style.left = '';
        navLinks.style.right = '';
        navLinks.style.backgroundColor = '';
        navLinks.style.padding = '';
        navLinks.style.boxShadow = '';
    }
}

// Add some utility functions for future enhancements
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1001;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = '#27ae60';
            break;
        case 'error':
            notification.style.background = '#e74c3c';
            break;
        case 'warning':
            notification.style.background = '#f39c12';
            break;
        default:
            notification.style.background = '#667eea';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Analytics tracking (placeholder for real analytics)
function trackEvent(eventName, properties = {}) {
    console.log('Analytics Event:', eventName, properties);
    // In production, this would send to your analytics service
    // Example: gtag('event', eventName, properties);
}
