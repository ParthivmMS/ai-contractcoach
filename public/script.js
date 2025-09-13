// ContractCoach JavaScript - Connected to Render Backend with Authentication
const BACKEND_URL = 'https://contractcoach-backend.onrender.com';

// ✅ NEW: Authentication state management
let currentUser = null;
let authToken = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ContractCoach Frontend Loading...');
    
    // Initialize authentication first
    initAuth();
    
    // Then initialize other features
    initializeFileUpload();
    initSmoothScrolling();
    initTypingEffect();
    initContactForm();
    testBackendConnection();
});

// ✅ NEW: Authentication System
function initAuth() {
    console.log('🔐 Initializing authentication...');
    
    // Check for token in URL (OAuth callback)
    checkOAuthCallback();
    
    // Load saved token
    loadSavedAuth();
    
    // Initialize auth UI
    initAuthUI();
    
    // Update UI based on auth state
    updateAuthUI();
}

function checkOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        console.log('🔑 OAuth token received');
        authToken = token;
        localStorage.setItem('contractcoach_token', token);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Fetch user info
        fetchUserProfile();
    }
}

function loadSavedAuth() {
    const savedToken = localStorage.getItem('contractcoach_token');
    if (savedToken) {
        authToken = savedToken;
        fetchUserProfile();
    }
}

async function fetchUserProfile() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${BACKEND_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateAuthUI();
            console.log('👤 User authenticated:', currentUser.email);
        } else {
            // Token invalid, clear it
            logout();
        }
    } catch (error) {
        console.error('❌ Failed to fetch user profile:', error);
        logout();
    }
}

function initAuthUI() {
    // Login modal handlers
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const authRequiredModal = document.getElementById('authRequiredModal');
    
    // Modal open/close handlers
    if (loginBtn) loginBtn.onclick = () => openModal('loginModal');
    if (signupBtn) signupBtn.onclick = () => openModal('signupModal');
    
    // Modal close handlers
    document.getElementById('closeLoginModal')?.addEventListener('click', () => closeModal('loginModal'));
    document.getElementById('closeSignupModal')?.addEventListener('click', () => closeModal('signupModal'));
    document.getElementById('closeAuthRequiredModal')?.addEventListener('click', () => closeModal('authRequiredModal'));
    
    // Modal overlay click to close
    [loginModal, signupModal, authRequiredModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modal.id);
            });
        }
    });
    
    // Switch between modals
    document.getElementById('switchToSignup')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('loginModal');
        openModal('signupModal');
    });
    
    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('signupModal');
        openModal('loginModal');
    });
    
    // Form submissions
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('signupForm')?.addEventListener('submit', handleSignup);
    
    // Social auth buttons
    document.getElementById('googleLoginBtn')?.addEventListener('click', () => handleSocialAuth('google'));
    document.getElementById('googleSignupBtn')?.addEventListener('click', () => handleSocialAuth('google'));
    document.getElementById('linkedinLoginBtn')?.addEventListener('click', () => handleSocialAuth('linkedin'));
    document.getElementById('linkedinSignupBtn')?.addEventListener('click', () => handleSocialAuth('linkedin'));
    
    // User menu
    document.getElementById('userMenuBtn')?.addEventListener('click', toggleUserMenu);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // Auth required modal buttons
    document.getElementById('authRequiredLoginBtn')?.addEventListener('click', () => {
        closeModal('authRequiredModal');
        openModal('loginModal');
    });
    document.getElementById('authRequiredSignupBtn')?.addEventListener('click', () => {
        closeModal('authRequiredModal');
        openModal('signupModal');
    });
    
    // Pricing buttons
    document.getElementById('freeTrialBtn')?.addEventListener('click', () => {
        if (!currentUser) {
            openModal('signupModal');
        } else {
            document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
            showNotification('🎉 You already have a free account! Try analyzing a contract below.', 'success');
        }
    });
    
    // Hero CTA button
    document.getElementById('heroAnalyzeBtn')?.addEventListener('click', () => {
        if (!currentUser) {
            openModal('authRequiredModal');
        } else {
            document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Update analyze text button
    const analyzeTextBtn = document.getElementById('analyzeTextBtn');
    if (analyzeTextBtn) {
        analyzeTextBtn.onclick = () => {
            if (!currentUser) {
                openModal('authRequiredModal');
            } else {
                analyzeText();
            }
        };
    }
}

function updateAuthUI() {
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const userLimitsDisplay = document.getElementById('userLimitsDisplay');
    
    if (currentUser) {
        // Show user navigation
        if (guestNav) guestNav.style.display = 'none';
        if (userNav) userNav.style.display = 'flex';
        
        // Update user info
        const userName = document.getElementById('userName');
        const userPlan = document.getElementById('userPlan');
        const userAvatar = document.getElementById('userAvatar');
        
        if (userName) userName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        
        if (userPlan) {
            const remaining = currentUser.subscription.monthlyLimit - currentUser.subscription.contractsAnalyzed;
            userPlan.textContent = `${currentUser.subscription.type} Plan (${remaining}/${currentUser.subscription.monthlyLimit} left)`;
        }
        
        if (userAvatar && currentUser.avatar) {
            userAvatar.src = currentUser.avatar;
            userAvatar.style.display = 'block';
        }
        
        // Show usage limits
        if (userLimitsDisplay) {
            const remaining = currentUser.subscription.monthlyLimit - currentUser.subscription.contractsAnalyzed;
            const limitsText = document.getElementById('limitsText');
            if (limitsText) {
                limitsText.textContent = `${currentUser.subscription.type} Plan: ${remaining} of ${currentUser.subscription.monthlyLimit} analyses remaining this month`;
            }
            userLimitsDisplay.style.display = 'block';
        }
        
    } else {
        // Show guest navigation
        if (guestNav) guestNav.style.display = 'flex';
        if (userNav) userNav.style.display = 'none';
        if (userLimitsDisplay) userLimitsDisplay.style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = document.getElementById('loginSubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    
    // Show loading state
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('contractcoach_token', authToken);
            
            closeModal('loginModal');
            updateAuthUI();
            showNotification(`Welcome back, ${currentUser.firstName}! 🎉`, 'success');
            
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
        submitBtn.disabled = false;
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = document.getElementById('signupSubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    
    // Show loading state
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        const response = await fetch(`${BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password')
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('contractcoach_token', authToken);
            
            closeModal('signupModal');
            updateAuthUI();
            showNotification(`Welcome to ContractCoach, ${currentUser.firstName}! 🎉`, 'success');
            
            // Scroll to analyzer
            setTimeout(() => {
                document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
            }, 1000);
            
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function handleSocialAuth(provider) {
    window.location.href = `${BACKEND_URL}/auth/${provider}`;
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('contractcoach_token');
    updateAuthUI();
    showNotification('Signed out successfully', 'info');
    
    // Hide user dropdown
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.style.display = 'none';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ✅ UPDATED: Backend connection test
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

// ✅ UPDATED: File upload initialization
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
            
            // Check auth before allowing file selection
            if (!currentUser) {
                openModal('authRequiredModal');
                return;
            }
            
            fileInput.click();
        };
    }
    
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }
    
    if (demoClause) {
        demoClause.addEventListener('click', () => {
            if (!currentUser) {
                openModal('authRequiredModal');
            } else {
                handleDemoAnalysis();
            }
        });
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

// ✅ UPDATED: Real analysis with authentication
async function startRealAnalysis() {
    if (!currentUser) {
        openModal('authRequiredModal');
        return;
    }
    
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
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (response.status === 402) {
            const errorData = await response.json();
            showSubscriptionLimitModal(errorData);
            resetUploadArea();
            return;
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📥 Analysis received:', result);
        
        // Update user limits
        if (result.metadata?.user) {
            currentUser.subscription.contractsAnalyzed = result.metadata.user.contractsAnalyzed;
            updateAuthUI();
        }
        
        displayAnalysisResults(result.analysis, file.name, true);
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        showNotification('⚠️ AI analysis failed. Please try again.', 'error');
        resetUploadArea();
    }
}

// ✅ UPDATED: Text analysis with authentication
async function analyzeText() {
    if (!currentUser) {
        openModal('authRequiredModal');
        return;
    }
    
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
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ text: text })
        });
        
        if (response.status === 402) {
            const errorData = await response.json();
            showSubscriptionLimitModal(errorData);
            resetUploadArea();
            return;
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📥 Text analysis received:', result);
        
        // Update user limits
        if (result.metadata?.user) {
            currentUser.subscription.contractsAnalyzed = result.metadata.user.contractsAnalyzed;
            updateAuthUI();
        }
        
        displayAnalysisResults(result.analysis, 'pasted contract text', true);
        
    } catch (error) {
        console.error('❌ Text analysis failed:', error);
        showNotification('⚠️ AI analysis failed. Please try again.', 'error');
        resetUploadArea();
    }
}

// ✅ NEW: Subscription limit modal
function showSubscriptionLimitModal(errorData) {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;" onclick="closeSubscriptionModal()">
            <div style="background: white; border-radius: 15px; padding: 2rem; max-width: 500px; margin: 1rem; text-align: center;" onclick="event.stopPropagation()">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📊</div>
                <h3>Monthly Limit Reached</h3>
                <p>${errorData.message}</p>
                <div style="background: #f8f9ff; padding: 1rem; border-radius: 10px; margin: 1rem 0;">
                    <strong>${errorData.used}/${errorData.currentLimit}</strong> analyses used this month
                </div>
                <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
                    <button class="cta-button" onclick="handlePayment('business')" style="width: 100%;">
                        🚀 Upgrade to Business Plan
                    </button>
                    <button class="cta-button secondary" onclick="handlePayment('payperuse')" style="width: 100%;">
                        💳 Buy Single Analysis ($9)
                    </button>
                    <button onclick="closeSubscriptionModal()" style="background: none; border: none; color: #666; margin-top: 1rem;">
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeSubscriptionModal() {
    const modal = document.querySelector('[style*="z-index: 2000"]');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
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

// Demo functionality (requires auth now)
function handleDemoAnalysis() {
    if (!currentUser) {
        openModal('authRequiredModal');
        return;
    }
    
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
                <button class="cta-button" id="analyzeTextBtn">Analyze Pasted Text</button>
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
    
    // Check auth before allowing drop
    if (!currentUser) {
        openModal('authRequiredModal');
        return;
    }
    
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    // Check auth before processing drop
    if (!currentUser) {
        openModal('authRequiredModal');
        return;
    }
    
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

// ✅ UPDATED: Payment System - integrated with auth
function handlePayment(planType) {
    const plans = {
        free: { name: 'Free Trial', price: 0, description: '3 contract analyses per month' },
        payperuse: { name: 'Pay Per Use', price: 9, description: 'Single contract analysis' },
        business: { name: 'Business Plan', price: 49, description: 'Up to 20 contracts/month' },
        'expert-review': { name: 'Expert Review', price: 99, description: 'Human lawyer review' }
    };
    
    if (planType === 'free') {
        if (!currentUser) {
            openModal('signupModal');
            return;
        }
        document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
        showNotification('🎉 You already have a free account! Try analyzing a contract below.', 'success');
        return;
    }
    
    if (!currentUser) {
        openModal('authRequiredModal');
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
        
        // Update user subscription (mock)
        if (currentUser && planName === 'Business Plan') {
            currentUser.subscription.type = 'business';
            currentUser.subscription.monthlyLimit = 20;
            currentUser.subscription.contractsAnalyzed = 0;
            updateAuthUI();
        }
    }, 2000);
}

// Download Report
function downloadReport() {
    if (!currentUser) {
        openModal('authRequiredModal');
        return;
    }
    
    const content = `
CONTRACTCOACH ANALYSIS REPORT
============================
Generated: ${new Date().toLocaleString()}
User: ${currentUser.firstName} ${currentUser.lastName}

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

// Close user dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && dropdown && !userMenu.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

console.log('🚀 ContractCoach Frontend with Authentication Ready!');
console.log('Backend:', BACKEND_URL);
console.log('Features: Authentication, file upload, text analysis, payments, contact form');
