// ContractCoach JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const demoClause = document.getElementById('demoClause');

    // Drag & drop + file input
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileInput);
    demoClause.addEventListener('click', handleDemoAnalysis);

    // Smooth scrolling and typing effect
    initSmoothScrolling();
    initTypingEffect();

    // Initialize pricing, contact, mobile menu, scroll animations
    initPricingInteractions();
    initScrollAnimations();
    initMobileMenu();
    initContactForm();
});

// ===== File Handling =====

function handleDragOver(e) {
    e.preventDefault();
    e.target.closest('.upload-area').classList.add('dragover');
}

function handleDragLeave(e) {
    e.target.closest('.upload-area').classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.target.closest('.upload-area').classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (isValidFileType(file)) handleFileUpload(file);
        else showError('Please upload a valid file type (PDF, DOC, DOCX, or TXT)');
    }
}

function handleFileInput(e) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        if (isValidFileType(file)) handleFileUpload(file);
        else showError('Please upload a valid file type (PDF, DOC, DOCX, or TXT)');
    }
}

function isValidFileType(file) {
    const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    const fileName = file.name.toLowerCase();
    return validTypes.includes(file.type) ||
           fileName.endsWith('.pdf') || 
           fileName.endsWith('.doc') || 
           fileName.endsWith('.docx') || 
           fileName.endsWith('.txt');
}

// ===== Backend Integration =====

async function handleFileUpload(file) {
    if (file.size > 30 * 1024 * 1024) {
        showError('File too large. Please upload files under 30MB.');
        return;
    }

    const uploadContent = document.getElementById('uploadContent');
    const loadingAnimation = document.getElementById('loadingAnimation');
    const analysisResults = document.getElementById('analysisResults');

    if (uploadContent) uploadContent.style.display = 'none';
    if (loadingAnimation) loadingAnimation.style.display = 'block';
    const loadingText = loadingAnimation.querySelector('p');
    if (loadingText) loadingText.textContent = `Analyzing ${file.name}...`;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('https://YOUR_RENDER_BACKEND_URL/analyze', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (loadingAnimation) loadingAnimation.style.display = 'none';

        if (analysisResults) {
            analysisResults.style.display = 'block';
            analysisResults.innerHTML = `
                <h3>Contract Summary:</h3>
                <p>${result.summary}</p>
            `;
            analysisResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        showError('Failed to analyze file. Please try again later.');
        if (loadingAnimation) loadingAnimation.style.display = 'none';
    }
}

// ===== Demo Analysis =====

function handleDemoAnalysis() {
    showNotification('Running demo analysis...', 'info');

    // Optional: send sample TXT to backend
    const sampleText = new Blob(["This is a sample contract clause for demo analysis."], { type: "text/plain" });
    const demoFile = new File([sampleText], "demo.txt", { type: "text/plain" });

    handleFileUpload(demoFile);
}

// ===== Utilities =====

function showError(message) {
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
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 2rem;
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        border-radius: 8px;
        z-index: 3000;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===== Smooth scrolling =====

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        });
    });
}

// ===== Typing effect =====

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
        setTimeout(typeWriter, 1000);
    }
}

// ===== All other functions from your original script (pricing, payment, scroll animations, mobile menu, contact form, downloadReport) remain unchanged =====
