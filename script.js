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
