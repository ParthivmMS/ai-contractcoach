// ContractCoach JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing ContractCoach...');
    initializeFileUpload();
    initSmoothScrolling();
    initTypingEffect();
    initContactForm();
});

function initializeFileUpload() {
    console.log('Initializing file upload...');
    
    // Get elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const demoClause = document.getElementById('demoClause');
    
    console.log('Upload elements found:', {
        uploadArea: !!uploadArea,
        fileInput: !!fileInput, 
        demoClause: !!demoClause
    });
    
    // File input change handler
    if (fileInput) {
        // Remove any existing event listeners
        fileInput.removeEventListener('change', handleFileInput);
        // Add fresh event listener
        fileInput.addEventListener('change', handleFileInput);
        console.log('File input event listener attached');
    }
    
    // Upload area drag and drop
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        console.log('Drag and drop listeners attached');
    }
    
    // Demo clause click
    if (demoClause) {
        demoClause.addEventListener('click', handleDemoAnalysis);
        console.log('Demo clause listener attached');
    }
    
    // Add click handler to choose file button
    const chooseButton = uploadArea?.querySelector('button');
    if (chooseButton) {
        chooseButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Choose file button clicked');
            if (fileInput) {
                fileInput.click();
            }
        });
    }
}

function handleFileInput(e) {
    console.log('=== FILE INPUT CHANGED ===');
    console.log('Event:', e);
    console.log('Files:', e.target.files);
    console.log('File count:', e.target.files.length);
    
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        console.log('Selected file:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });
        
        // Show immediate feedback
        showNotification(`File selected: ${file.name}`, 'success');
        
        // Validate file
        if (isValidFile(file)) {
            processSelectedFile(file);
        } else {
            showNotification('Invalid file type. Please select PDF, DOC, DOCX, or TXT files.', 'error');
            resetFileInput();
        }
    }
}

function isValidFile(file) {
    console.log('Validating file:', file.name, file.type);
    
    // Check file size (30MB limit)
    if (file.size > 30 * 1024 * 1024) {
        showNotification('File too large. Please select files under 30MB.', 'error');
        return false;
    }
    
    // Check file type by extension (more reliable than MIME type)
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    console.log('File validation:', {
        size: formatFileSize(file.size),
        extension: hasValidExtension,
        mimeType: file.type
    });
    
    return hasValidExtension;
}

function processSelectedFile(file) {
    console.log('Processing selected file:', file.name);
    
    // Update upload area to show selected file
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; color: #27ae60; margin-bottom: 1rem;">✅</div>
                <h3 style="color: #27ae60; margin-bottom: 0.5rem;">File Ready for Analysis</h3>
                <p style="margin-bottom: 0.5rem;"><strong>${file.name}</strong></p>
                <p style="color: #666; margin-bottom: 2rem;">Size: ${formatFileSize(file.size)}</p>
                
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button class="cta-button" onclick="startFileAnalysis()">
                        🔍 Analyze Contract
                    </button>
                    <button class="cta-button secondary" onclick="resetUploadArea()">
                        🔄 Choose Different File
                    </button>
                </div>
            </div>
        `;
        
        // Store file reference
        window.selectedContractFile = file;
    }
}

function startFileAnalysis() {
    console.log('Starting file analysis...');
    
    if (window.selectedContractFile) {
        const file = window.selectedContractFile;
        
        // Show loading state
        showLoadingState(`Analyzing ${file.name}...`);
        
        // For now, use demo analysis (replace with real backend later)
        setTimeout(() => {
            showDemoResults(file.name);
        }, 3000);
        
    } else {
        showNotification('No file selected. Please try again.', 'error');
        resetUploadArea();
    }
}

function resetUploadArea() {
    console.log('Resetting upload area...');
    
    // Clear stored file
    window.selectedContractFile = null;
    
    // Restore original upload UI
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.innerHTML = `
            <div id="uploadContent">
                <div class="upload-icon">📄</div>
                <h3>Drop your contract here</h3>
                <p>Supports PDF, Word, and text files up to 30 pages</p>
                <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.txt">
                <button class="cta-button" type="button">Choose File</button>
                
                <div class="or-divider">
                    <span>or</span>
                </div>
                
                <div class="paste-area">
                    <textarea id="contractText" placeholder="Paste your contract text here..." rows="6"></textarea>
                    <button class="cta-button" onclick="analyzeText()">Analyze Pasted Text</button>
                </div>
            </div>
        `;
        
        // Re-initialize after resetting
        setTimeout(() => {
            initializeFileUpload();
        }, 100);
    }
}

function resetFileInput() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }
}

function showLoadingState(message) {
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div class="spinner" style="width: 60px; height: 60px; border: 6px solid #e0e0e0; border-top: 6px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 2rem;"></div>
                <h3>${message}</h3>
                <p>This may take a few seconds...</p>
            </div>
        `;
    }
}

function showDemoResults(fileName) {
    console.log('Showing demo results for:', fileName);
    
    // Hide upload area
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.style.display = 'none';
    }
    
    // Show results section
    const resultsSection = document.getElementById('analysisResults');
    if (resultsSection) {
        // Update the results with file-specific info
        const summary = resultsSection.querySelector('h3');
        if (summary) {
            summary.textContent = `Analysis Complete - ${fileName}`;
        }
        
        resultsSection.style.display = 'block';
        
        // Animate progress bar
        setTimeout(() => {
            const progressFill = document.getElementById('progressFill');
            if (progressFill) {
                progressFill.style.width = '85%';
            }
        }, 500);
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        showNotification('Analysis complete! This is a demo - real AI analysis coming soon.', 'success');
    }
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    console.log('Drag over');
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    console.log('Drag leave');
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    console.log('=== FILE DROPPED ===');
    console.log('Files:', e.dataTransfer.files);
    
    e.currentTarget.classList.remove('dragover');
    
    if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        console.log('Dropped file:', file.name);
        
        showNotification(`File dropped: ${file.name}`, 'info');
        
        if (isValidFile(file)) {
            processSelectedFile(file);
        } else {
            showNotification('Invalid file type. Please drop PDF, DOC, DOCX, or TXT files.', 'error');
        }
    }
}

// Text analysis
function analyzeText() {
    console.log('Analyzing pasted text...');
    const textArea = document.getElementById('contractText');
    
    if (!textArea) {
        showNotification('Text area not found', 'error');
        return;
    }
    
    const text = textArea.value.trim();
    
    if (text.length < 50) {
        showNotification('Please enter at least 50 characters of contract text', 'error');
        return;
    }
    
    console.log('Text to analyze:', text.substring(0, 100) + '...');
    
    // Show loading
    showLoadingState('Analyzing your contract text...');
    
    // Demo analysis
    setTimeout(() => {
        showDemoResults('pasted contract text');
    }, 2500);
}

// Demo clause handler
function handleDemoAnalysis() {
    console.log('Demo clause clicked');
    showLoadingState('Analyzing demo contract clause...');
    
    setTimeout(() => {
        showDemoResults('demo termination clause');
    }, 2000);
}

// Utility functions
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

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    console.log('Contact form submitted:', data);
    showNotification('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
    e.target.reset();
}

// Notification system
function showNotification(message, type = 'info') {
    console.log('Notification:', message, type);
    
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1001;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
            break;
        default:
            notification.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
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

// Payment handling
function handlePayment(planType) {
    console.log('Payment initiated for:', planType);
    
    const plans = {
        'free': {
            name: 'Free Trial',
            price: 0,
            description: '1 free contract analysis'
        },
        'payperuse': {
            name: 'Pay Per Use',
            price: 9,
            description: 'Single contract analysis'
        },
        'business': {
            name: 'Business Plan',
            price: 49,
            description: 'Up to 20 contracts/month'
        },
        'expert-review': {
            name: 'Expert Review',
            price: 99,
            description: 'Human lawyer review'
        }
    };
    
    const selectedPlan = plans[planType];
    
    if (planType === 'free') {
        // For free plan,
