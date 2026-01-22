/* ============================================
   리펫 - 가족 단톡방 + AI 멍멍이 속마음
   실시간 채팅, AI 자동 메시지 생성
   ============================================ */

'use strict';

// ============================================
// 전역 상태 관리
// ============================================

const FamilyChatManager = {
    messages: [],
    aiMessageQueue: [],
    isAITyping: false,
    lastActivityCheck: null
};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * HTML 이스케이프 (XSS 방지)
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * 시간 포맷팅
 */
function formatChatTime(date) {
    const now = new Date();
    const messageDate = new Date(date);
    
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return messageDate.toLocaleDateString('ko-KR', { 
        month: 'long', 
        day: 'numeric' 
    });
}

// ============================================
// 초기 메시지 데이터
// ============================================

/**
 * 초기 채팅 메시지 로드
 */
function loadInitialMessages() {
    const savedMessages = localStorage.getItem('repet_family_chat');
    
    if (savedMessages) {
        try {
            FamilyChatManager.messages = JSON.parse(savedMessages);
        } catch (error) {
            console.error('메시지 로드 오류:', error);
            FamilyChatManager.messages = getDefaultMessages();
        }
    } else {
        FamilyChatManager.messages = getDefaultMessages();
    }
    
    return FamilyChatManager.messages;
}

/**
 * 기본 메시지 생성
 */
function getDefaultMessages() {
    const pet = window.barabomData?.familyData?.pets?.[0];
    const petName = pet ? pet.name : '초코';
    
    return [
        {
            id: 1,
            type: 'family',
            author: '김엄마',
            avatar: '👩',
            content: '오늘 아침 사료 잘 먹었어요!',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: true
        },
        {
            id: 2,
            type: 'ai',
            author: petName,
            avatar: '🐶',
            content: '엄마~ 완밥했개! 맛있었어! 다음엔 간식도 주면 안될까? 🤤',
            timestamp: new Date(Date.now() - 7000000).toISOString(),
            read: true,
            relatedActivity: 'meal'
        },
        {
            id: 3,
            type: 'family',
            author: '김아빠',
            avatar: '👨',
            content: '저녁에 한강공원 산책 갈게요',
            timestamp: new Date(Date.now() - 5400000).toISOString(),
            read: true
        },
        {
            id: 4,
            type: 'ai',
            author: petName,
            avatar: '🐶',
            content: '아빠! 산책이라고!? 꼬리가 저절로 흔들려~ 빨리 갈까? 킁킁 🐕',
            timestamp: new Date(Date.now() - 5300000).toISOString(),
            read: true,
            relatedActivity: 'walk'
        },
        {
            id: 5,
            type: 'professional',
            author: '개린이집 반포점',
            avatar: '🏫',
            content: '오늘 사회성 교육 시간에 친구들과 잘 놀았어요! 리더십이 보이네요 🎉',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: true
        },
        {
            id: 6,
            type: 'ai',
            author: petName,
            avatar: '🐶',
            content: '친구들이랑 뛰놀다가 기절했개.. 너무 재밌었어! 근데 코 고는 건 비밀이야 💤',
            timestamp: new Date(Date.now() - 3500000).toISOString(),
            read: true,
            relatedActivity: 'daycare'
        }
    ];
}

/**
 * 메시지 저장
 */
function saveMessages() {
    try {
        localStorage.setItem('repet_family_chat', JSON.stringify(FamilyChatManager.messages));
    } catch (error) {
        console.error('메시지 저장 오류:', error);
    }
}

// ============================================
// AI 메시지 생성
// ============================================

/**
 * 활동에 따른 AI 메시지 생성
 */
function generateAIMessage(activity) {
    const pet = window.barabomData?.familyData?.pets?.[0];
    const petName = pet ? pet.name : '초코';
    
    const messageTemplates = {
        meal: [
            '완밥했개! 맛있었어! 다음엔 간식도 주면 안될까? 🤤',
            '냠냠~ 오늘 밥 정말 맛있었어! 더 먹고 싶은데.. 🍚',
            '밥 다 먹었어! 이제 산책 갈 시간 아니야? 킁킁 🐕',
            '맛있게 먹었개! 엄마/아빠 요리 최고야! 😋',
            '사료 완료! 물도 많이 마셨어. 건강하게 자랄게! 💪'
        ],
        walk: [
            '산책 최고였어! 친구들도 많이 만나고~ 킁킁 🐾',
            '아빠/엄마 오늘 산책 감사해! 냄새 많이 맡아서 행복해 🌳',
            '산책하면서 새 친구도 사귀었어! 다음에 또 가자! 🐕',
            '바깥 공기 마시니까 기분 좋아! 꼬리가 안 멈춰 🎾',
            '30분 산책했개! 운동도 하고 스트레스도 풀고~ 완벽! ✨'
        ],
        play: [
            '공놀이 정말 재밌었어! 다시 하고 싶어! 🎾',
            '놀아줘서 고마워! 이렇게 행복한데 어떡해~ 🥰',
            '오늘 진짜 신났개! 에너지 다 썼어! 😴',
            '같이 놀 때가 제일 좋아! 내일도 놀아줘! 🎉',
            '장난감이랑 실컷 놀았어! 이제 좀 쉬어야겠다 💤'
        ],
        medication: [
            '약 쓴데.. 간식 줘서 참았다! 얼른 나을게 💊',
            '약 먹었어! 쓴 맛 때문에 인상 찌푸렸지만 괜찮아! 😤',
            '건강해지려고 약 잘 먹었개! 칭찬해줘! 🌟',
            '약이 쓰긴 했지만.. 엄마/아빠가 주니까 먹었어! 💕',
            '약 먹고 물 많이 마셨어! 빨리 나아서 같이 놀자! 🏃'
        ],
        health: [
            '병원 다녀왔어! 선생님이 건강하대! 👍',
            '주사 맞았는데.. 용감했지? 간식 좀 줘! 🦴',
            '건강검진 받았어! 모든 게 정상이래! 😊',
            '병원은 무섭지만.. 건강을 위해 참았어! 💪',
            '검사 다 받았어! 이제 집에 가고 싶어 🏠'
        ],
        daycare: [
            '유치원에서 친구들이랑 잘 놀았어! 🐕',
            '오늘 선생님한테 칭찬받았개! 자랑스럽지? ✨',
            '친구들이랑 뛰놀다가 낮잠 잤어! 꿀잠이었어 💤',
            '유치원 재밌어! 친구도 많고 선생님도 좋아! 🎉',
            '교육 시간에 집중했어! 똑똑한 강아지가 되는 중! 🧠'
        ],
        grooming: [
            '미용하고 왔어! 어때? 멋있지? ✨',
            '목욕했더니 뽀송뽀송! 냄새도 좋아졌어 🛁',
            '털 깎았어! 시원해졌는데.. 좀 춥기도 해 😅',
            '미용사 선생님이 예쁘게 만들어줬어! 🎀',
            '깔끔해진 기분! 이제 사진 찍어줘! 📸'
        ]
    };
    
    const messages = messageTemplates[activity.type] || messageTemplates.play;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return {
        id: Date.now(),
        type: 'ai',
        author: petName,
        avatar: '🐶',
        content: randomMessage,
        timestamp: new Date().toISOString(),
        read: false,
        relatedActivity: activity.type
    };
}

/**
 * AI 메시지 자동 전송 (활동 기록 시)
 */
function sendAIMessageForActivity(activity) {
    try {
        // AI 메시지 생성
        const aiMessage = generateAIMessage(activity);
        
        // 1-3초 랜덤 딜레이 후 전송 (타이핑 효과)
        const delay = Math.random() * 2000 + 1000;
        
        setTimeout(() => {
            FamilyChatManager.messages.push(aiMessage);
            saveMessages();
            updateChatPreview();
            
            // 알림 전송
            if (window.barabomData?.addNotification) {
                window.barabomData.addNotification({
                    message: `${aiMessage.author}가 메시지를 보냈어요: ${aiMessage.content.substring(0, 30)}...`,
                    type: 'info'
                });
            }
            
            // 푸시 알림 (브라우저)
            if (typeof showPushNotification === 'function') {
                showPushNotification(`${aiMessage.author}의 속마음`, {
                    body: aiMessage.content,
                    tag: 'ai-message'
                });
            }
        }, delay);
        
    } catch (error) {
        console.error('AI 메시지 전송 오류:', error);
    }
}

// ============================================
// 채팅 미리보기 업데이트
// ============================================

/**
 * 홈 화면 채팅 미리보기 업데이트
 */
function updateChatPreview() {
    try {
        const preview = document.getElementById('aiMessagePreview');
        if (!preview) return;
        
        const messages = FamilyChatManager.messages;
        if (messages.length === 0) return;
        
        // 가장 최근 AI 메시지 찾기
        const lastAIMessage = messages
            .filter(m => m.type === 'ai')
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        
        if (lastAIMessage) {
            preview.textContent = lastAIMessage.content;
            preview.classList.add('bounce-in');
            setTimeout(() => preview.classList.remove('bounce-in'), 500);
        }
        
    } catch (error) {
        console.error('채팅 미리보기 업데이트 오류:', error);
    }
}

// ============================================
// 가족 단톡방 모달
// ============================================

/**
 * 가족 단톡방 열기
 */
function openAIChatModal() {
    try {
        const modal = createFamilyChatModal();
        showModal(modal);
        
        // 스크롤을 최하단으로
        setTimeout(() => {
            scrollToBottom();
            markAllMessagesAsRead();
        }, 100);
        
    } catch (error) {
        console.error('채팅 모달 열기 오류:', error);
        showToast('채팅을 열 수 없습니다');
    }
}

/**
 * 가족 단톡방 모달 HTML 생성
 */
function createFamilyChatModal() {
    const pet = window.barabomData?.familyData?.pets?.[0];
    const petName = pet ? pet.name : '초코';
    const members = window.barabomData?.familyData?.members || [];
    const memberCount = members.length + 1; // +1 for AI
    
    return `
        <div class="modal chat-modal" id="familyChatModal" role="dialog" aria-labelledby="chatModalTitle" aria-modal="true">
            <div class="modal-overlay" onclick="closeFamilyChat()" aria-hidden="true"></div>
            <div class="modal-content chat-content">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <h3 id="chatModalTitle">${escapeHtml(petName)} 가족방</h3>
                        <p class="chat-member-count">${memberCount}명</p>
                    </div>
                    <button class="modal-close" 
                            onclick="closeFamilyChat()"
                            aria-label="채팅 닫기">×</button>
                </div>
                
                <div class="chat-messages" id="chatMessages" role="log" aria-live="polite">
                    ${renderChatMessages()}
                </div>
                
                <div class="chat-input-container">
                    <button class="chat-attach-btn" 
                            onclick="attachPhoto()"
                            aria-label="사진 첨부">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </button>
                    <input type="text" 
                           class="chat-input" 
                           id="chatInput"
                           placeholder="메시지를 입력하세요..."
                           maxlength="500"
                           onkeypress="handleChatKeyPress(event)">
                    <button class="chat-send-btn" 
                            onclick="sendChatMessage()"
                            aria-label="메시지 전송">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * 채팅 메시지 렌더링
 */
function renderChatMessages() {
    const messages = FamilyChatManager.messages;
    
    if (messages.length === 0) {
        return `
            <div class="chat-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>아직 메시지가 없습니다</p>
                <p class="chat-empty-subtitle">첫 메시지를 보내보세요!</p>
            </div>
        `;
    }
    
    // 날짜별로 그룹화
    const groupedMessages = groupMessagesByDate(messages);
    
    let html = '';
    
    Object.keys(groupedMessages).forEach(dateKey => {
        // 날짜 구분선
        html += `<div class="chat-date-divider">${dateKey}</div>`;
        
        // 해당 날짜의 메시지들
        groupedMessages[dateKey].forEach(message => {
            html += renderSingleMessage(message);
        });
    });
    
    return html;
}

/**
 * 날짜별 메시지 그룹화
 */
function groupMessagesByDate(messages) {
    const grouped = {};
    
    messages.forEach(message => {
        const date = new Date(message.timestamp);
        const dateKey = getDateKey(date);
        
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        
        grouped[dateKey].push(message);
    });
    
    return grouped;
}

/**
 * 날짜 키 생성
 */
function getDateKey(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(date, today)) {
        return '오늘';
    } else if (isSameDay(date, yesterday)) {
        return '어제';
    } else {
        return date.toLocaleDateString('ko-KR', { 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

/**
 * 같은 날인지 확인
 */
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

/**
 * 단일 메시지 렌더링
 */
function renderSingleMessage(message) {
    const currentUser = window.AuthManager?.getCurrentUser?.();
    const isMyMessage = currentUser && message.author === currentUser.name;
    const isAI = message.type === 'ai';
    const isProfessional = message.type === 'professional';
    
    const messageClass = isMyMessage ? 'chat-message mine' : 'chat-message';
    const time = new Date(message.timestamp).toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    return `
        <div class="${messageClass} ${isAI ? 'ai-message' : ''} ${isProfessional ? 'professional-message' : ''}" 
             data-message-id="${message.id}">
            ${!isMyMessage ? `
                <div class="message-avatar" aria-hidden="true">${escapeHtml(message.avatar)}</div>
            ` : ''}
            <div class="message-content-wrapper">
                ${!isMyMessage ? `
                    <div class="message-author">
                        ${escapeHtml(message.author)}
                        ${isAI ? '<span class="ai-badge-small">AI</span>' : ''}
                        ${isProfessional ? '<span class="pro-badge-small">전문가</span>' : ''}
                    </div>
                ` : ''}
                <div class="message-bubble">
                    <p class="message-text">${escapeHtml(message.content)}</p>
                    ${message.photo ? `
                        <img src="${escapeHtml(message.photo)}" class="message-photo" alt="첨부 사진">
                    ` : ''}
                </div>
                <div class="message-time">${time}</div>
            </div>
        </div>
    `;
}

/**
 * 스크롤을 최하단으로
 */
function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

/**
 * 모든 메시지 읽음 처리
 */
function markAllMessagesAsRead() {
    FamilyChatManager.messages.forEach(m => m.read = true);
    saveMessages();
}

// ============================================
// 메시지 전송
// ============================================

/**
 * 채팅 메시지 전송
 */
function sendChatMessage() {
    try {
        const input = document.getElementById('chatInput');
        if (!input) return;
        
        const content = input.value.trim();
        if (!content) return;
        
        const currentUser = window.AuthManager?.getCurrentUser?.();
        if (!currentUser) {
            showToast('로그인이 필요합니다');
            return;
        }
        
        // 새 메시지 생성
        const newMessage = {
            id: Date.now(),
            type: 'family',
            author: currentUser.name,
            avatar: currentUser.avatar || '👤',
            content: content,
            timestamp: new Date().toISOString(),
            read: true
        };
        
        // 메시지 추가
        FamilyChatManager.messages.push(newMessage);
        saveMessages();
        
        // UI 업데이트
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = renderChatMessages();
            scrollToBottom();
        }
        
        // 입력창 초기화
        input.value = '';
        
        // AI 자동 응답 (20% 확률)
        if (Math.random() < 0.2) {
            setTimeout(() => {
                sendRandomAIResponse();
            }, 2000 + Math.random() * 2000);
        }
        
    } catch (error) {
        console.error('메시지 전송 오류:', error);
        showToast('메시지 전송에 실패했습니다');
    }
}

/**
 * 랜덤 AI 응답 전송
 */
function sendRandomAIResponse() {
    const pet = window.barabomData?.familyData?.pets?.[0];
    const petName = pet ? pet.name : '초코';
    
    const randomResponses = [
        '그래그래! 나도 그렇게 생각해! 🐶',
        '킁킁~ 무슨 냄새 안 나? 배고파졌어 🤤',
        '나도 같이 가고 싶어! 데려가줘! 🐕',
        '엄마/아빠 최고야! 사랑해! ❤️',
        '오늘 날씨 좋네! 산책 갈까? 🌤️',
        '간식 시간 아니야? 배고프개! 🦴',
        '이제 낮잠 자야겠다.. 졸려 💤',
        '같이 놀아줘! 심심해! 🎾',
        '꼬리가 저절로 흔들려! 신나! ✨',
        '오늘 하루 재미있었어! 고마워! 🥰'
    ];
    
    const randomContent = randomResponses[Math.floor(Math.random() * randomResponses.length)];
    
    const aiMessage = {
        id: Date.now(),
        type: 'ai',
        author: petName,
        avatar: '🐶',
        content: randomContent,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    FamilyChatManager.messages.push(aiMessage);
    saveMessages();
    
    // UI 업데이트
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML = renderChatMessages();
        scrollToBottom();
    }
    
    updateChatPreview();
}

/**
 * Enter 키 처리
 */
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

/**
 * 사진 첨부 (데모)
 */
function attachPhoto() {
    showToast('사진 첨부 기능은 곧 추가됩니다 📷');
}

/**
 * 채팅 모달 닫기
 */
function closeFamilyChat() {
    try {
        const modal = document.getElementById('familyChatModal');
        if (modal) {
            modal.remove();
        }
    } catch (error) {
        console.error('채팅 닫기 오류:', error);
    }
}

// ============================================
// 초기화
// ============================================

/**
 * 채팅 시스템 초기화
 */
function initChatSystem() {
    try {
        console.log('💬 채팅 시스템 초기화 중...');
        
        // 메시지 로드
        loadInitialMessages();
        
        // 미리보기 업데이트
        updateChatPreview();
        
        // 스타일 추가
        addChatStyles();
        
        console.log('✅ 채팅 시스템 초기화 완료');
    } catch (error) {
        console.error('채팅 시스템 초기화 오류:', error);
    }
}

// ============================================
// 페이지 로드 시 초기화
// ============================================

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initChatSystem);
}

// ============================================
// 전역 API 노출
// ============================================

if (typeof window !== 'undefined') {
    window.FamilyChat = {
        open: openAIChatModal,
        close: closeFamilyChat,
        sendMessage: sendChatMessage,
        sendAIMessageForActivity,
        updatePreview: updateChatPreview
    };
}

// ============================================
// 스타일 추가
// ============================================

function addChatStyles() {
    if (document.getElementById('chatStyles')) return;
    
    const chatStyles = document.createElement('style');
    chatStyles.id = 'chatStyles';
    chatStyles.textContent = `
    /* AI 채팅 섹션 */
    .ai-chat-section,
    .peer-report-section {
        background: white;
        border-radius: 1rem;
        padding: 1rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }
    
    .ai-badge {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 0.625rem;
        padding: 4px 8px;
        border-radius: 10px;
        font-weight: 600;
    }
    
    .ai-chat-preview {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .ai-chat-preview:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .ai-message-preview {
        flex: 1;
        font-size: 0.875rem;
        color: #4a5568;
        line-height: 1.5;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    
    .ai-message-preview.bounce-in {
        animation: bounceIn 0.5s ease-out;
    }
    
    @keyframes bounceIn {
        0% { transform: scale(0.95); opacity: 0; }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); opacity: 1; }
    }
    
    .chat-open-btn {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: white;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        color: #ff6b35;
    }
    
    .chat-open-btn:hover {
        transform: scale(1.1);
        background: #ff6b35;
        color: white;
    }
    
    /* 채팅 모달 */
    .chat-modal .modal-content {
        max-width: 100%;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
        margin: 0;
    }
    
    .chat-content {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    
    .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
        color: white;
        flex-shrink: 0;
    }
    
    .chat-header-info h3 {
        font-size: 1.125rem;
        font-weight: 700;
        margin-bottom: 0.125rem;
    }
    
    .chat-member-count {
        font-size: 0.75rem;
        opacity: 0.9;
    }
    
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        background: #f9fafb;
    }
    
    .chat-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #9ca3af;
        text-align: center;
        padding: 2rem;
    }
    
    .chat-empty svg {
        margin-bottom: 1rem;
        color: #d1d5db;
    }
    
    .chat-empty-subtitle {
        font-size: 0.875rem;
        margin-top: 0.5rem;
    }
    
    .chat-date-divider {
        text-align: center;
        margin: 1.5rem 0;
        position: relative;
    }
    
    .chat-date-divider::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: #e5e7eb;
        z-index: 0;
    }
    
    .chat-date-divider::after {
        content: attr(data-date);
        position: relative;
        background: #f9fafb;
        padding: 0 1rem;
        font-size: 0.75rem;
        color: #9ca3af;
        z-index: 1;
    }
    
    .chat-message {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1rem;
        animation: messageSlideIn 0.3s ease-out;
    }
    
    @keyframes messageSlideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .chat-message.mine {
        flex-direction: row-reverse;
    }
    
    .message-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        flex-shrink: 0;
    }
    
    .chat-message.ai-message .message-avatar {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .chat-message.professional-message .message-avatar {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    
    .message-content-wrapper {
        max-width: 70%;
    }
    
    .chat-message.mine .message-content-wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }
    
    .message-author {
        font-size: 0.75rem;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .ai-badge-small {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 0.625rem;
        padding: 2px 6px;
        border-radius: 8px;
        font-weight: 600;
    }
    
    .pro-badge-small {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
        font-size: 0.625rem;
        padding: 2px 6px;
        border-radius: 8px;
        font-weight: 600;
    }
    
    .message-bubble {
        background: white;
        padding: 0.75rem 1rem;
        border-radius: 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .chat-message.mine .message-bubble {
        background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
        color: white;
    }
    
    .chat-message.ai-message .message-bubble {
        background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
        border: 2px solid #fdcb6e;
    }
    
    .message-text {
        font-size: 0.875rem;
        line-height: 1.5;
        word-break: break-word;
    }
    
    .message-photo {
        width: 100%;
        max-width: 200px;
        border-radius: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .message-time {
        font-size: 0.625rem;
        color: #9ca3af;
        margin-top: 0.25rem;
    }
    
    .chat-message.mine .message-time {
        text-align: right;
    }
    
    .chat-input-container {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        border-top: 1px solid #e5e7eb;
        background: white;
        flex-shrink: 0;
    }
    
    .chat-attach-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f3f4f6;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        color: #6b7280;
        flex-shrink: 0;
    }
    
    .chat-attach-btn:hover {
        background: #e5e7eb;
        transform: scale(1.05);
    }
    
    .chat-input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 1.5rem;
        font-size: 0.875rem;
        outline: none;
        transition: all 0.2s;
    }
    
    .chat-input:focus {
        border-color: #ff6b35;
        box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
    }
    
    .chat-send-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        color: white;
        flex-shrink: 0;
    }
    
    .chat-send-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    }
    
    .chat-send-btn:active {
        transform: scale(0.95);
    }
    
    /* 반응형 */
    @media (max-width: 480px) {
        .message-content-wrapper {
            max-width: 80%;
        }
    }
    `;
    
    document.head.appendChild(chatStyles);
}
