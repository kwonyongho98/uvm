/* ============================================
   바라봄 - 전문가 대시보드
   전문가 모드 전용 기능
   ============================================ */

'use strict';

// ============================================
// 상태 관리
// ============================================

const ProfessionalManager = {
    selectedCategory: 'report',
    reportPhotos: []
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
 * 시간 파싱 함수
 */
function parseTime(timeStr) {
    try {
        if (!timeStr) return 0;
        if (timeStr === '방금 전') return Date.now();
        
        const match = timeStr.match(/(\d+):(\d+)/);
        if (match) {
            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            return hours * 60 + minutes;
        }
        
        return 0;
    } catch (error) {
        console.error('시간 파싱 오류:', error);
        return 0;
    }
}

// ============================================
// 전문가 대시보드
// ============================================

/**
 * 전문가 대시보드 렌더링
 */
function renderProfessionalDashboard() {
    try {
        if (!window.barabomData?.isProfessionalMode()) {
            return;
        }
        
        updateProfessionalStats();
        renderMedicationQueue();
        renderTodaySchedule();
    } catch (error) {
        console.error('전문가 대시보드 렌더링 오류:', error);
    }
}

/**
 * 전문가 통계 업데이트
 */
function updateProfessionalStats() {
    try {
        const stats = window.barabomData?.professionalStats;
        const pendingCount = window.barabomData?.getPendingMedications?.().length || 0;
        
        if (!stats) return;
        
        const elements = {
            todayCheckins: stats.todayCheckins || 0,
            pendingTasks: pendingCount,
            completedToday: stats.completedToday || 0,
            totalPets: stats.totalPets || 0
        };
        
        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
    } catch (error) {
        console.error('통계 업데이트 오류:', error);
    }
}

// ============================================
// 투약 대기 목록
// ============================================

/**
 * 투약 대기 목록 렌더링
 */
function renderMedicationQueue() {
    try {
        const pendingMeds = window.barabomData?.getPendingMedications?.() || [];
        const container = document.getElementById('medicationQueueList');
        
        if (!container) return;
        
        if (pendingMeds.length === 0) {
            container.innerHTML = `
                <div class="empty-queue">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <p>대기중인 투약이 없습니다</p>
                    <p class="empty-subtitle">모든 투약이 완료되었습니다 ✓</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = pendingMeds.map(med => createMedicationQueueItem(med)).join('');
    } catch (error) {
        console.error('투약 대기 목록 렌더링 오류:', error);
    }
}

/**
 * 투약 대기 아이템 HTML 생성
 */
function createMedicationQueueItem(med) {
    if (!med) return '';
    
    const medJsonSafe = escapeHtml(JSON.stringify(med));
    
    return `
        <div class="queue-item ${med.priority === 'high' ? 'priority-high' : ''}" 
             onclick="handleMedicationQueueClick(${med.id})"
             role="button"
             tabindex="0"
             aria-label="${escapeHtml(med.petName)}의 ${escapeHtml(med.medicationName)} 투약"
             onkeydown="if(event.key==='Enter') handleMedicationQueueClick(${med.id})">
            <div class="queue-header">
                <div class="queue-pet">
                    <img src="${escapeHtml(med.petPhoto)}" 
                         alt="${escapeHtml(med.petName)}">
                    <div>
                        <h4>${escapeHtml(med.petName)}</h4>
                        <p>${escapeHtml(med.requestedBy)} 보호자님</p>
                    </div>
                </div>
                ${med.priority === 'high' ? '<span class="priority-badge" role="status">긴급</span>' : ''}
            </div>
            <div class="queue-info">
                <div class="queue-time">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${escapeHtml(med.time)} (${escapeHtml(med.timing)})</span>
                </div>
                <div class="queue-medication">
                    <span class="medication-name">${escapeHtml(med.medicationName)}</span>
                    <span class="medication-dosage">${escapeHtml(med.dosage)}</span>
                </div>
            </div>
            <div class="queue-action">
                <button class="btn-queue-action" 
                        onclick="event.stopPropagation(); handleMedicationQueueClick(${med.id})"
                        aria-label="투약하기">
                    투약하기 →
                </button>
            </div>
        </div>
    `;
}

/**
 * 투약 대기 아이템 클릭 핸들러
 */
function handleMedicationQueueClick(medicationId) {
    try {
        const pendingMeds = window.barabomData?.getPendingMedications?.() || [];
        const medication = pendingMeds.find(m => m.id === medicationId);
        
        if (medication && typeof showMedicationDetailModal === 'function') {
            showMedicationDetailModal(medication);
        }
    } catch (error) {
        console.error('투약 클릭 핸들러 오류:', error);
        showToast('투약 정보를 불러올 수 없습니다');
    }
}

// ============================================
// 오늘의 일정
// ============================================

/**
 * 오늘의 일정 렌더링
 */
function renderTodaySchedule() {
    try {
        const container = document.getElementById('todayScheduleList');
        if (!container) return;
        
        const today = window.barabomData?.getToday?.() || '';
        const todayRecords = window.barabomData?.getRecordsByDate?.(today) || [];
        
        // 시간순으로 정렬
        const sortedRecords = [...todayRecords].sort((a, b) => {
            const timeA = parseTime(a.time);
            const timeB = parseTime(b.time);
            return timeA - timeB;
        });
        
        if (sortedRecords.length === 0) {
            container.innerHTML = `
                <div class="empty-schedule">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <p>오늘 일정이 없습니다</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = sortedRecords.map(record => `
            <div class="schedule-item">
                <div class="schedule-time">${escapeHtml(record.time)}</div>
                <div class="schedule-content">
                    <div class="schedule-icon" aria-hidden="true">${record.icon || '📝'}</div>
                    <div class="schedule-details">
                        <p class="schedule-title">${escapeHtml(record.content)}</p>
                        <p class="schedule-author">${escapeHtml(record.author)}</p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('일정 렌더링 오류:', error);
    }
}

// ============================================
// 전문가 일지 작성
// ============================================

/**
 * 전문가 일지 모달 열기
 */
function openProfessionalReportModal() {
    try {
        const modal = createProfessionalReportModal();
        showModal(modal);
        
        // 기본값 설정
        setTimeout(() => {
            selectReportCategory(ProfessionalManager.selectedCategory);
            renderReportPhotos();
        }, 100);
    } catch (error) {
        console.error('일지 모달 열기 오류:', error);
        showToast('일지 작성 화면을 열 수 없습니다');
    }
}

/**
 * 전문가 일지 모달 HTML 생성
 */
function createProfessionalReportModal() {
    const pet = window.barabomData?.familyData?.pets?.[0];
    const today = window.barabomData?.getToday?.() || '';
    
    if (!pet) {
        throw new Error('반려동물 정보를 찾을 수 없습니다');
    }
    
    return `
        <div class="modal" id="professionalReportModal" role="dialog" aria-labelledby="reportModalTitle" aria-modal="true">
            <div class="modal-overlay" onclick="closeProfessionalReportModal()" aria-hidden="true"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="reportModalTitle">📝 ${escapeHtml(pet.name)} 일지 작성</h3>
                    <button class="modal-close" 
                            onclick="closeProfessionalReportModal()"
                            aria-label="일지 작성 닫기">×</button>
                </div>
                
                <div class="modal-body">
                    <!-- 날짜 -->
                    <div class="form-group">
                        <label for="reportDate">날짜</label>
                        <input type="date" 
                               id="reportDate" 
                               class="input-field" 
                               value="${today}">
                    </div>
                    
                    <!-- 카테고리 선택 -->
                    <div class="form-group">
                        <label>카테고리</label>
                        <div class="category-buttons" role="radiogroup" aria-label="카테고리 선택">
                            <button type="button" 
                                    class="category-btn active" 
                                    data-category="report" 
                                    onclick="selectReportCategory('report')"
                                    role="radio"
                                    aria-checked="true">
                                📝 일지
                            </button>
                            <button type="button" 
                                    class="category-btn" 
                                    data-category="health" 
                                    onclick="selectReportCategory('health')"
                                    role="radio"
                                    aria-checked="false">
                                🏥 건강
                            </button>
                            <button type="button" 
                                    class="category-btn" 
                                    data-category="play" 
                                    onclick="selectReportCategory('play')"
                                    role="radio"
                                    aria-checked="false">
                                🎾 활동
                            </button>
                        </div>
                    </div>
                    
                    <!-- 템플릿 선택 -->
                    <div class="form-group">
                        <label for="reportTemplate">빠른 템플릿</label>
                        <select id="reportTemplate" 
                                class="input-field" 
                                onchange="applyReportTemplate()">
                            <option value="">선택하세요</option>
                            <option value="good">오늘 잘 지냈어요 😊</option>
                            <option value="active">활발하게 놀았어요 🎉</option>
                            <option value="quiet">조용히 지냈어요 😴</option>
                            <option value="social">친구들과 잘 어울렸어요 🤝</option>
                        </select>
                    </div>
                    
                    <!-- 내용 -->
                    <div class="form-group">
                        <label for="reportContent">내용</label>
                        <textarea id="reportContent" 
                                  class="input-field" 
                                  rows="5"
                                  maxlength="1000"
                                  placeholder="오늘 ${escapeHtml(pet.name)}의 하루는 어땠나요?"></textarea>
                    </div>
                    
                    <!-- 사진 추가 -->
                    <div class="form-group">
                        <label>사진 추가</label>
                        <div id="reportPhotos" 
                             class="report-photos" 
                             role="list" 
                             aria-label="첨부된 사진"></div>
                    </div>
                    
                    <!-- 상태 체크 -->
                    <div class="form-group">
                        <label>오늘의 상태</label>
                        <div class="status-checks">
                            <label class="status-check">
                                <input type="checkbox" id="statusMeal">
                                <span>🍚 식사 완료</span>
                            </label>
                            <label class="status-check">
                                <input type="checkbox" id="statusPoop">
                                <span>💩 배변 정상</span>
                            </label>
                            <label class="status-check">
                                <input type="checkbox" id="statusNap">
                                <span>😴 낮잠</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeProfessionalReportModal()">취소</button>
                    <button class="btn-primary" onclick="submitProfessionalReport()">
                        가족에게 전송 📤
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * 카테고리 선택
 */
function selectReportCategory(category) {
    try {
        ProfessionalManager.selectedCategory = category;
        document.querySelectorAll('.category-btn').forEach(btn => {
            const isSelected = btn.getAttribute('data-category') === category;
            btn.classList.toggle('active', isSelected);
            btn.setAttribute('aria-checked', isSelected.toString());
        });
    } catch (error) {
        console.error('카테고리 선택 오류:', error);
    }
}

/**
 * 템플릿 적용
 */
function applyReportTemplate() {
    try {
        const template = document.getElementById('reportTemplate')?.value;
        const content = document.getElementById('reportContent');
        const pet = window.barabomData?.familyData?.pets?.[0];
        
        if (!content || !pet) return;
        
        const templates = {
            good: `${pet.name}가 오늘 하루 잘 지냈습니다! 친구들과도 잘 어울리고, 식사도 잘 했어요. 👍`,
            active: `${pet.name}가 오늘 정말 활발했어요! 운동장에서 친구들과 신나게 뛰어놀았습니다. 에너지가 넘치네요! 🎉`,
            quiet: `${pet.name}가 오늘은 조용히 지냈어요. 휴식을 많이 취하고 편안하게 보냈습니다. 😴`,
            social: `${pet.name}가 친구들과 정말 잘 어울렸어요! 사회성이 좋아지고 있습니다. 다른 강아지들과 즐겁게 놀았어요! 🤝`
        };
        
        if (templates[template]) {
            content.value = templates[template];
        }
    } catch (error) {
        console.error('템플릿 적용 오류:', error);
    }
}

/**
 * 사진 추가
 */
function addReportPhoto() {
    try {
        const demoPhotos = [
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
            'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
            'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'
        ];
        
        const randomPhoto = demoPhotos[Math.floor(Math.random() * demoPhotos.length)];
        ProfessionalManager.reportPhotos.push(randomPhoto);
        
        renderReportPhotos();
        showToast('사진이 추가되었습니다 ✓');
    } catch (error) {
        console.error('사진 추가 오류:', error);
        showToast('사진 추가에 실패했습니다');
    }
}

/**
 * 사진 렌더링
 */
function renderReportPhotos() {
    try {
        const container = document.getElementById('reportPhotos');
        if (!container) return;
        
        let html = ProfessionalManager.reportPhotos.map((photo, index) => `
            <div class="report-photo-item" role="listitem">
                <img src="${escapeHtml(photo)}" alt="첨부 사진 ${index + 1}">
                <button type="button" 
                        class="remove-photo-btn" 
                        onclick="removeReportPhoto(${index})"
                        aria-label="사진 ${index + 1} 제거">×</button>
            </div>
        `).join('');
        
        html += `
            <button type="button" 
                    class="add-photo-btn" 
                    onclick="addReportPhoto()"
                    aria-label="사진 추가">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>사진 추가</span>
            </button>
        `;
        
        container.innerHTML = html;
    } catch (error) {
        console.error('사진 렌더링 오류:', error);
    }
}

/**
 * 사진 제거
 */
function removeReportPhoto(index) {
    try {
        if (index >= 0 && index < ProfessionalManager.reportPhotos.length) {
            ProfessionalManager.reportPhotos.splice(index, 1);
            renderReportPhotos();
            showToast('사진이 제거되었습니다');
        }
    } catch (error) {
        console.error('사진 제거 오류:', error);
    }
}

/**
 * 일지 제출
 */
function submitProfessionalReport() {
    try {
        const content = document.getElementById('reportContent')?.value.trim();
        const date = document.getElementById('reportDate')?.value;
        
        if (!content) {
            showToast('내용을 입력해주세요');
            return;
        }
        
        // 상태 체크
        const statusMeal = document.getElementById('statusMeal')?.checked;
        const statusPoop = document.getElementById('statusPoop')?.checked;
        const statusNap = document.getElementById('statusNap')?.checked;
        
        let finalContent = content;
        const statuses = [];
        if (statusMeal) statuses.push('식사 완료');
        if (statusPoop) statuses.push('배변 정상');
        if (statusNap) statuses.push('낮잠');
        
        if (statuses.length > 0) {
            finalContent += `\n\n✓ ${statuses.join(', ')}`;
        }
        
        const professional = window.barabomData?.familyData?.professionals?.[0];
        
        // 기록 추가
        window.barabomData?.addTimelineRecord({
            type: ProfessionalManager.selectedCategory,
            content: finalContent,
            date: date,
            author: professional?.name || '선생님',
            authorType: 'professional',
            photos: [...ProfessionalManager.reportPhotos]
        });
        
        // 알림 전송
        window.barabomData?.addNotification({
            message: `${professional?.name || '전문가'}에서 새 일지를 작성했습니다`,
            type: 'report'
        });
        
        // 초기화 및 닫기
        resetProfessionalReport();
        closeProfessionalReportModal();
        
        if (typeof renderHomeScreen === 'function') {
            renderHomeScreen();
        }
        
        showToast('일지가 가족에게 전송되었습니다 📤');
    } catch (error) {
        console.error('일지 제출 오류:', error);
        showToast('일지 전송에 실패했습니다');
    }
}

/**
 * 일지 초기화
 */
function resetProfessionalReport() {
    ProfessionalManager.reportPhotos = [];
    ProfessionalManager.selectedCategory = 'report';
}

/**
 * 일지 모달 닫기
 */
function closeProfessionalReportModal() {
    try {
        const modal = document.getElementById('professionalReportModal');
        if (modal) {
            modal.remove();
        }
        resetProfessionalReport();
    } catch (error) {
        console.error('일지 모달 닫기 오류:', error);
    }
}

// ============================================
// 정리 함수
// ============================================

/**
 * 메모리 정리
 */
function cleanupProfessionalSystem() {
    ProfessionalManager.reportPhotos = [];
    ProfessionalManager.selectedCategory = 'report';
}

// 페이지 언로드 시 정리
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanupProfessionalSystem);
}

// ============================================
// 스타일 추가
// ============================================

function addProfessionalStyles() {
    if (document.getElementById('professionalStyles')) return;
    
    const professionalStyles = document.createElement('style');
    professionalStyles.id = 'professionalStyles';
    professionalStyles.textContent = `
    .empty-queue,
    .empty-schedule {
        text-align: center;
        padding: 3rem 1rem;
        color: #6b7280;
    }
    
    .empty-queue svg,
    .empty-schedule svg {
        color: #d1d5db;
        margin: 0 auto 1rem;
    }
    
    .empty-subtitle {
        font-size: 0.875rem;
        margin-top: 0.5rem;
        color: #9ca3af;
    }
    
    .queue-item {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 1rem;
        margin-bottom: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .queue-item:hover,
    .queue-item:focus {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transform: translateY(-2px);
        outline: none;
    }
    
    .queue-item.priority-high {
        border-left: 4px solid #ef4444;
        background: #fef2f2;
    }
    
    .queue-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }
    
    .queue-pet {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .queue-pet img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .queue-pet h4 {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 0.125rem;
    }
    
    .queue-pet p {
        font-size: 0.75rem;
        color: #6b7280;
    }
    
    .priority-badge {
        background: #ef4444;
        color: white;
        font-size: 0.75rem;
        padding: 4px 8px;
        border-radius: 12px;
        font-weight: 600;
    }
    
    .queue-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
    }
    
    .queue-time {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #6b7280;
        font-size: 0.875rem;
    }
    
    .queue-medication {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .medication-name {
        font-weight: 600;
        font-size: 0.875rem;
    }
    
    .medication-dosage {
        background: #dbeafe;
        color: #1e40af;
        font-size: 0.75rem;
        padding: 4px 8px;
        border-radius: 12px;
        font-weight: 600;
    }
    
    .queue-action {
        text-align: right;
    }
    
    .btn-queue-action {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn-queue-action:hover {
        background: #2563eb;
        transform: scale(1.05);
    }
    
    .btn-queue-action:active {
        transform: scale(0.95);
    }
    
    .schedule-item {
        display: flex;
        gap: 1rem;
        padding: 0.75rem;
        border-bottom: 1px solid #f3f4f6;
    }
    
    .schedule-item:last-child {
        border-bottom: none;
    }
    
    .schedule-time {
        font-size: 0.875rem;
        font-weight: 600;
        color: #3b82f6;
        min-width: 60px;
        flex-shrink: 0;
    }
    
    .schedule-content {
        display: flex;
        gap: 0.75rem;
        flex: 1;
        min-width: 0;
    }
    
    .schedule-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
    }
    
    .schedule-details {
        flex: 1;
        min-width: 0;
    }
    
    .schedule-title {
        font-size: 0.875rem;
        color: #111827;
        margin-bottom: 0.25rem;
        word-break: break-word;
    }
    
    .schedule-author {
        font-size: 0.75rem;
        color: #6b7280;
    }
    
    .category-buttons {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .category-btn {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        background: white;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .category-btn:hover {
        border-color: #3b82f6;
        background: #eff6ff;
        transform: translateY(-1px);
    }
    
    .category-btn:active {
        transform: translateY(0);
    }
    
    .category-btn.active {
        border-color: #3b82f6;
        background: #3b82f6;
        color: white;
        font-weight: 600;
    }
    
    .report-photos {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .report-photo-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 0.5rem;
        overflow: hidden;
    }
    
    .report-photo-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .remove-photo-btn {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        font-size: 1.25rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        transition: all 0.2s;
    }
    
    .remove-photo-btn:hover {
        background: rgba(220, 38, 38, 1);
        transform: scale(1.1);
    }
    
    .add-photo-btn {
        aspect-ratio: 1;
        border: 2px dashed #d1d5db;
        border-radius: 0.5rem;
        background: #f9fafb;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .add-photo-btn:hover {
        border-color: #3b82f6;
        background: #eff6ff;
        transform: scale(1.05);
    }
    
    .add-photo-btn:active {
        transform: scale(0.95);
    }
    
    .add-photo-btn svg {
        color: #9ca3af;
    }
    
    .add-photo-btn span {
        font-size: 0.75rem;
        color: #6b7280;
        font-weight: 500;
    }
    
    .status-checks {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .status-check {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: #f9fafb;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .status-check:hover {
        background: #f3f4f6;
    }
    
    .status-check input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
    }
    
    .status-check span {
        font-size: 0.875rem;
        user-select: none;
    }
    
    @media (max-width: 480px) {
        .report-photos {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    `;
    document.head.appendChild(professionalStyles);
}

// 스타일 초기화
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', addProfessionalStyles);
}
