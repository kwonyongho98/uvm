/* ============================================
   바라봄 - 알림 시스템
   알림 센터, 푸시 알림, 실시간 업데이트
   ============================================ */

'use strict';

// ============================================
// 전역 상태 관리
// ============================================

const NotificationManager = {
    permission: 'default',
    autoInterval: null,
    toastQueue: [],
    isShowingToast: false,
    settings: {
        medication: true,
        report: true,
        activity: true,
        startTime: '08:00',
        endTime: '22:00'
    }
};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * HTML 이스케이프 (XSS 방지)
 * @param {string} str - 이스케이프할 문자열
 * @returns {string} 이스케이프된 문자열
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * 안전한 모달 표시
 * @param {string} htmlString - 모달 HTML
 */
function showModal(htmlString) {
    try {
        const container = document.getElementById('modalContainer');
        if (!container) {
            console.error('모달 컨테이너를 찾을 수 없습니다');
            return;
        }
        container.innerHTML = htmlString;
        
        // 모달 외부 클릭시 포커스 트랩
        const modal = container.querySelector('.modal');
        if (modal) {
            trapFocus(modal);
            // ESC 키로 닫기
            document.addEventListener('keydown', handleModalEscape);
        }
    } catch (error) {
        console.error('모달 표시 오류:', error);
    }
}

/**
 * 모달 ESC 키 핸들러
 * @param {KeyboardEvent} e - 키보드 이벤트
 */
function handleModalEscape(e) {
    if (e.key === 'Escape') {
        closeNotificationModal();
        closeNotificationSettings();
    }
}

/**
 * 포커스 트랩 (접근성)
 * @param {HTMLElement} element - 포커스를 가둘 요소
 */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });

    // 첫 요소에 포커스
    if (firstElement) {
        setTimeout(() => firstElement.focus(), 100);
    }
}

// ============================================
// 알림 모달
// ============================================

/**
 * 알림 모달 열기
 */
function openNotificationModal() {
    try {
        const modal = createNotificationModal();
        showModal(modal);
    } catch (error) {
        console.error('알림 모달 열기 오류:', error);
        showToast('알림을 불러오는데 실패했습니다');
    }
}

/**
 * 알림 모달 생성
 * @returns {string} 모달 HTML
 */
function createNotificationModal() {
    const notifications = window.barabomData?.notificationData || [];
    const unreadCount = window.barabomData?.getUnreadNotificationCount() || 0;
    
    return `
        <div class="modal" id="notificationModal" role="dialog" aria-labelledby="notificationModalTitle" aria-modal="true">
            <div class="modal-overlay" onclick="closeNotificationModal()" aria-hidden="true"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="notificationModalTitle">🔔 알림</h3>
                    <button class="modal-close" 
                            onclick="closeNotificationModal()" 
                            aria-label="알림 닫기">×</button>
                </div>
                
                <div class="notification-actions">
                    ${unreadCount > 0 ? `
                        <button class="mark-all-read-btn" 
                                onclick="markAllAsRead()"
                                aria-label="모든 알림 읽음 표시">
                            모두 읽음 표시
                        </button>
                    ` : ''}
                </div>
                
                <div class="modal-body" style="padding: 0;">
                    ${notifications.length === 0 ? `
                        <div class="empty-notifications">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <p>새로운 알림이 없습니다</p>
                        </div>
                    ` : `
                        <div class="notification-list" role="list" aria-label="알림 목록">
                            ${notifications.map(notif => createNotificationItem(notif)).join('')}
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

/**
 * 알림 아이템 생성
 * @param {Object} notification - 알림 데이터
 * @returns {string} 알림 아이템 HTML
 */
function createNotificationItem(notification) {
    if (!notification) return '';
    
    const iconMap = {
        success: `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        `,
        medication: `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
        `,
        report: `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
        `,
        info: `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        `,
        warning: `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        `
    };
    
    const colorMap = {
        success: 'notification-success',
        medication: 'notification-medication',
        report: 'notification-report',
        info: 'notification-info',
        warning: 'notification-warning'
    };
    
    const icon = iconMap[notification.type] || iconMap.info;
    const colorClass = colorMap[notification.type] || colorMap.info;
    const readStatus = notification.read ? '읽음' : '읽지 않음';
    
    return `
        <div class="notification-item ${notification.read ? 'read' : 'unread'} ${colorClass}"
             onclick="handleNotificationClick(${notification.id})"
             role="listitem"
             aria-label="${escapeHtml(notification.message)}, ${readStatus}"
             tabindex="0"
             onkeydown="if(event.key==='Enter') handleNotificationClick(${notification.id})">
            <div class="notification-icon">
                ${icon}
            </div>
            <div class="notification-content">
                <p class="notification-message">${escapeHtml(notification.message)}</p>
                <p class="notification-time">${escapeHtml(notification.time || '')}</p>
            </div>
            ${!notification.read ? '<div class="notification-dot" aria-hidden="true"></div>' : ''}
        </div>
    `;
}

/**
 * 알림 클릭 처리
 * @param {number} notificationId - 알림 ID
 */
function handleNotificationClick(notificationId) {
    try {
        if (!window.barabomData) return;
        
        window.barabomData.markNotificationAsRead(notificationId);
        closeNotificationModal();
        
        // 해당 알림에 맞는 화면으로 이동
        const notification = window.barabomData.notificationData.find(n => n.id === notificationId);
        
        if (notification) {
            if (notification.type === 'medication') {
                if (window.barabomData.isProfessionalMode() && typeof openMedicationDetail === 'function') {
                    openMedicationDetail();
                }
            } else if (notification.type === 'report') {
                const homeBtn = document.querySelector('[data-screen="homeScreen"]');
                if (homeBtn && typeof switchScreen === 'function') {
                    switchScreen(homeBtn);
                }
            }
        }
    } catch (error) {
        console.error('알림 클릭 처리 오류:', error);
    }
}

/**
 * 모두 읽음 처리
 */
function markAllAsRead() {
    try {
        if (!window.barabomData) return;
        
        window.barabomData.markAllNotificationsAsRead();
        closeNotificationModal();
        showToast('모든 알림을 읽음 처리했습니다');
    } catch (error) {
        console.error('모두 읽음 처리 오류:', error);
        showToast('처리 중 오류가 발생했습니다');
    }
}

/**
 * 알림 모달 닫기
 */
function closeNotificationModal() {
    try {
        const modal = document.getElementById('notificationModal');
        if (modal) {
            modal.remove();
        }
        document.removeEventListener('keydown', handleModalEscape);
    } catch (error) {
        console.error('알림 모달 닫기 오류:', error);
    }
}

// ============================================
// 브라우저 푸시 알림
// ============================================

/**
 * 알림 권한 요청
 * @returns {Promise<string>} 권한 상태
 */
async function requestNotificationPermission() {
    try {
        if (!('Notification' in window)) {
            showToast('이 브라우저는 알림을 지원하지 않습니다');
            return 'denied';
        }
        
        if (Notification.permission === 'granted') {
            NotificationManager.permission = 'granted';
            showToast('알림이 이미 활성화되어 있습니다');
            return 'granted';
        }
        
        if (Notification.permission === 'denied') {
            showToast('알림이 차단되었습니다. 브라우저 설정에서 허용해주세요');
            return 'denied';
        }
        
        const permission = await Notification.requestPermission();
        NotificationManager.permission = permission;
        
        if (permission === 'granted') {
            showToast('알림이 활성화되었습니다 🔔');
        } else {
            showToast('알림 권한이 거부되었습니다');
        }
        
        return permission;
    } catch (error) {
        console.error('알림 권한 요청 오류:', error);
        return 'denied';
    }
}

/**
 * 브라우저 푸시 알림 표시
 * @param {string} title - 알림 제목
 * @param {Object} options - 알림 옵션
 */
function showPushNotification(title, options = {}) {
    try {
        if (!('Notification' in window)) {
            return;
        }
        
        if (Notification.permission !== 'granted') {
            return;
        }
        
        // 알림 시간 체크
        if (!isWithinNotificationTime()) {
            return;
        }
        
        const notification = new Notification(title, {
            body: options.body || '',
            icon: options.icon || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200',
            badge: options.badge || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=100',
            tag: options.tag || 'barabom-notification',
            requireInteraction: options.requireInteraction || false,
            silent: options.silent || false,
            ...options
        });
        
        notification.onclick = function(event) {
            event.preventDefault();
            window.focus();
            notification.close();
            
            if (options.onClick && typeof options.onClick === 'function') {
                options.onClick();
            }
        };
        
        notification.onerror = function(error) {
            console.error('푸시 알림 오류:', error);
        };
        
        // 5초 후 자동 닫기
        setTimeout(() => {
            try {
                notification.close();
            } catch (e) {
                // 이미 닫힌 경우 무시
            }
        }, 5000);
    } catch (error) {
        console.error('푸시 알림 표시 오류:', error);
    }
}

/**
 * 알림 시간 범위 내인지 확인
 * @returns {boolean} 알림 가능 시간 여부
 */
function isWithinNotificationTime() {
    try {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startHour, startMin] = NotificationManager.settings.startTime.split(':').map(Number);
        const [endHour, endMin] = NotificationManager.settings.endTime.split(':').map(Number);
        
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        
        return currentTime >= startTime && currentTime <= endTime;
    } catch (error) {
        console.error('알림 시간 확인 오류:', error);
        return true; // 오류 시 항상 허용
    }
}

// ============================================
// 토스트 알림
// ============================================

/**
 * 토스트 알림 표시
 * @param {string} message - 표시할 메시지
 * @param {number} duration - 표시 시간 (ms)
 */
function showToast(message, duration = 2000) {
    if (!message) return;
    
    NotificationManager.toastQueue.push({ message, duration });
    
    if (!NotificationManager.isShowingToast) {
        showNextToast();
    }
}

/**
 * 다음 토스트 표시
 */
function showNextToast() {
    if (NotificationManager.toastQueue.length === 0) {
        NotificationManager.isShowingToast = false;
        return;
    }
    
    NotificationManager.isShowingToast = true;
    const { message, duration } = NotificationManager.toastQueue.shift();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(toast);
    
    // 애니메이션 시작
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });
    
    // 지정된 시간 후 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            try {
                if (toast.parentNode) {
                    toast.remove();
                }
            } catch (e) {
                // 무시
            }
            showNextToast();
        }, 300);
    }, duration);
}

// ============================================
// 알림 필터링
// ============================================

/**
 * 알림 필터링
 * @param {string} type - 필터 타입
 * @returns {Array} 필터링된 알림 배열
 */
function filterNotifications(type) {
    try {
        const notifications = window.barabomData?.notificationData || [];
        
        if (type === 'all') {
            return notifications;
        }
        
        return notifications.filter(n => n.type === type);
    } catch (error) {
        console.error('알림 필터링 오류:', error);
        return [];
    }
}

// ============================================
// 알림 설정
// ============================================

/**
 * 알림 설정 모달 열기
 */
function openNotificationSettings() {
    try {
        const modal = createNotificationSettingsModal();
        showModal(modal);
    } catch (error) {
        console.error('알림 설정 열기 오류:', error);
        showToast('설정을 불러오는데 실패했습니다');
    }
}

/**
 * 알림 설정 모달 생성
 * @returns {string} 모달 HTML
 */
function createNotificationSettingsModal() {
    const permissionStatus = NotificationManager.permission === 'granted' ? '✓ 활성화됨' : '활성화';
    
    return `
        <div class="modal" id="notificationSettingsModal" role="dialog" aria-labelledby="settingsModalTitle" aria-modal="true">
            <div class="modal-overlay" onclick="closeNotificationSettings()" aria-hidden="true"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="settingsModalTitle">⚙️ 알림 설정</h3>
                    <button class="modal-close" 
                            onclick="closeNotificationSettings()"
                            aria-label="설정 닫기">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="settings-section">
                        <h4 class="settings-section-title">푸시 알림</h4>
                        <div class="settings-item">
                            <div class="settings-item-info">
                                <p class="settings-item-title">브라우저 알림</p>
                                <p class="settings-item-desc">앱이 닫혀있을 때도 알림을 받습니다</p>
                            </div>
                            <button class="btn-enable-push" 
                                    onclick="requestNotificationPermission()"
                                    aria-label="브라우저 알림 활성화">
                                ${permissionStatus}
                            </button>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h4 class="settings-section-title">알림 유형</h4>
                        <label class="settings-toggle">
                            <input type="checkbox" id="notifMedication" ${NotificationManager.settings.medication ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <div class="toggle-label">
                                <span>💊 투약 알림</span>
                                <small>투약 시간 및 완료 알림</small>
                            </div>
                        </label>
                        
                        <label class="settings-toggle">
                            <input type="checkbox" id="notifReport" ${NotificationManager.settings.report ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <div class="toggle-label">
                                <span>📝 일지 알림</span>
                                <small>전문가가 작성한 일지</small>
                            </div>
                        </label>
                        
                        <label class="settings-toggle">
                            <input type="checkbox" id="notifActivity" ${NotificationManager.settings.activity ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <div class="toggle-label">
                                <span>🎾 활동 알림</span>
                                <small>가족 구성원의 새 기록</small>
                            </div>
                        </label>
                    </div>
                    
                    <div class="settings-section">
                        <h4 class="settings-section-title">알림 시간</h4>
                        <div class="time-range-setting">
                            <label>
                                <span>시작 시간</span>
                                <input type="time" 
                                       id="notifStartTime" 
                                       value="${NotificationManager.settings.startTime}" 
                                       class="input-field"
                                       aria-label="알림 시작 시간">
                            </label>
                            <label>
                                <span>종료 시간</span>
                                <input type="time" 
                                       id="notifEndTime" 
                                       value="${NotificationManager.settings.endTime}" 
                                       class="input-field"
                                       aria-label="알림 종료 시간">
                            </label>
                        </div>
                        <p class="settings-hint">이 시간 외에는 알림을 받지 않습니다</p>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeNotificationSettings()">취소</button>
                    <button class="btn-primary" onclick="saveNotificationSettings()">저장</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * 알림 설정 저장
 */
function saveNotificationSettings() {
    try {
        // 설정 값 읽기
        const medicationChecked = document.getElementById('notifMedication')?.checked ?? true;
        const reportChecked = document.getElementById('notifReport')?.checked ?? true;
        const activityChecked = document.getElementById('notifActivity')?.checked ?? true;
        const startTime = document.getElementById('notifStartTime')?.value || '08:00';
        const endTime = document.getElementById('notifEndTime')?.value || '22:00';
        
        // 설정 업데이트
        NotificationManager.settings = {
            medication: medicationChecked,
            report: reportChecked,
            activity: activityChecked,
            startTime,
            endTime
        };
        
        // 로컬 스토리지에 저장
        try {
            localStorage.setItem('barabom_notification_settings', JSON.stringify(NotificationManager.settings));
        } catch (e) {
            console.error('설정 저장 실패:', e);
        }
        
        showToast('알림 설정이 저장되었습니다');
        closeNotificationSettings();
    } catch (error) {
        console.error('설정 저장 오류:', error);
        showToast('설정 저장에 실패했습니다');
    }
}

/**
 * 알림 설정 불러오기
 */
function loadNotificationSettings() {
    try {
        const savedSettings = localStorage.getItem('barabom_notification_settings');
        if (savedSettings) {
            NotificationManager.settings = {
                ...NotificationManager.settings,
                ...JSON.parse(savedSettings)
            };
        }
    } catch (error) {
        console.error('설정 불러오기 오류:', error);
    }
}

/**
 * 알림 설정 닫기
 */
function closeNotificationSettings() {
    try {
        const modal = document.getElementById('notificationSettingsModal');
        if (modal) {
            modal.remove();
        }
        document.removeEventListener('keydown', handleModalEscape);
    } catch (error) {
        console.error('설정 닫기 오류:', error);
    }
}

// ============================================
// 자동 알림 (데모용)
// ============================================

/**
 * 자동 알림 시작 (개발/테스트용)
 */
function startAutoNotifications() {
    if (NotificationManager.autoInterval) return;
    
    NotificationManager.autoInterval = setInterval(() => {
        try {
            if (!window.barabomData) return;
            
            const random = Math.random();
            
            if (random < 0.3 && NotificationManager.settings.medication) {
                window.barabomData.addNotification({
                    message: '초코의 투약 시간이 다가오고 있습니다 💊',
                    type: 'medication'
                });
                
                showPushNotification('바라봄 알림', {
                    body: '초코의 투약 시간이 다가오고 있습니다',
                    tag: 'medication-reminder'
                });
            } else if (random < 0.6 && NotificationManager.settings.report) {
                window.barabomData.addNotification({
                    message: '개린이집에서 새 일지를 작성했습니다',
                    type: 'report'
                });
            } else if (NotificationManager.settings.activity) {
                window.barabomData.addNotification({
                    message: '김엄마님이 새 기록을 추가했습니다',
                    type: 'info'
                });
            }
            
            if (window.barabomData.updateNotificationBadge) {
                window.barabomData.updateNotificationBadge();
            }
        } catch (error) {
            console.error('자동 알림 오류:', error);
        }
    }, 60000); // 1분마다
}

/**
 * 자동 알림 중지
 */
function stopAutoNotifications() {
    if (NotificationManager.autoInterval) {
        clearInterval(NotificationManager.autoInterval);
        NotificationManager.autoInterval = null;
    }
}

// ============================================
// 초기화 및 정리
// ============================================

/**
 * 초기화 함수
 */
function initNotificationSystem() {
    try {
        // 설정 불러오기
        loadNotificationSettings();
        
        // 알림 배지 초기화
        if (window.barabomData?.updateNotificationBadge) {
            window.barabomData.updateNotificationBadge();
        }
        
        // 알림 권한 확인
        if ('Notification' in window) {
            NotificationManager.permission = Notification.permission;
        }
        
        // 스타일 추가
        addNotificationStyles();
        
        console.log('알림 시스템 초기화 완료');
    } catch (error) {
        console.error('알림 시스템 초기화 오류:', error);
    }
}

/**
 * 정리 함수 (메모리 누수 방지)
 */
function cleanupNotificationSystem() {
    stopAutoNotifications();
    document.removeEventListener('keydown', handleModalEscape);
    NotificationManager.toastQueue = [];
    NotificationManager.isShowingToast = false;
}

// 페이지 언로드 시 정리
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanupNotificationSystem);
}

// DOMContentLoaded 이벤트
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initNotificationSystem);
}

// ============================================
// 스타일 추가
// ============================================

function addNotificationStyles() {
    // 이미 추가되었는지 확인
    if (document.getElementById('notificationStyles')) return;
    
    const notificationStyles = document.createElement('style');
    notificationStyles.id = 'notificationStyles';
    notificationStyles.textContent = `
    .notification-actions {
        padding: 0.75rem 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        text-align: right;
    }
    
    .mark-all-read-btn {
        background: none;
        border: none;
        color: #3b82f6;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: color 0.2s;
    }
    
    .mark-all-read-btn:hover {
        color: #2563eb;
    }
    
    .empty-notifications {
        text-align: center;
        padding: 4rem 2rem;
        color: #6b7280;
    }
    
    .empty-notifications svg {
        color: #d1d5db;
        margin: 0 auto 1rem;
    }
    
    .notification-list {
        max-height: 60vh;
        overflow-y: auto;
    }
    
    .notification-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #f3f4f6;
        cursor: pointer;
        position: relative;
        transition: all 0.2s;
    }
    
    .notification-item:hover,
    .notification-item:focus {
        background: #f9fafb;
        outline: none;
    }
    
    .notification-item.unread {
        background: #eff6ff;
    }
    
    .notification-item.read {
        opacity: 0.7;
    }
    
    .notification-icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-success .notification-icon {
        background: #d1fae5;
        color: #065f46;
    }
    
    .notification-medication .notification-icon {
        background: #fed7aa;
        color: #c2410c;
    }
    
    .notification-report .notification-icon {
        background: #dbeafe;
        color: #1e40af;
    }
    
    .notification-info .notification-icon {
        background: #e5e7eb;
        color: #374151;
    }
    
    .notification-warning .notification-icon {
        background: #fef3c7;
        color: #92400e;
    }
    
    .notification-content {
        flex: 1;
        min-width: 0;
    }
    
    .notification-message {
        font-size: 0.875rem;
        color: #111827;
        margin-bottom: 0.25rem;
        word-break: break-word;
    }
    
    .notification-time {
        font-size: 0.75rem;
        color: #6b7280;
    }
    
    .notification-dot {
        position: absolute;
        top: 50%;
        right: 1rem;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        background: #3b82f6;
        border-radius: 50%;
        animation: notifPulse 2s infinite;
    }
    
    @keyframes notifPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    .toast-notification {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(17, 24, 39, 0.95);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease-out;
        white-space: nowrap;
        max-width: 90%;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
    }
    
    .toast-notification.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    
    .settings-section {
        margin-bottom: 1.5rem;
    }
    
    .settings-section-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .settings-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 0.5rem;
    }
    
    .settings-item-info {
        flex: 1;
        min-width: 0;
    }
    
    .settings-item-title {
        font-weight: 600;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
    }
    
    .settings-item-desc {
        font-size: 0.75rem;
        color: #6b7280;
    }
    
    .btn-enable-push {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
        white-space: nowrap;
    }
    
    .btn-enable-push:hover {
        background: #2563eb;
    }
    
    .settings-toggle {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 0.5rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .settings-toggle:hover {
        background: #f3f4f6;
    }
    
    .settings-toggle input[type="checkbox"] {
        display: none;
    }
    
    .toggle-slider {
        width: 48px;
        height: 28px;
        background: #d1d5db;
        border-radius: 14px;
        position: relative;
        transition: all 0.3s;
        flex-shrink: 0;
    }
    
    .toggle-slider::after {
        content: '';
        position: absolute;
        width: 24px;
        height: 24px;
        background: white;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        transition: all 0.3s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .settings-toggle input:checked + .toggle-slider {
        background: #3b82f6;
    }
    
    .settings-toggle input:checked + .toggle-slider::after {
        left: 22px;
    }
    
    .toggle-label {
        flex: 1;
        min-width: 0;
    }
    
    .toggle-label span {
        font-size: 0.875rem;
        font-weight: 600;
        display: block;
        margin-bottom: 0.25rem;
    }
    
    .toggle-label small {
        font-size: 0.75rem;
        color: #6b7280;
    }
    
    .time-range-setting {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }
    
    .time-range-setting label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .time-range-setting span {
        font-size: 0.875rem;
        font-weight: 600;
    }
    
    .settings-hint {
        font-size: 0.75rem;
        color: #6b7280;
        margin-top: 0.5rem;
    }
    `;
    document.head.appendChild(notificationStyles);
}
