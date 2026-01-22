/* ============================================
   리펫 - 인증 시스템
   스플래시, 로그인, 회원가입
   ============================================ */

'use strict';

// ============================================
// 전역 상태 관리
// ============================================

const AuthManager = {
    isLoggedIn: false,
    currentUser: null,
    splashDuration: 2000
};

// ============================================
// 스플래시 화면
// ============================================

/**
 * 스플래시 화면 표시
 */
function showSplashScreen() {
    const splashHtml = `
        <div class="splash-screen" id="splashScreen">
            <div class="splash-content">
                <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&h=200&fit=crop" 
                     class="splash-logo" 
                     alt="리펫 로고"
                     onerror="this.style.display='none'">
                <h1 class="splash-title">리펫</h1>
                <p class="splash-subtitle">가족과 함께 보는 우리 아이</p>
                <div class="splash-loader">
                    <div class="loader-dot"></div>
                    <div class="loader-dot"></div>
                    <div class="loader-dot"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', splashHtml);
    
    // 스플래시 후 로그인 체크
    setTimeout(() => {
        hideSplashScreen();
        checkLoginStatus();
    }, AuthManager.splashDuration);
}

/**
 * 스플래시 화면 숨기기
 */
function hideSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.remove();
        }, 500);
    }
}

// ============================================
// 로그인 상태 확인
// ============================================

/**
 * 로그인 상태 확인
 */
function checkLoginStatus() {
    try {
        const savedUser = localStorage.getItem('repet_user');
        
        if (savedUser) {
            AuthManager.currentUser = JSON.parse(savedUser);
            AuthManager.isLoggedIn = true;
            showMainApp();
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('로그인 상태 확인 오류:', error);
        showLoginScreen();
    }
}

/**
 * 메인 앱 표시
 */
function showMainApp() {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.style.display = 'block';
        
        // 앱 초기화
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    }
}

/**
 * 메인 앱 숨기기
 */
function hideMainApp() {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.style.display = 'none';
    }
}

// ============================================
// 로그인 화면
// ============================================

/**
 * 로그인 화면 표시
 */
function showLoginScreen() {
    hideMainApp();
    
    const loginHtml = `
        <div class="auth-screen" id="authScreen">
            <div class="auth-container">
                <div class="auth-header">
                    <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=120&h=120&fit=crop" 
                         class="auth-logo" 
                         alt="리펫 로고"
                         onerror="this.style.display='none'">
                    <h1 class="auth-title">리펫</h1>
                    <p class="auth-subtitle">가족과 함께 보는 우리 아이의 일상</p>
                </div>
                
                <div class="auth-form" id="loginForm">
                    <div class="form-group">
                        <input type="email" 
                               id="loginEmail" 
                               class="auth-input" 
                               placeholder="이메일"
                               autocomplete="email">
                    </div>
                    
                    <div class="form-group">
                        <input type="password" 
                               id="loginPassword" 
                               class="auth-input" 
                               placeholder="비밀번호"
                               autocomplete="current-password"
                               onkeydown="if(event.key==='Enter') handleLogin()">
                    </div>
                    
                    <button class="auth-btn auth-btn-primary" onclick="handleLogin()">
                        로그인
                    </button>
                    
                    <div class="auth-divider">
                        <span>또는</span>
                    </div>
                    
                    <button class="auth-btn auth-btn-kakao" onclick="handleKakaoLogin()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.9 1.88 5.45 4.68 7.01L5.5 21.5l4.25-2.54C10.47 19.31 11.22 19.5 12 19.5c5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
                        </svg>
                        카카오톡으로 시작하기
                    </button>
                    
                    <button class="auth-btn auth-btn-naver" onclick="handleNaverLogin()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
                        </svg>
                        네이버로 시작하기
                    </button>
                    
                    <button class="auth-btn auth-btn-google" onclick="handleGoogleLogin()">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google로 시작하기
                    </button>
                    
                    <div class="auth-links">
                        <a href="#" onclick="showSignupScreen(); return false;">회원가입</a>
                        <span>•</span>
                        <a href="#" onclick="showToast('준비 중입니다'); return false;">비밀번호 찾기</a>
                    </div>
                    
                    <div class="auth-demo">
                        <p>데모 계정으로 둘러보기</p>
                        <button class="demo-btn" onclick="handleDemoLogin()">
                            체험하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loginHtml);
}

/**
 * 로그인 화면 숨기기
 */
function hideLoginScreen() {
    const authScreen = document.getElementById('authScreen');
    if (authScreen) {
        authScreen.classList.add('fade-out');
        setTimeout(() => {
            authScreen.remove();
        }, 500);
    }
}

// ============================================
// 로그인 처리
// ============================================

/**
 * 일반 로그인 처리
 */
function handleLogin() {
    try {
        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;
        
        if (!email) {
            showToast('이메일을 입력해주세요');
            return;
        }
        
        if (!password) {
            showToast('비밀번호를 입력해주세요');
            return;
        }
        
        // 데모용 검증
        if (email === 'demo@repet.com' && password === 'demo1234') {
            loginSuccess({
                email: email,
                name: '김철수',
                provider: 'email'
            });
        } else {
            showToast('이메일 또는 비밀번호가 올바르지 않습니다');
        }
    } catch (error) {
        console.error('로그인 처리 오류:', error);
        showToast('로그인에 실패했습니다');
    }
}

/**
 * 카카오 로그인
 */
function handleKakaoLogin() {
    showToast('카카오 로그인 연동 중...');
    
    // 데모용 - 실제로는 Kakao SDK 사용
    setTimeout(() => {
        loginSuccess({
            email: 'user@kakao.com',
            name: '카카오사용자',
            provider: 'kakao'
        });
    }, 1500);
}

/**
 * 네이버 로그인
 */
function handleNaverLogin() {
    showToast('네이버 로그인 연동 중...');
    
    // 데모용 - 실제로는 Naver SDK 사용
    setTimeout(() => {
        loginSuccess({
            email: 'user@naver.com',
            name: '네이버사용자',
            provider: 'naver'
        });
    }, 1500);
}

/**
 * Google 로그인
 */
function handleGoogleLogin() {
    showToast('Google 로그인 연동 중...');
    
    // 데모용 - 실제로는 Google SDK 사용
    setTimeout(() => {
        loginSuccess({
            email: 'user@gmail.com',
            name: 'Google사용자',
            provider: 'google'
        });
    }, 1500);
}

/**
 * 데모 로그인
 */
function handleDemoLogin() {
    loginSuccess({
        email: 'demo@repet.com',
        name: '체험사용자',
        provider: 'demo'
    });
}

/**
 * 로그인 성공 처리
 */
function loginSuccess(user) {
    try {
        AuthManager.currentUser = user;
        AuthManager.isLoggedIn = true;
        
        // 로컬 스토리지에 저장
        localStorage.setItem('repet_user', JSON.stringify(user));
        
        // 로그인 화면 숨기기
        hideLoginScreen();
        
        // 메인 앱 표시
        showMainApp();
        
        showToast(`환영합니다, ${user.name}님! 🎉`);
    } catch (error) {
        console.error('로그인 성공 처리 오류:', error);
    }
}

// ============================================
// 로그아웃
// ============================================

/**
 * 로그아웃
 */
function handleLogout() {
    if (!confirm('로그아웃 하시겠습니까?')) {
        return;
    }
    
    try {
        AuthManager.currentUser = null;
        AuthManager.isLoggedIn = false;
        
        localStorage.removeItem('repet_user');
        
        hideMainApp();
        showLoginScreen();
        
        showToast('로그아웃 되었습니다');
    } catch (error) {
        console.error('로그아웃 오류:', error);
    }
}

// ============================================
// 회원가입 화면
// ============================================

/**
 * 회원가입 화면 표시
 */
function showSignupScreen() {
    const authScreen = document.getElementById('authScreen');
    if (!authScreen) return;
    
    const signupHtml = `
        <div class="auth-container">
            <div class="auth-header">
                <button class="back-btn" onclick="showLoginScreen(); document.getElementById('authScreen').remove();">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <h1 class="auth-title">회원가입</h1>
                <p class="auth-subtitle">리펫과 함께 시작해보세요</p>
            </div>
            
            <div class="auth-form">
                <div class="form-group">
                    <input type="text" 
                           id="signupName" 
                           class="auth-input" 
                           placeholder="이름"
                           autocomplete="name">
                </div>
                
                <div class="form-group">
                    <input type="email" 
                           id="signupEmail" 
                           class="auth-input" 
                           placeholder="이메일"
                           autocomplete="email">
                </div>
                
                <div class="form-group">
                    <input type="password" 
                           id="signupPassword" 
                           class="auth-input" 
                           placeholder="비밀번호 (8자 이상)"
                           autocomplete="new-password">
                </div>
                
                <div class="form-group">
                    <input type="password" 
                           id="signupPasswordConfirm" 
                           class="auth-input" 
                           placeholder="비밀번호 확인"
                           autocomplete="new-password"
                           onkeydown="if(event.key==='Enter') handleSignup()">
                </div>
                
                <label class="checkbox-label">
                    <input type="checkbox" id="agreeTerms">
                    <span>이용약관 및 개인정보처리방침에 동의합니다</span>
                </label>
                
                <button class="auth-btn auth-btn-primary" onclick="handleSignup()">
                    가입하기
                </button>
            </div>
        </div>
    `;
    
    authScreen.innerHTML = signupHtml;
}

/**
 * 회원가입 처리
 */
function handleSignup() {
    try {
        const name = document.getElementById('signupName')?.value.trim();
        const email = document.getElementById('signupEmail')?.value.trim();
        const password = document.getElementById('signupPassword')?.value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm')?.value;
        const agreeTerms = document.getElementById('agreeTerms')?.checked;
        
        if (!name) {
            showToast('이름을 입력해주세요');
            return;
        }
        
        if (!email) {
            showToast('이메일을 입력해주세요');
            return;
        }
        
        if (!password || password.length < 8) {
            showToast('비밀번호는 8자 이상이어야 합니다');
            return;
        }
        
        if (password !== passwordConfirm) {
            showToast('비밀번호가 일치하지 않습니다');
            return;
        }
        
        if (!agreeTerms) {
            showToast('이용약관에 동의해주세요');
            return;
        }
        
        // 회원가입 성공
        showToast('회원가입이 완료되었습니다! 🎉');
        
        setTimeout(() => {
            loginSuccess({
                email: email,
                name: name,
                provider: 'email'
            });
        }, 1000);
    } catch (error) {
        console.error('회원가입 처리 오류:', error);
        showToast('회원가입에 실패했습니다');
    }
}

// ============================================
// 초기화
// ============================================

// DOMContentLoaded 이벤트에서 스플래시 표시
if (typeof document !== 'undefined') {
    // 기존 DOMContentLoaded 이벤트 제거하고 새로 등록
    window.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 리펫 앱 시작');
        
        // 메인 앱 숨기기
        hideMainApp();
        
        // 데이터 로드
        if (window.barabomData?.loadFromLocalStorage) {
            window.barabomData.loadFromLocalStorage();
        }
        
        // 스플래시 화면 표시
        showSplashScreen();
    });
}

// ============================================
// 전역 API 노출
// ============================================

if (typeof window !== 'undefined') {
    window.AuthManager = {
        isLoggedIn: () => AuthManager.isLoggedIn,
        getCurrentUser: () => AuthManager.currentUser,
        logout: handleLogout
    };
}

// ============================================
// 스타일 추가
// ============================================

function addAuthStyles() {
    if (document.getElementById('authStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'authStyles';
    styles.textContent = `
    .splash-screen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: fadeIn 0.5s ease-in-out;
    }
    
    .splash-screen.fade-out {
        animation: fadeOut 0.5s ease-in-out forwards;
    }
    
    .splash-content {
        text-align: center;
        color: white;
    }
    
    .splash-logo {
        width: 120px;
        height: 120px;
        border-radius: 30px;
        margin-bottom: 2rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    .splash-title {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .splash-subtitle {
        font-size: 1.125rem;
        opacity: 0.9;
        margin-bottom: 3rem;
    }
    
    .splash-loader {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }
    
    .loader-dot {
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out both;
    }
    
    .loader-dot:nth-child(1) {
        animation-delay: -0.32s;
    }
    
    .loader-dot:nth-child(2) {
        animation-delay: -0.16s;
    }
    
    @keyframes bounce {
        0%, 80%, 100% { 
            transform: scale(0);
            opacity: 0.5;
        } 
        40% { 
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .auth-screen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99998;
        animation: fadeIn 0.5s ease-in-out;
        overflow-y: auto;
        padding: 1rem;
    }
    
    .auth-screen.fade-out {
        animation: fadeOut 0.5s ease-in-out forwards;
    }
    
    .auth-container {
        background: white;
        border-radius: 2rem;
        padding: 2rem;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    }
    
    .auth-header {
        text-align: center;
        margin-bottom: 2rem;
        position: relative;
    }
    
    .back-btn {
        position: absolute;
        left: 0;
        top: 0;
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 0.5rem;
        transition: all 0.2s;
    }
    
    .back-btn:hover {
        color: #111827;
        transform: translateX(-4px);
    }
    
    .auth-logo {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        margin-bottom: 1rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
    
    .auth-title {
        font-size: 2rem;
        font-weight: 800;
        background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 0.5rem;
    }
    
    .auth-subtitle {
        font-size: 0.875rem;
        color: #6b7280;
    }
    
    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .auth-input {
        width: 100%;
        padding: 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        transition: all 0.2s;
    }
    
    .auth-input:focus {
        outline: none;
        border-color: #ff6b35;
        box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
    }
    
    .auth-btn {
        width: 100%;
        padding: 1rem;
        border: none;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .auth-btn-primary {
        background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
        color: white;
    }
    
    .auth-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
    }
    
    .auth-btn-kakao {
        background: #FEE500;
        color: #000000;
    }
    
    .auth-btn-naver {
        background: #03C75A;
        color: white;
    }
    
    .auth-btn-google {
        background: white;
        color: #3c4043;
        border: 1px solid #dadce0;
    }
    
    .auth-btn:hover {
        transform: translateY(-2px);
    }
    
    .auth-btn:active {
        transform: translateY(0);
    }
    
    .auth-divider {
        display: flex;
        align-items: center;
        text-align: center;
        margin: 1rem 0;
    }
    
    .auth-divider::before,
    .auth-divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .auth-divider span {
        padding: 0 1rem;
        font-size: 0.875rem;
        color: #6b7280;
    }
    
    .auth-links {
        display: flex;
        justify-content: center;
        gap: 0.75rem;
        margin-top: 1rem;
        font-size: 0.875rem;
    }
    
    .auth-links a {
        color: #6b7280;
        text-decoration: none;
        transition: color 0.2s;
    }
    
    .auth-links a:hover {
        color: #ff6b35;
    }
    
    .auth-links span {
        color: #d1d5db;
    }
    
    .auth-demo {
        text-align: center;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e7eb;
    }
    
    .auth-demo p {
        font-size: 0.75rem;
        color: #6b7280;
        margin-bottom: 0.75rem;
    }
    
    .demo-btn {
        background: #f3f4f6;
        color: #374151;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .demo-btn:hover {
        background: #e5e7eb;
        transform: translateY(-2px);
    }
    
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #4b5563;
        cursor: pointer;
    }
    
    .checkbox-label input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @media (max-width: 480px) {
        .auth-container {
            border-radius: 1rem;
            padding: 1.5rem;
        }
        
        .splash-title {
            font-size: 2.5rem;
        }
        
        .auth-title {
            font-size: 1.75rem;
        }
    }
    `;
    
    document.head.appendChild(styles);
}

if (typeof document !== 'undefined') {
    addAuthStyles();
}
