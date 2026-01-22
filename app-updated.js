/* ============================================
   리펫 - 메인 앱 로직 (업데이트)
   화면 전환, 기본 UI 제어, 캘린더 등
   ============================================ */

'use strict';

// ============================================
// 전역 상태 관리
// ============================================

const AppState = {
    currentScreen: 'homeScreen',
    currentDate: new Date(),
    selectedDate: new Date()
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
 * 날짜 비교
 */
function isSameDay(date1, date2) {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// ============================================
// 초기화
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🐕 리펫 앱 시작');
        
        // 데이터 로드
        if (window.barabomData?.loadFromLocalStorage) {
            window.barabomData.loadFromLocalStorage();
        }
        
        // UI 초기화
        initializeApp();
        
        console.log('✅ 앱 초기화 완료');
    } catch (error) {
        console.error('앱 초기화 오류:', error);
        showToast('앱을 시작하는 중 오류가 발생했습니다');
    }
});

/**
 * 앱 초기화
 */
function initializeApp() {
    try {
        console.log('📱 앱 UI 초기화 중...');
        
        // 반려견 정보 표시
        updatePetInfo();
        
        // 통계 업데이트
        updateStats();
        
        // 화면 렌더링
        renderHomeScreen();
        renderFamilyScreen();
        renderMyPage();
        
        // 시설 예약 초기화
        if (window.FacilitySystem?.init) {
            window.FacilitySystem.init();
        }
        
        // 알림 배지 업데이트
        if (window.barabomData?.updateNotificationBadge) {
            window.barabomData.updateNotificationBadge();
        }
        
        // AI 채팅 미리보기 업데이트
        if (window.FamilyChat?.updatePreview) {
            window.FamilyChat.updatePreview();
        }
        
        // 또래 비교 미리보기 업데이트
        if (window.PeerReport?.update) {
            window.PeerReport.update();
        }
        
        console.log('✅ 앱 UI 초기화 완료');
    } catch (error) {
        console.error('앱 UI 초기화 중 오류:', error);
    }
}

// ============================================
// 화면 전환
// ============================================

/**
 * 화면 전환
 */
function switchScreen(button) {
    try {
        if (!button) return;
        
        // 모든 네비게이션 버튼 비활성화
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-current', 'false');
        });
        
        // 클릭된 버튼 활성화
        button.classList.add('active');
        button.setAttribute('aria-current', 'page');
        
        // 모든 화면 숨기기
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 선택된 화면 표시
        const screenId = button.getAttribute('data-screen');
        const screen = document.getElementById(screenId);
        
        if (screen) {
            screen.classList.add('active');
            AppState.currentScreen = screenId;
            
            // 화면별 렌더링
            if (screenId === 'homeScreen') {
                renderHomeScreen();
            } else if (screenId === 'calendarScreen') {
                renderCalendar();
            } else if (screenId === 'familyScreen') {
                renderFamilyScreen();
            } else if (screenId === 'professionalScreen') {
                renderProfessionalScreen();
            } else if (screenId === 'facilityScreen') {
                if (window.FacilitySystem?.render) {
                    window.FacilitySystem.render();
                }
            } else if (screenId === 'myScreen') {
                renderMyPage();
            }
        }
    } catch (error) {
        console.error('화면 전환 오류:', error);
    }
}

// ============================================
// 홈 화면 렌더링
// ============================================

/**
 * 홈 화면 렌더링
 */
function renderHomeScreen() {
    try {
        renderTimeline();
        updateStats();
        
        // AI 채팅 미리보기 업데이트
        if (window.FamilyChat?.updatePreview) {
            window.FamilyChat.updatePreview();
        }
        
        // 또래 비교 미리보기 업데이트
        if (window.PeerReport?.update) {
            window.PeerReport.update();
        }
    } catch (error) {
        console.error('홈 화면 렌더링 오류:', error);
    }
}

/**
 * 타임라인 렌더링
 */
function renderTimeline() {
    try {
        const container = document.getElementById('timelineList');
        if (!container) return;
        
        const recentRecords = window.barabomData?.getRecentRecords?.(5) || [];
        
        if (recentRecords.length === 0) {
            container.innerHTML = `
                <div class="empty-records">
                    <p>아직 기록이 없습니다</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem; color: #6b7280;">
                        빠른 기록 버튼으로 시작해보세요!
                    </p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recentRecords.map(item => `
            <div class="timeline-item" role="article">
                <div class="timeline-icon" aria-hidden="true">${escapeHtml(item.icon)}</div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-author">${escapeHtml(item.author)}</span>
                        ${item.authorType === 'professional' ? 
                            '<span class="professional-badge">전문가</span>' : ''}
                    </div>
                    <div class="timeline-text">${escapeHtml(item.content)}</div>
                    ${item.photos && item.photos.length > 0 ? `
                        <div class="timeline-photos">
                            ${item.photos.slice(0, 3).map((photo, idx) => 
                                `<img src="${escapeHtml(photo)}" class="timeline-photo" alt="첨부 사진 ${idx + 1}" onerror="this.style.display='none'">`
                            ).join('')}
                        </div>
                    ` : ''}
                    <div class="timeline-time">${escapeHtml(item.time)}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('타임라인 렌더링 오류:', error);
    }
}

/**
 * 통계 업데이트
 */
function updateStats() {
    try {
        const familyCount = document.getElementById('familyCount');
        const professionalCount = document.getElementById('professionalCount');
        const recordCount = document.getElementById('recordCount');
        
        if (familyCount) {
            familyCount.textContent = window.barabomData?.familyData?.members?.length || 0;
        }
        
        if (professionalCount) {
            professionalCount.textContent = window.barabomData?.familyData?.professionals?.length || 0;
        }
        
        if (recordCount) {
            recordCount.textContent = window.barabomData?.timelineData?.length || 0;
        }
    } catch (error) {
        console.error('통계 업데이트 오류:', error);
    }
}

// ============================================
// 캘린더 렌더링
// ============================================

/**
 * 캘린더 렌더링
 */
function renderCalendar() {
    try {
        updateCalendarTitle();
        renderCalendarDays();
        renderDateRecords();
    } catch (error) {
        console.error('캘린더 렌더링 오류:', error);
    }
}

/**
 * 캘린더 제목 업데이트
 */
function updateCalendarTitle() {
    try {
        const title = document.getElementById('calendarTitle');
        if (title) {
            title.textContent = `${AppState.currentDate.getFullYear()}년 ${AppState.currentDate.getMonth() + 1}월`;
        }
    } catch (error) {
        console.error('캘린더 제목 업데이트 오류:', error);
    }
}

/**
 * 캘린더 날짜 렌더링
 */
function renderCalendarDays() {
    try {
        const container = document.getElementById('calendarDays');
        if (!container) return;
        
        const year = AppState.currentDate.getFullYear();
        const month = AppState.currentDate.getMonth();
        
        // 첫째 날과 마지막 날
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        let html = '';
        
        // 빈 칸 추가
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div class="calendar-day empty" aria-hidden="true"></div>';
        }
        
        // 날짜 추가
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = window.barabomData?.formatDate?.(date) || '';
            const events = window.barabomData?.calendarEvents?.[dateKey] || [];
            
            const isToday = isSameDay(date, new Date());
            const isSelected = isSameDay(date, AppState.selectedDate);
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            
            const ariaLabel = `${month + 1}월 ${day}일${isToday ? ' (오늘)' : ''}${events.length > 0 ? `, ${events.length}개 기록` : ''}`;
            
            html += `
                <div class="${classes}" 
                     onclick="selectDate('${dateKey}')"
                     role="button"
                     tabindex="0"
                     aria-label="${ariaLabel}"
                     onkeydown="if(event.key==='Enter') selectDate('${dateKey}')">
                    <span>${day}</span>
                    ${events.length > 0 ? `
                        <div class="event-dots" aria-hidden="true">
                            ${events.slice(0, 3).map(() => '<div class="event-dot"></div>').join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        container.innerHTML = html;
    } catch (error) {
        console.error('캘린더 날짜 렌더링 오류:', error);
    }
}

/**
 * 날짜 선택
 */
function selectDate(dateKey) {
    try {
        AppState.selectedDate = new Date(dateKey);
        renderCalendar();
    } catch (error) {
        console.error('날짜 선택 오류:', error);
    }
}

/**
 * 이전 달
 */
function previousMonth() {
    try {
        AppState.currentDate.setMonth(AppState.currentDate.getMonth() - 1);
        renderCalendar();
    } catch (error) {
        console.error('이전 달 이동 오류:', error);
    }
}

/**
 * 다음 달
 */
function nextMonth() {
    try {
        AppState.currentDate.setMonth(AppState.currentDate.getMonth() + 1);
        renderCalendar();
    } catch (error) {
        console.error('다음 달 이동 오류:', error);
    }
}

/**
 * 선택된 날짜의 기록 렌더링
 */
function renderDateRecords() {
    try {
        const titleElement = document.getElementById('selectedDateTitle');
        const container = document.getElementById('dateRecordsList');
        
        if (!container) return;
        
        const dateKey = window.barabomData?.formatDate?.(AppState.selectedDate) || '';
        const records = window.barabomData?.getRecordsByDate?.(dateKey) || [];
        
        // 제목 업데이트
        if (titleElement) {
            titleElement.textContent = `${AppState.selectedDate.getMonth() + 1}월 ${AppState.selectedDate.getDate()}일의 기록`;
        }
        
        if (records.length === 0) {
            container.innerHTML = `
                <div class="empty-records">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <p>이 날은 기록이 없습니다</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = records.map(item => `
            <div class="timeline-item" role="article">
                <div class="timeline-icon" aria-hidden="true">${escapeHtml(item.icon)}</div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-author">${escapeHtml(item.author)}</span>
                        ${item.authorType === 'professional' ? 
                            '<span class="professional-badge">전문가</span>' : ''}
                    </div>
                    <div class="timeline-text">${escapeHtml(item.content)}</div>
                    ${item.photos && item.photos.length > 0 ? `
                        <div class="timeline-photos">
                            ${item.photos.map((photo, idx) => 
                                `<img src="${escapeHtml(photo)}" class="timeline-photo" alt="첨부 사진 ${idx + 1}" onerror="this.style.display='none'">`
                            ).join('')}
                        </div>
                    ` : ''}
                    <div class="timeline-time">${escapeHtml(item.time)}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('날짜 기록 렌더링 오류:', error);
    }
}

// ============================================
// 가족 화면 렌더링
// ============================================

/**
 * 가족 화면 렌더링
 */
function renderFamilyScreen() {
    try {
        renderFamilyMembers();
    } catch (error) {
        console.error('가족 화면 렌더링 오류:', error);
    }
}

/**
 * 가족 구성원 렌더링
 */
function renderFamilyMembers() {
    try {
        const container = document.getElementById('familyMemberList');
        const countElement = document.getElementById('familyMemberCount');
        
        if (!container) return;
        
        const members = window.barabomData?.familyData?.members || [];
        
        if (countElement) {
            countElement.textContent = members.length;
        }
        
        container.innerHTML = members.map(member => `
            <div class="member-item">
                <div class="member-info">
                    <div class="member-avatar">
                        <span aria-hidden="true">${member.avatar}</span>
                        <span class="status-dot ${member.status}" 
                              role="status" 
                              aria-label="${member.status === 'online' ? '온라인' : '오프라인'}"></span>
                    </div>
                    <div class="member-details">
                        <h4>${escapeHtml(member.name)}</h4>
                        <p class="member-phone">${escapeHtml(member.phone)}</p>
                    </div>
                </div>
                <span class="member-role">${member.role === 'admin' ? '관리자' : '구성원'}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('가족 구성원 렌더링 오류:', error);
    }
}

// ============================================
// 마이페이지 렌더링
// ============================================

/**
 * 마이페이지 렌더링
 */
function renderMyPage() {
    try {
        renderPetDetails();
        renderProfessionalList();
        renderAllRecords();
    } catch (error) {
        console.error('마이페이지 렌더링 오류:', error);
    }
}

/**
 * 반려견 상세 정보
 */
function renderPetDetails() {
    try {
        const pet = window.barabomData?.familyData?.pets?.[0];
        if (!pet) return;
        
        const elements = {
            petDetailPhoto: pet.photo,
            petDetailName: pet.name,
            petBreed: pet.breed,
            petAge: pet.age,
            petGender: pet.gender,
            petDetailWeight: pet.weight
        };
        
        // 각 요소 업데이트
        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'petDetailPhoto') {
                    element.src = elements[id];
                    element.alt = `${pet.name} 프로필 사진`;
                    element.onerror = function() {
                        this.src = 'https://via.placeholder.com/400?text=Pet';
                    };
                } else {
                    element.textContent = elements[id];
                }
            }
        });
        
        // 알러지 정보
        const allergyList = document.getElementById('allergyList');
        if (allergyList && pet.allergies) {
            allergyList.innerHTML = pet.allergies.map(allergy => 
                `<span class="tag">${escapeHtml(allergy)}</span>`
            ).join('');
        }
        
        // 예방접종 정보
        const vaccineList = document.getElementById('vaccineList');
        if (vaccineList && pet.vaccines) {
            vaccineList.innerHTML = pet.vaccines.map(vaccine => `
                <div class="vaccine-item">
                    <span>${escapeHtml(vaccine.name)}</span>
                    <span class="vaccine-next">다음: ${escapeHtml(vaccine.nextDate)}</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('반려견 상세 정보 렌더링 오류:', error);
    }
}

/**
 * 전문가 목록
 */
function renderProfessionalList() {
    try {
        const container = document.getElementById('professionalList');
        const countElement = document.getElementById('professionalListCount');
        
        if (!container) return;
        
        const professionals = window.barabomData?.familyData?.professionals || [];
        
        if (countElement) {
            countElement.textContent = professionals.length;
        }
        
        container.innerHTML = professionals.map(pro => `
            <div class="professional-item">
                <div class="professional-info">
                    <div class="professional-header">
                        <div class="professional-main">
                            <div class="professional-avatar" aria-hidden="true">${pro.avatar}</div>
                            <div>
                                <div class="professional-name">${escapeHtml(pro.name)}</div>
                                <div class="professional-manager">${escapeHtml(pro.manager)}</div>
                            </div>
                        </div>
                        <span class="professional-type">
                            ${pro.type === 'daycare' ? '유치원' : 
                              pro.type === 'hospital' ? '병원' : '미용'}
                        </span>
                    </div>
                    <div class="professional-contact">${escapeHtml(pro.contact)}</div>
                    <div class="professional-address">${escapeHtml(pro.address)}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('전문가 목록 렌더링 오류:', error);
    }
}

/**
 * 전체 기록 렌더링
 */
function renderAllRecords() {
    try {
        const container = document.getElementById('allRecordsList');
        if (!container) return;
        
        const records = window.barabomData?.getRecentRecords?.(50) || [];
        
        if (records.length === 0) {
            container.innerHTML = `
                <div class="empty-records">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <p>아직 기록이 없습니다</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = records.map(item => `
            <div class="timeline-item" role="article">
                <div class="timeline-icon" aria-hidden="true">${escapeHtml(item.icon)}</div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-author">${escapeHtml(item.author)}</span>
                        ${item.authorType === 'professional' ? 
                            '<span class="professional-badge">전문가</span>' : ''}
                    </div>
                    <div class="timeline-text">${escapeHtml(item.content)}</div>
                    ${item.photos && item.photos.length > 0 ? `
                        <div class="timeline-photos">
                            ${item.photos.map((photo, idx) => 
                                `<img src="${escapeHtml(photo)}" class="timeline-photo" alt="첨부 사진 ${idx + 1}" onerror="this.style.display='none'">`
                            ).join('')}
                        </div>
                    ` : ''}
                    <div class="timeline-time">${escapeHtml(item.time)} • ${escapeHtml(item.date)}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('전체 기록 렌더링 오류:', error);
    }
}

// ============================================
// 반려견 정보 업데이트
// ============================================

/**
 * 반려견 정보 업데이트 (헤더)
 */
function updatePetInfo() {
    try {
        const pet = window.barabomData?.familyData?.pets?.[0];
        if (!pet) return;
        
        // 헤더의 반려견 정보
        const petPhoto = document.getElementById('petPhoto');
        const petName = document.getElementById('petName');
        const petDetails = document.getElementById('petDetails');
        const petWeight = document.getElementById('petWeight');
        
        if (petPhoto) {
            petPhoto.src = pet.photo;
            petPhoto.alt = `${pet.name} 프로필 사진`;
            petPhoto.onerror = function() {
                this.src = 'https://via.placeholder.com/400?text=Pet';
            };
        }
        if (petName) petName.textContent = pet.name;
        if (petDetails) petDetails.textContent = `${pet.breed} • ${pet.age}`;
        if (petWeight) petWeight.textContent = pet.weight;
    } catch (error) {
        console.error('반려견 정보 업데이트 오류:', error);
    }
}

// ============================================
// 빠른 기록 모달
// ============================================

/**
 * 빠른 기록 모달 열기
 */
function openQuickRecordModal() {
    try {
        const today = window.barabomData?.getToday?.() || '';
        const modal = createQuickRecordModal(today);
        showModal(modal);
    } catch (error) {
        console.error('빠른 기록 모달 열기 오류:', error);
        showToast('기록 추가 화면을 열 수 없습니다');
    }
}

/**
 * 빠른 기록 모달 HTML 생성
 */
function createQuickRecordModal(date) {
    return `
        <div class="modal" id="quickRecordModal" role="dialog" aria-labelledby="quickRecordModalTitle" aria-modal="true">
            <div class="modal-overlay" onclick="closeQuickRecordModal()" aria-hidden="true"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="quickRecordModalTitle">📝 빠른 기록</h3>
                    <button class="modal-close" 
                            onclick="closeQuickRecordModal()"
                            aria-label="기록 추가 닫기">×</button>
                </div>
                <div class="modal-body">
                    <div class="quick-record-grid">
                        <button class="quick-record-btn" onclick="openRecordModal('meal')" aria-label="식사 기록하기">
                            <span class="quick-record-icon">🍚</span>
                            <span class="quick-record-label">식사</span>
                        </button>
                        <button class="quick-record-btn" onclick="openRecordModal('walk')" aria-label="산책 기록하기">
                            <span class="quick-record-icon">🚶</span>
                            <span class="quick-record-label">산책</span>
                        </button>
                        <button class="quick-record-btn" onclick="openRecordModal('play')" aria-label="놀이 기록하기">
                            <span class="quick-record-icon">🎾</span>
                            <span class="quick-record-label">놀이</span>
                        </button>
                        <button class="quick-record-btn" onclick="openRecordModal('health')" aria-label="건강 기록하기">
                            <span class="quick-record-icon">🏥</span>
                            <span class="quick-record-label">건강</span>
                        </button>
                        <button class="quick-record-btn" onclick="openRecordModal('grooming')" aria-label="미용 기록하기">
                            <span class="quick-record-icon">✂️</span>
                            <span class="quick-record-label">미용</span>
                        </button>
                        <button class="quick-record-btn" onclick="openRecordModal('photo')" aria-label="사진 기록하기">
                            <span class="quick-record-icon">📷</span>
                            <span class="quick-record-label">사진</span>
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeQuickRecordModal()">취소</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * 빠른 기록 모달 닫기
 */
function closeQuickRecordModal() {
    try {
        const modal = document.getElementById('quickRecordModal');
        if (modal) {
            modal.remove();
        }
    } catch (error) {
        console.error('빠른 기록 모달 닫기 오류:', error);
    }
}

/**
 * 기록 추가 모달 열기
 */
function openRecordModal(type) {
    try {
        closeQuickRecordModal();
        
        const today = window.barabomData?.getToday?.() || '';
        showRecordModal(type, today);
    } catch (error) {
        console.error('기록 모달 열기 오류:', error);
        showToast('기록 추가 화면을 열 수 없습니다');
    }
}

/**
 * 기록 모달 표시
 */
function showRecordModal(type, date) {
    try {
        const modal = createRecordModal(type, date);
        showModal(modal);
    } catch (error) {
        console.error('기록 모달 표시 오류:', error);
    }
}

/**
 * 기록 모달 HTML 생성
 */
function createRecordModal(type, date) {
    const typeLabel = window.barabomData?.getTypeLabel?.(type) || '기록';
    const icon = window.barabomData?.getIconForType?.(type) || '📝';
    
    return `
        <div class="modal" id="recordModal" role="dialog" aria-labelledby="recordModalTitle" aria-modal="true">
            <div class="modal-overlay" onclick="closeRecordModal()" aria-hidden="true"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="recordModalTitle">${icon} ${escapeHtml(typeLabel)} 기록 추가</h3>
                    <button class="modal-close" 
                            onclick="closeRecordModal()"
                            aria-label="기록 추가 닫기">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="recordDate">날짜</label>
                        <input type="date" 
                               id="recordDate" 
                               value="${date}" 
                               class="input-field">
                    </div>
                    <div class="form-group">
                        <label for="recordContent">내용</label>
                        <textarea id="recordContent" 
                                  class="input-field" 
                                  rows="4"
                                  maxlength="500" 
                                  placeholder="어떤 일이 있었나요?"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeRecordModal()">취소</button>
                    <button class="btn-primary" onclick="saveRecord('${type}')">저장</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * 기록 저장
 */
function saveRecord(type) {
    try {
        const content = document.getElementById('recordContent')?.value;
        const date = document.getElementById('recordDate')?.value;
        
        if (!content || !content.trim()) {
            showToast('내용을 입력해주세요');
            return;
        }
        
        const newRecord = window.barabomData?.addTimelineRecord({
            type: type,
            content: content.trim(),
            date: date,
            photos: []
        });
        
        if (newRecord) {
            closeRecordModal();
            renderHomeScreen();
            renderCalendar();
            
            // AI 메시지 자동 전송
            if (window.FamilyChat?.sendAIMessageForActivity) {
                window.FamilyChat.sendAIMessageForActivity({ type });
            }
            
            showToast('기록이 추가되었습니다 ✓');
        }
    } catch (error) {
        console.error('기록 저장 오류:', error);
        showToast('기록 저장에 실패했습니다');
    }
}

/**
 * 기록 모달 닫기
 */
function closeRecordModal() {
    try {
        const modal = document.getElementById('recordModal');
        if (modal) {
            modal.remove();
        }
    } catch (error) {
        console.error('기록 모달 닫기 오류:', error);
    }
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 모달 표시
 */
function showModal(html) {
    try {
        const container = document.getElementById('modalContainer');
        if (container) {
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('모달 표시 오류:', error);
    }
}

/**
 * 토스트 메시지
 */
function showToast(message) {
    if (!message) return;
    
    try {
        // notification.js의 showToast 사용 시도
        if (typeof window.showToast === 'function' && window.showToast !== showToast) {
            window.showToast(message);
            return;
        }
        
        // 폴백: 간단한 토스트
        const toast = document.createElement('div');
        toast.className = 'toast-notification show';
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        
        // 스타일 추가
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(17, 24, 39, 0.95)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '2rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            zIndex: '9999',
            whiteSpace: 'nowrap',
            maxWidth: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)'
        });
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 2000);
    } catch (error) {
        console.error('토스트 표시 오류:', error);
    }
}

/**
 * 반려견 정보 편집 모달 (미구현)
 */
function openPetEditModal() {
    showToast('반려견 정보 편집 기능은 준비 중입니다 🐕');
}

// ============================================
// 정리 함수
// ============================================

/**
 * 메모리 정리
 */
function cleanupApp() {
    // 필요시 정리 작업 수행
}

// 페이지 언로드 시 정리
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanupApp);
}

// ============================================
// 통계 클릭 네비게이션
// ============================================

/**
 * 가족 탭으로 이동 (반짝임 효과)
 */
function navigateToFamily() {
    const navBtn = document.querySelector('[data-screen="familyScreen"]');
    if (navBtn) {
        // 반짝임 효과
        const statItem = event.currentTarget;
        statItem.classList.add('sparkle');
        
        setTimeout(() => {
            switchScreen(navBtn);
            statItem.classList.remove('sparkle');
        }, 800);
    }
}

/**
 * 전문가 탭으로 이동 (반짝임 효과)
 */
function navigateToProfessional() {
    const navBtn = document.querySelector('[data-screen="professionalScreen"]');
    if (navBtn) {
        // 반짝임 효과
        const statItem = event.currentTarget;
        statItem.classList.add('sparkle');
        
        setTimeout(() => {
            switchScreen(navBtn);
            statItem.classList.remove('sparkle');
        }, 800);
    }
}

/**
 * 캘린더로 이동 (반짝임 효과)
 */
function navigateToCalendar() {
    const navBtn = document.querySelector('[data-screen="calendarScreen"]');
    if (navBtn) {
        // 반짝임 효과
        const statItem = event.currentTarget;
        statItem.classList.add('sparkle');
        
        setTimeout(() => {
            switchScreen(navBtn);
            // 캘린더 반짝임
            const calendarDays = document.getElementById('calendarDays');
            if (calendarDays) {
                calendarDays.classList.add('sparkle');
                setTimeout(() => {
                    calendarDays.classList.remove('sparkle');
                }, 1500);
            }
            statItem.classList.remove('sparkle');
        }, 800);
    }
}

// ============================================
// 전문가 화면 렌더링
// ============================================

/**
 * 전문가 화면 렌더링
 */
function renderProfessionalScreen() {
    try {
        const container = document.getElementById('professionalContent');
        if (!container) return;
        
        const professionals = window.barabomData?.familyData?.professionals || [];
        
        if (professionals.length === 0) {
            // 이용중인 전문가가 없을 때
            container.innerHTML = `
                <div class="empty-professional">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <h3 class="empty-title">이용중인 전문가가 없습니다</h3>
                    <p class="empty-description">
                        유치원, 호텔, 훈련소 등<br>
                        우리 아이를 맡길 곳을 찾아보세요!
                    </p>
                    <button class="find-professional-btn" onclick="navigateToFacilitySearch()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        전문가 찾기
                    </button>
                </div>
            `;
        } else {
            // 이용중인 전문가 리스트
            container.innerHTML = `
                <div class="professional-list-container">
                    <h2 class="page-title">이용중인 전문가</h2>
                    
                    <div class="professional-cards">
                        ${professionals.map(pro => `
                            <div class="professional-card" onclick="viewProfessionalDetail(${pro.id})">
                                <div class="professional-card-image">
                                    <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600" 
                                         alt="${escapeHtml(pro.name)}"
                                         onerror="this.src='https://via.placeholder.com/600x200?text=Facility'">
                                    <span class="professional-type-badge">
                                        ${pro.type === 'daycare' ? '🏫 유치원' : 
                                          pro.type === 'hospital' ? '🏥 병원' : '✂️ 미용'}
                                    </span>
                                </div>
                                <div class="professional-card-content">
                                    <h3 class="professional-card-name">${escapeHtml(pro.name)}</h3>
                                    <div class="professional-card-info">
                                        <span class="professional-manager">👤 ${escapeHtml(pro.manager)}</span>
                                    </div>
                                    <p class="professional-card-address">📍 ${escapeHtml(pro.address)}</p>
                                    <div class="professional-card-actions">
                                        <button class="professional-action-btn" onclick="event.stopPropagation(); callProfessional('${escapeHtml(pro.contact)}')">
                                            📞 전화
                                        </button>
                                        <button class="professional-action-btn primary" onclick="event.stopPropagation(); bookProfessional(${pro.id})">
                                            📅 예약
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button class="add-professional-btn" onclick="navigateToFacilitySearch()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        다른 전문가 찾기
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('전문가 화면 렌더링 오류:', error);
    }
}

/**
 * 시설 검색으로 이동
 */
function navigateToFacilitySearch() {
    const navBtn = document.querySelector('[data-screen="facilityScreen"]');
    if (navBtn) {
        switchScreen(navBtn);
    }
}

/**
 * 전문가 전화걸기
 */
function callProfessional(phoneNumber) {
    window.location.href = `tel:${phoneNumber}`;
}

/**
 * 전문가 예약
 */
function bookProfessional(professionalId) {
    // 시설 화면으로 이동 후 해당 시설 보기
    navigateToFacilitySearch();
    
    // 잠시 후 해당 시설 상세로 이동
    setTimeout(() => {
        if (typeof viewFacilityDetail === 'function') {
            viewFacilityDetail(professionalId);
        }
    }, 500);
}

/**
 * 전문가 상세보기
 */
function viewProfessionalDetail(professionalId) {
    const pro = window.barabomData?.familyData?.professionals?.find(p => p.id === professionalId);
    if (!pro) return;
    
    const modal = `
        <div class="modal" id="professionalDetailModal">
            <div class="modal-overlay" onclick="closeProfessionalDetailModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${escapeHtml(pro.name)}</h3>
                    <button class="modal-close" onclick="closeProfessionalDetailModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="detail-section">
                        <h4>📍 기본 정보</h4>
                        <p>유형: ${pro.type === 'daycare' ? '유치원' : pro.type === 'hospital' ? '병원' : '미용'}</p>
                        <p>담당자: ${escapeHtml(pro.manager)}</p>
                        <p>연락처: ${escapeHtml(pro.contact)}</p>
                        <p>주소: ${escapeHtml(pro.address)}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="callProfessional('${escapeHtml(pro.contact)}')">
                        📞 전화하기
                    </button>
                    <button class="btn-primary" onclick="bookProfessional(${pro.id})">
                        📅 예약하기
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal(modal);
}

/**
 * 전문가 상세 모달 닫기
 */
function closeProfessionalDetailModal() {
    const modal = document.getElementById('professionalDetailModal');
    if (modal) {
        modal.remove();
    }
}
