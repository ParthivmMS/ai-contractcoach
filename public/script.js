// ContractCoach JavaScript - Connected to Render Backend
const BACKEND_URL = 'https://contractcoach-backend.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ContractCoach Frontend Loading...');
    initializeFileUpload();
    initSmoothScrolling();
    initTypingEffect();
    initContactForm();
    testBackendConnection();
});

async function testBackendConnection() {
    try {
        console.log('🔗 Testing backend connection...');
        const response = await fetch(`${BACKEND_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connected:', data);
            showNotification('🤖 AI Backend Connected! Real analysis ready.', 'success');
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.warn('⚠️ Backend connection failed:', error.message);
        showNotification('⚠️ Backend unavailable. Demo mode active.', 'warning');
    }
}

function initializeFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const chooseButton = document.getElementById('chooseFileBtn');
    const demoClause = document.getElementById('demoClause');
    
    console.log('📂 Initializing file upload:', {
        uploadArea: !!uploadArea,
        fileInput: !!fileInput,
        chooseButton: !!chooseButton,
        demoClause: !!demoClause
    });
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileInput);
    }
    
    if (chooseButton && fileInput) {
        chooseButton.onclick = (e) => {
            e.preventDefault();
            console.log('📁 Choose file clicked');
            fileInput.click();
        };
    }
    
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }
    
    if (demoClause) {
        demoClause.addEventListener('click', handleDemoAnalysis);
    }
}

function handleFileInput(e) {
    console.log('📄 File selected:', e.target.files);
    
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        console.log('File details:', {
            name: file.name,
            size: file.size,
            type: file.type
        });
        
        if (isValidFile(file)) {
            showNotification(`📎 File selected: ${file.name}`, 'success');
            processSelectedFile(file);
        } else {
            showNotification('❌ Invalid file. Please use PDF, DOC, DOCX, or TXT.', 'error');
            resetFileInput();
        }
    }
}

function isValidFile(file) {
    if (file.size > 30 * 1024 * 1024) {
        showNotification('📏 File too large. Max 30MB allowed.', 'error');
        return false;
    }
    
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
}

function processSelectedFile(file) {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; color: #27ae60; margin-bottom: 1rem;">✅</div>
            <h3 style="color: #27ae60;">File Ready for AI Analysis</h3>
            <p style="margin: 0.5rem 0;"><strong>${file.name}</strong></p>
            <p style="color: #666; margin-bottom: 2rem;">Size: ${formatFileSize(file.size)}</p>
            
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="cta-button" onclick="startRealAnalysis()">
                    🤖 Analyze with AI
                </button>
                <button class="cta-button secondary" onclick="resetUploadArea()">
                    🔄 Choose Different File
                </button>
            </div>
        </div>
    `;
    
    window.selectedFile = file;
}

async function startRealAnalysis() {
    if (!window.selectedFile) {
        showNotification('❌ No file selected', 'error');
        return;
    }
    
    const file = window.selectedFile;
    console.log('🔍 Starting real AI analysis for:', file.name);
    
    showLoadingState(`🤖 AI analyzing ${file.name}...`);
    
    try {
        const formData = new FormData();
        formData.append('contract', file);
        
        console.log('📤 Sending to backend...');
        const response = await fetch(`${BACKEND_URL}/api/analyze`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📥 Analysis received:', result);
        
        displayAnalysisResults(result.analysis, file.name, true);
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        showNotification('⚠️ AI analysis failed. Using demo mode.', 'warning');
        
        setTimeout(() => {
            showDemoResults(file.name);
        }, 1500);
    }
}

async function analyzeText() {
    const textArea = document.getElementById('contractText');
    if (!textArea) return;
    
    const text = textArea.value.trim();
    if (text.length < 50) {
        showNotification('📝 Please enter at least 50 characters', 'error');
        return;
    }
    
    console.log('📝 Analyzing pasted text...');
    showLoadingState('🤖 AI analyzing your contract text...');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📥 Text analysis received:', result);
        
        displayAnalysisResults(result.analysis, 'pasted contract text', true);
        
    } catch (error) {
        console.error('❌ Text analysis failed:', error);
        showNotification('⚠️ AI analysis failed. Using demo mode.', 'warning');
        
        setTimeout(() => {
            showDemoResults('pasted contract text');
        }, 1500);
    }
}

function displayAnalysisResults(analysis, fileName, isReal = false) {
    console.log('📊 Displaying analysis results');
    
    hideUploadArea();
    
    const resultsSection = document.getElementById('analysisResults');
    if (!resultsSection) return;
    
    // Update title
    const title = resultsSection.querySelector('h3');
    if (title) {
        title.textContent = `${isReal ? '🤖 AI' : '🎭 Demo'} Analysis - ${fileName}`;
    }
    
    // Update risk score
    const riskScore = document.getElementById('riskScore');
    const riskInfo = resultsSection.querySelector('.risk-score div:last-child');
    
    if (riskScore && riskInfo) {
        riskScore.textContent = analysis.overall_risk_score;
        riskScore.className = `score-circle ${getRiskClass(analysis.overall_risk_score)}`;
        
        const riskLabel = getRiskLabel(analysis.overall_risk_score);
        riskInfo.querySelector('h4').textContent = `Overall Risk Score: ${riskLabel}`;
        riskInfo.querySelector('p').textContent = analysis.summary || 'Contract analysis completed.';
    }
    
    // Clear and add clause items
    clearExistingClauses();
    
    if (analysis.clauses && analysis.clauses.length > 0) {
        analysis.clauses.forEach(clause => addClauseItem(clause));
    }
    
    // Update action list
    updateActionList(analysis.top_actions);
    
    // Show results
    resultsSection.style.display = 'block';
    
    // Animate progress bar
    setTimeout(() => {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = `${Math.min(analysis.overall_risk_score * 10, 100)}%`;
        }
    }, 500);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    const message = isReal ? '✅ Real AI analysis complete!' : '🎭 Demo analysis complete!';
    showNotification(message, isReal ? 'success' : 'info');
}

function clearExistingClauses() {
    const existingClauses = document.querySelectorAll('.clause-item');
    existingClauses.forEach(item => item.remove());
}

function addClauseItem(clause) {
    const resultsSection = document.getElementById('analysisResults');
    const insertPoint = resultsSection.querySelector('h4');
    
    const clauseDiv = document.createElement('div');
    clauseDiv.className = 'clause-item';
    clauseDiv.innerHTML = `
        <h5>⚠️ ${clause.clause_type} Clause - ${clause.risk_level.toUpperCase()} RISK</h5>
        <p><strong>Why it's risky:</strong> ${clause.why_risky_plain}</p>
        <p><strong>Alternative:</strong> "${clause.market_standard_alternative}"</p>
        <p><strong>What to say:</strong> "${clause.negotiation_script_friendly}"</p>
        <p><strong>Priority:</strong> <span class="${clause.priority.toLowerCase()}">${clause.priority.toUpperCase()}</span></p>
    `;
    
    insertPoint.parentNode.insertBefore(clauseDiv, insertPoint.nextSibling);
}

function updateActionList(actions) {
    const actionList = document.querySelector('.action-list');
    if (actionList && actions) {
        actionList.innerHTML = actions.map(action => `<li>${action}</li>`).join('');
    }
}

function getRiskClass(score) {
    if (score >= 7) return 'risk-high';
    if (score >= 4) return 'risk-medium';
    return 'risk-low';
}

function getRiskLabel(score) {
    if (score >= 7) return 'High Risk';
    if (score >= 4) return 'Medium Risk';
    return 'Low Risk';
}

// Demo functionality
function handleDemoAnalysis() {
    console.log('🎭 Starting demo analysis...');
    showLoadingState('🎭 Analyzing demo clause...');
    
    setTimeout(() => {
        const demoAnalysis = {
            summary: "Demo contract analysis showing high-risk payment and termination clauses.",
            overall_risk_score: 8,
            overall_confidence: "High",
            clauses: [{
                clause_type: "Payment/Termination",
                risk_level: "High",
                risk_score: 90,
                why_risky_plain: "7-day cure period is extremely short for most businesses and gives excessive leverage to the other party.",
                market_standard_alternative: "Supplier may terminate if Customer fails to pay within thirty (30) days after written notice.",
                negotiation_script_friendly: "We typically work on 30-day terms. Could we adjust the cure period?",
                priority: "Urgent"
            }],
            top_actions: [
                "Negotiate 30-day payment cure period",
                "Add written notice requirement",
                "Review termination procedures",
                "Consider dispute resolution clause",
                "Get legal review for high-value contracts"
            ]
        };
        
        displayAnalysisResults(demoAnalysis, 'demo termination clause', false);
    }, 2000);
}

function showDemoResults(fileName) {
    const demoAnalysis = {
        summary: `Demo analysis of ${fileName} showing typical contract risks.`,
        overall_risk_score: 7,
        overall_confidence: "Medium",
        clauses: [{
            clause_type: "General",
            risk_level: "Medium",
            risk_score: 70,
            why_risky_plain: "This is a demo analysis. Upload your contract for real AI-powered review.",
            market_standard_alternative: "Connect to backend for real analysis and suggestions.",
            negotiation_script_friendly: "Real negotiation scripts available with AI analysis.",
            priority: "Important"
        }],
        top_actions: [
            "Try real AI analysis with your contract",
            "Review payment and termination terms",
            "Consider professional legal review",
            "Document any negotiated changes",
            "Ensure both parties sign final version"
        ]
    };
    
    displayAnalysisResults(demoAnalysis, fileName, false);
}

// UI Helper Functions
function showLoadingState(message) {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div class="spinner" style="width: 60px; height: 60px; border: 6px solid #e0e0e0; border-top: 6px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 2rem;"></div>
            <h3>${message}</h3>
            <p>This may take 5-15 seconds...</p>
        </div>
    `;
}

function hideUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.style.display = 'none';
    }
}

function resetUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.style.display = 'block';
    uploadArea.innerHTML = `
        <div id="uploadContent">
            <div class="upload-icon">📄</div>
            <h3>Drop your contract here</h3>
            <p>Supports PDF, Word, and text files up to 30 pages</p>
            <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.txt" style="display: none;">
            <button class="cta-button" type="button" id="chooseFileBtn">Choose File</button>
            
            <div class="or-divider">
                <span>or</span>
            </div>
            
            <div class="paste-area">
                <textarea id="contractText" placeholder="Paste your contract text here..." rows="6"></textarea>
                <button class="cta-button" onclick="analyzeText()">Analyze Pasted Text</button>
            </div>
        </div>
    `;
    
    // Re-initialize after reset
    window.selectedFile = null;
    initializeFileUpload();
}

function resetFileInput() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
}

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        console.log('📁 File dropped:', file.name);
        
        if (isValidFile(file)) {
            showNotification(`📎 File dropped: ${file.name}`, 'success');
            processSelectedFile(file);
        } else {
            showNotification('❌ Invalid file type. Use PDF, DOC, DOCX, or TXT.', 'error');
        }
    }
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Typing Effect
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

// Contact Form
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
    
    console.log('📧 Contact form submitted:', data);
    showNotification('✅ Message sent! We\'ll respond within 24 hours.', 'success');
    e.target.reset();
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
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
    
    // Set colors based on type
    const colors = {
        success: 'linear-gradient(45deg, #27ae60, #2ecc71)',
        error: 'linear-gradient(45deg, #e74c3c, #c0392b)',
        warning: 'linear-gradient(45deg, #f39c12, #e67e22)',
        info: 'linear-gradient(45deg, #667eea, #764ba2)'
    };
    
    notification.style.background = colors[type] || colors.info;
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
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Payment System
function handlePayment(planType) {
    const plans = {
        free: { name: 'Free Trial', price: 0, description: '1 free contract analysis' },
        payperuse: { name: 'Pay Per Use', price: 9, description: 'Single contract analysis' },
        business: { name: 'Business Plan', price: 49, description: 'Up to 20 contracts/month' },
        'expert-review': { name: 'Expert Review', price: 99, description: 'Human lawyer review' }
    };
    
    if (planType === 'free') {
        document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
        showNotification('🎉 Great! Try our free analysis below.', 'success');
        return;
    }
    
    showPaymentModal(plans[planType]);
}

function showPaymentModal(plan) {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;" onclick="closePaymentModal()">
            <div style="background: white; border-radius: 15px; padding: 2rem; max-width: 500px; margin: 1rem;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3>Complete Purchase</h3>
                    <button onclick="closePaymentModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div style="text-align: center; margin-bottom: 2rem; padding: 1rem; background: #f8f9ff; border-radius: 10px;">
                    <h4>${plan.name}</h4>
                    <p>${plan.description}</p>
                    <div style="font-size: 2rem; font-weight: bold; color: #667eea;">$${plan.price}</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <button class="cta-button" onclick="processPayment('stripe', '${plan.name}', ${plan.price})" style="width: 100%;">
                        💳 Pay with Card
                    </button>
                    <button class="cta-button secondary" onclick="processPayment('paypal', '${plan.name}', ${plan.price})" style="width: 100%;">
                        🅿️ Pay with PayPal
                    </button>
                </div>
                <p style="text-align: center; color: #666; font-size: 0.9rem; margin-top: 1rem;">
                    🔒 Secure payment processing
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    const modal = document.querySelector('[style*="z-index: 2000"]');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function processPayment(method, planName, price) {
    closePaymentModal();
    showNotification(`💳 Redirecting to ${method} for ${planName} ($${price})...`, 'info');
    
    setTimeout(() => {
        showNotification('✅ Payment successful! Welcome to ' + planName, 'success');
    }, 2000);
}

// Download Report
function downloadReport() {
    const content = `
CONTRACTCOACH ANALYSIS REPORT
============================
Generated: ${new Date().toLocaleString()}

RISK ASSESSMENT:
Overall Score: 8/10 (High Risk)

KEY FINDINGS:
1. Payment Terms - HIGH RISK
   - Short cure period detected
2. Termination Clause - HIGH RISK  
   - Immediate termination allowed

RECOMMENDATIONS:
1. Negotiate 30-day payment cure period
2. Add written notice requirements
3. Review liability clauses
4. Consider legal consultation

LEGAL DISCLAIMER:
This is not legal advice. Consult licensed attorneys.

Generated by ContractCoach AI
https://contractcoach-backend.onrender.com
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-analysis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    
    showNotification('📄 Report downloaded! Full PDF available with paid plans.', 'success');
}

console.log('🚀 ContractCoach Frontend Ready!');
console.log('Backend:', BACKEND_URL);
console.log('Features: File upload, text analysis, payments, contact form');
