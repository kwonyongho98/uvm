/* ============================================
   바라봄 - 데이터 관리
   모든 앱 데이터를 중앙에서 관리합니다
   ============================================ */

'use strict';

// ============================================
// 상수 정의
// ============================================

const USER_MODES = {
    FAMILY: 'family',
    PROFESSIONAL: 'professional'
};

const RECORD_TYPES = {
    MEAL: 'meal',
    WALK: 'walk',
    PLAY: 'play',
    HEALTH: 'health',
    MEDICATION: 'medication',
    GROOMING: 'grooming',
    REPORT: 'report',
    PHOTO: 'photo'
};

const MEDICATION_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

const NOTIFICATION_TYPES = {
    MEDICATION: 'medication',
    INFO: 'info',
    REPORT: 'report',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
};

const STORAGE_KEYS = {
    TIMELINE: 'barabom_timeline',
    MEDICATIONS: 'barabom_medications',
    NOTIFICATIONS: 'barabom_notifications',
    USER_MODE: 'barabom_userMode',
    FAMILY_DATA: 'barabom_family_data'
};

// ============================================
// 전역 상태
// ============================================

let userMode = USER_MODES.FAMILY;

// 가족 데이터
const familyData = {
    id: 'family1',
    name: '김씨네 가족',
    pets: [
        {
            id: 'pet1',
            name: '초코',
            breed: '푸들',
            age: '3살',
            birth: '2023-01-15',
            photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
            gender: '남아',
            weight: '5.2kg',
            allergies: ['닭고기', '밀가루'],
            vaccines: [
                { name: 'DHPPL', date: '2025-12-01', nextDate: '2026-12-01' },
                { name: '광견병', date: '2025-11-15', nextDate: '2026-11-15' }
            ]
        }
    ],
    members: [
        { 
            id: 'user1', 
            name: '김아빠', 
            role: 'admin', 
            avatar: '👨', 
            status: 'online', 
            phone: '010-1234-5678' 
        },
        { 
            id: 'user2', 
            name: '김엄마', 
            role: 'member', 
            avatar: '👩', 
            status: 'online', 
            phone: '010-2345-6789' 
        },
        { 
            id: 'user3', 
            name: '김딸', 
            role: 'member', 
            avatar: '👧', 
            status: 'offline', 
            phone: '010-3456-7890' 
        }
    ],
    professionals: [
        {
            id: 'pro1',
            name: '개린이집 반포점',
            type: 'daycare',
            avatar: '🏫',
            contact: '02-1234-5678',
            manager: '김선생님',
            address: '서울 서초구 반포동 123'
        },
        {
            id: 'pro2',
            name: '24시 튼튼 동물병원',
            type: 'hospital',
            avatar: '🏥',
            contact: '02-5678-1234',
            manager: '박수의사',
            address: '서울 강남구 역삼동 456'
        }
    ]
};

// 타임라인 데이터
let timelineData = [
    {
        id: 1,
        type: RECORD_TYPES.MEAL,
        author: '김엄마',
        authorType: 'family',
        content: '아침 사료 완밥!',
        time: '오전 8:30',
        date: '2026-01-22',
        icon: '🍚',
        photos: []
    },
    {
        id: 2,
        type: RECORD_TYPES.REPORT,
        author: '개린이집 반포점',
        authorType: 'professional',
        content: '오늘 사회성 교육 시간에 친구들과 잘 놀았어요! 리더십이 보이네요 🐕',
        photos: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'],
        time: '오후 2:15',
        date: '2026-01-22',
        icon: '📝'
    },
    {
        id: 3,
        type: RECORD_TYPES.WALK,
        author: '김아빠',
        authorType: 'family',
        content: '한강공원 산책 30분',
        time: '오후 7:00',
        date: '2026-01-21',
        icon: '🚶',
        photos: []
    },
    {
        id: 4,
        type: RECORD_TYPES.PLAY,
        author: '김딸',
        authorType: 'family',
        content: '집에서 공놀이 했어요!',
        time: '오후 5:30',
        date: '2026-01-21',
        icon: '🎾',
        photos: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400']
    }
];

// 투약 데이터
let medicationData = [
    {
        id: 1,
        petName: '초코',
        petPhoto: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
        time: '13:00',
        timing: '점심 뒤',
        dosage: '1알',
        medicationName: '알러지약 (세티리진)',
        medicationPhoto: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
        instructions: '가루약은 츄르에 섞어주세요. 물을 충분히 제공해주세요.',
        specialNotes: '냉장 보관 필수',
        status: MEDICATION_STATUS.PENDING,
        requestedBy: '김엄마',
        requestedAt: '오전 9:00',
        assignedTo: '개린이집 반포점',
        date: '2026-01-22',
        priority: 'high'
    },
    {
        id: 2,
        petName: '초코',
        petPhoto: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
        time: '10:00',
        timing: '아침 식사 후',
        dosage: '2.5ml',
        medicationName: '영양제 (멀티비타민)',
        medicationPhoto: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
        instructions: '흔들어서 급여',
        specialNotes: '',
        status: MEDICATION_STATUS.COMPLETED,
        requestedBy: '김아빠',
        requestedAt: '어제',
        completedAt: '오전 10:05',
        completedBy: '김선생님',
        completionPhoto: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
        assignedTo: '개린이집 반포점',
        date: '2026-01-21',
        priority: 'normal'
    }
];

// 알림 데이터
let notificationData = [
    {
        id: 1,
        message: '초코가 점심 약을 먹을 시간이에요! 💊',
        type: NOTIFICATION_TYPES.MEDICATION,
        time: '12:50',
        read: false,
        timestamp: new Date('2026-01-22T12:50:00')
    },
    {
        id: 2,
        message: '김엄마님이 새 기록을 추가했습니다',
        type: NOTIFICATION_TYPES.INFO,
        time: '11:30',
        read: false,
        timestamp: new Date('2026-01-22T11:30:00')
    },
    {
        id: 3,
        message: '개린이집에서 새 일지를 작성했습니다',
        type: NOTIFICATION_TYPES.REPORT,
        time: '어제',
        read: true,
        timestamp: new Date('2026-01-21T14:15:00')
    }
];

// 전문가 통계 데이터
const professionalStats = {
    todayCheckins: 12,
    pendingTasks: 3,
    completedToday: 8,
    totalPets: 25
};

// 캘린더 이벤트 (날짜별로 그룹화)
let calendarEvents = {};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 * @param {Date|string} date - 포맷할 날짜
 * @returns {string} 포맷된 날짜 문자열
 */
function formatDate(date) {
    try {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Invalid date');
        }
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('날짜 포맷 오류:', error);
        return formatDate(new Date()); // 오류 시 오늘 날짜 반환
    }
}

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns {string} 오늘 날짜
 */
function getToday() {
    return formatDate(new Date());
}

/**
 * 현재 시간을 HH:MM 형식으로 반환
 * @returns {string} 현재 시간
 */
function getCurrentTime() {
    return new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    });
}

/**
 * 고유 ID 생성
 * @returns {number} 타임스탬프 기반 고유 ID
 */
function generateId() {
    return Date.now() + Math.random();
}

/**
 * 객체 깊은 복사
 * @param {Object} obj - 복사할 객체
 * @returns {Object} 복사된 객체
 */
function deepClone(obj) {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        console.error('객체 복사 오류:', error);
        return obj;
    }
}

/**
 * 타입별 아이콘 매핑
 * @param {string} type - 기록 타입
 * @returns {string} 아이콘 이모지
 */
function getIconForType(type) {
    const icons = {
        [RECORD_TYPES.MEAL]: '🍚',
        [RECORD_TYPES.WALK]: '🚶',
        [RECORD_TYPES.PLAY]: '🎾',
        [RECORD_TYPES.HEALTH]: '🏥',
        [RECORD_TYPES.MEDICATION]: '💊',
        [RECORD_TYPES.GROOMING]: '✂️',
        [RECORD_TYPES.REPORT]: '📝',
        [RECORD_TYPES.PHOTO]: '📷'
    };
    return icons[type] || '📝';
}

/**
 * 타입별 라벨 매핑
 * @param {string} type - 기록 타입
 * @returns {string} 한글 라벨
 */
function getTypeLabel(type) {
    const labels = {
        [RECORD_TYPES.MEAL]: '식사',
        [RECORD_TYPES.WALK]: '산책',
        [RECORD_TYPES.PLAY]: '놀이',
        [RECORD_TYPES.HEALTH]: '건강',
        [RECORD_TYPES.MEDICATION]: '투약',
        [RECORD_TYPES.GROOMING]: '미용',
        [RECORD_TYPES.REPORT]: '일지',
        [RECORD_TYPES.PHOTO]: '사진'
    };
    return labels[type] || '기록';
}

/**
 * 기본 반려동물 정보 가져오기
 * @returns {Object|null} 첫 번째 반려동물 정보
 */
function getDefaultPet() {
    return familyData.pets && familyData.pets.length > 0 ? familyData.pets[0] : null;
}

// ============================================
// 캘린더 관련 함수
// ============================================

/**
 * 타임라인 데이터를 캘린더 이벤트로 변환
 */
function updateCalendarEvents() {
    calendarEvents = {};
    timelineData.forEach(item => {
        if (item.date) {
            const dateKey = item.date;
            if (!calendarEvents[dateKey]) {
                calendarEvents[dateKey] = [];
            }
            calendarEvents[dateKey].push(item);
        }
    });
}

/**
 * 특정 날짜의 이벤트 가져오기
 * @param {string} date - YYYY-MM-DD 형식의 날짜
 * @returns {Array} 해당 날짜의 이벤트 배열
 */
function getEventsByDate(date) {
    return calendarEvents[date] || [];
}

// ============================================
// 타임라인 관련 함수
// ============================================

/**
 * 새 기록 추가
 * @param {Object} record - 추가할 기록 데이터
 * @returns {Object} 추가된 기록
 */
function addTimelineRecord(record) {
    try {
        if (!record || !record.type) {
            throw new Error('유효하지 않은 기록 데이터');
        }

        const newRecord = {
            id: generateId(),
            date: record.date || getToday(),
            time: record.time || getCurrentTime(),
            author: record.author || '나',
            authorType: record.authorType || 'family',
            type: record.type,
            content: record.content || '',
            icon: getIconForType(record.type),
            photos: Array.isArray(record.photos) ? record.photos : []
        };
        
        timelineData.unshift(newRecord);
        updateCalendarEvents();
        saveToLocalStorage();
        return deepClone(newRecord);
    } catch (error) {
        console.error('기록 추가 오류:', error);
        return null;
    }
}

/**
 * 특정 날짜의 기록 가져오기
 * @param {string} date - YYYY-MM-DD 형식의 날짜
 * @returns {Array} 해당 날짜의 기록 배열
 */
function getRecordsByDate(date) {
    return timelineData.filter(item => item.date === date);
}

/**
 * 최근 N개 기록 가져오기
 * @param {number} count - 가져올 기록 개수
 * @returns {Array} 최근 기록 배열
 */
function getRecentRecords(count = 5) {
    const validCount = Math.max(1, Math.min(count, 100)); // 1-100 사이로 제한
    return timelineData.slice(0, validCount);
}

/**
 * 기록 삭제
 * @param {number|string} recordId - 삭제할 기록 ID
 * @returns {boolean} 삭제 성공 여부
 */
function deleteTimelineRecord(recordId) {
    try {
        const index = timelineData.findIndex(item => item.id === recordId);
        if (index === -1) {
            throw new Error('기록을 찾을 수 없습니다');
        }
        timelineData.splice(index, 1);
        updateCalendarEvents();
        saveToLocalStorage();
        return true;
    } catch (error) {
        console.error('기록 삭제 오류:', error);
        return false;
    }
}

// ============================================
// 투약 관련 함수
// ============================================

/**
 * 새 투약 의뢰 추가
 * @param {Object} medication - 투약 정보
 * @returns {Object|null} 추가된 투약 정보
 */
function addMedication(medication) {
    try {
        if (!medication || !medication.medicationName) {
            throw new Error('유효하지 않은 투약 데이터');
        }

        const defaultPet = getDefaultPet();
        if (!defaultPet) {
            throw new Error('반려동물 정보를 찾을 수 없습니다');
        }

        const newMedication = {
            id: generateId(),
            petName: defaultPet.name,
            petPhoto: defaultPet.photo,
            status: MEDICATION_STATUS.PENDING,
            requestedBy: '나',
            requestedAt: getCurrentTime(),
            date: medication.date || getToday(),
            ...medication
        };
        
        medicationData.unshift(newMedication);
        
        // 타임라인에도 추가
        addTimelineRecord({
            type: RECORD_TYPES.MEDICATION,
            content: `${medication.timing || ''} ${medication.medicationName} 투약 의뢰 (${medication.dosage || ''})`,
            date: newMedication.date,
            photos: medication.medicationPhoto ? [medication.medicationPhoto] : []
        });
        
        // 알림 추가
        addNotification({
            message: `투약 의뢰가 ${medication.assignedTo || '전문가'}에 전송되었습니다`,
            type: NOTIFICATION_TYPES.MEDICATION
        });
        
        saveToLocalStorage();
        return deepClone(newMedication);
    } catch (error) {
        console.error('투약 추가 오류:', error);
        return null;
    }
}

/**
 * 투약 완료 처리
 * @param {number|string} medicationId - 투약 ID
 * @param {Object} completionData - 완료 데이터
 * @returns {Object|null} 업데이트된 투약 정보
 */
function completeMedication(medicationId, completionData = {}) {
    try {
        const medication = medicationData.find(m => m.id === medicationId);
        if (!medication) {
            throw new Error('투약 정보를 찾을 수 없습니다');
        }
        
        medication.status = MEDICATION_STATUS.COMPLETED;
        medication.completedAt = getCurrentTime();
        medication.completedBy = completionData.completedBy || '선생님';
        medication.completionPhoto = completionData.photo;
        medication.completionNote = completionData.note;
        
        // 타임라인 업데이트
        const timelineItem = timelineData.find(t => 
            t.type === RECORD_TYPES.MEDICATION && 
            t.content.includes(medication.medicationName) &&
            t.date === medication.date
        );
        
        if (timelineItem) {
            timelineItem.content = `${medication.medicationName} 투약 완료 ✓`;
            if (completionData.photo) {
                timelineItem.photos = [...(timelineItem.photos || []), completionData.photo];
            }
        }
        
        // 알림 추가
        addNotification({
            message: `${medication.petName}가 ${medication.timing || ''} ${medication.medicationName}을 씩씩하게 잘 먹었어요! 💊`,
            type: NOTIFICATION_TYPES.SUCCESS
        });
        
        updateCalendarEvents();
        saveToLocalStorage();
        return deepClone(medication);
    } catch (error) {
        console.error('투약 완료 처리 오류:', error);
        return null;
    }
}

/**
 * 대기중인 투약 가져오기
 * @returns {Array} 대기중인 투약 배열
 */
function getPendingMedications() {
    return medicationData.filter(m => m.status === MEDICATION_STATUS.PENDING);
}

/**
 * 완료된 투약 가져오기
 * @returns {Array} 완료된 투약 배열
 */
function getCompletedMedications() {
    return medicationData.filter(m => m.status === MEDICATION_STATUS.COMPLETED);
}

/**
 * 특정 날짜의 투약 가져오기
 * @param {string} date - YYYY-MM-DD 형식의 날짜
 * @returns {Array} 해당 날짜의 투약 배열
 */
function getMedicationsByDate(date) {
    return medicationData.filter(m => m.date === date);
}

// ============================================
// 알림 관련 함수
// ============================================

/**
 * 새 알림 추가
 * @param {Object} notification - 알림 데이터
 * @returns {Object|null} 추가된 알림
 */
function addNotification(notification) {
    try {
        if (!notification || !notification.message) {
            throw new Error('유효하지 않은 알림 데이터');
        }

        const newNotification = {
            id: generateId(),
            time: getCurrentTime(),
            timestamp: new Date(),
            read: false,
            type: notification.type || NOTIFICATION_TYPES.INFO,
            ...notification
        };
        
        notificationData.unshift(newNotification);
        saveToLocalStorage();
        updateNotificationBadge();
        return deepClone(newNotification);
    } catch (error) {
        console.error('알림 추가 오류:', error);
        return null;
    }
}

/**
 * 알림 읽음 처리
 * @param {number|string} notificationId - 알림 ID
 * @returns {boolean} 처리 성공 여부
 */
function markNotificationAsRead(notificationId) {
    try {
        const notification = notificationData.find(n => n.id === notificationId);
        if (!notification) {
            throw new Error('알림을 찾을 수 없습니다');
        }
        notification.read = true;
        saveToLocalStorage();
        updateNotificationBadge();
        return true;
    } catch (error) {
        console.error('알림 읽음 처리 오류:', error);
        return false;
    }
}

/**
 * 모든 알림 읽음 처리
 * @returns {boolean} 처리 성공 여부
 */
function markAllNotificationsAsRead() {
    try {
        notificationData.forEach(n => n.read = true);
        saveToLocalStorage();
        updateNotificationBadge();
        return true;
    } catch (error) {
        console.error('모든 알림 읽음 처리 오류:', error);
        return false;
    }
}

/**
 * 읽지 않은 알림 개수
 * @returns {number} 읽지 않은 알림 수
 */
function getUnreadNotificationCount() {
    return notificationData.filter(n => !n.read).length;
}

/**
 * 알림 배지 업데이트
 */
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        const count = getUnreadNotificationCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

/**
 * 알림 삭제
 * @param {number|string} notificationId - 알림 ID
 * @returns {boolean} 삭제 성공 여부
 */
function deleteNotification(notificationId) {
    try {
        const index = notificationData.findIndex(n => n.id === notificationId);
        if (index === -1) {
            throw new Error('알림을 찾을 수 없습니다');
        }
        notificationData.splice(index, 1);
        saveToLocalStorage();
        updateNotificationBadge();
        return true;
    } catch (error) {
        console.error('알림 삭제 오류:', error);
        return false;
    }
}

// ============================================
// 로컬 스토리지 관리
// ============================================

/**
 * 데이터 저장
 * @returns {boolean} 저장 성공 여부
 */
function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timelineData));
        localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medicationData));
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationData));
        localStorage.setItem(STORAGE_KEYS.USER_MODE, userMode);
        return true;
    } catch (error) {
        console.error('로컬 스토리지 저장 실패:', error);
        // 용량 초과 시 오래된 데이터 정리
        if (error.name === 'QuotaExceededError') {
            console.warn('스토리지 용량 초과, 오래된 데이터 정리 중...');
            cleanupOldData();
            // 재시도
            try {
                localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timelineData));
                localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medicationData));
                localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationData));
                return true;
            } catch (retryError) {
                console.error('재시도 실패:', retryError);
                return false;
            }
        }
        return false;
    }
}

/**
 * 데이터 불러오기
 * @returns {boolean} 불러오기 성공 여부
 */
function loadFromLocalStorage() {
    try {
        const savedTimeline = localStorage.getItem(STORAGE_KEYS.TIMELINE);
        const savedMedications = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
        const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        const savedUserMode = localStorage.getItem(STORAGE_KEYS.USER_MODE);
        
        if (savedTimeline) {
            timelineData = JSON.parse(savedTimeline);
            updateCalendarEvents();
        }
        
        if (savedMedications) {
            medicationData = JSON.parse(savedMedications);
        }
        
        if (savedNotifications) {
            notificationData = JSON.parse(savedNotifications);
        }
        
        if (savedUserMode && Object.values(USER_MODES).includes(savedUserMode)) {
            userMode = savedUserMode;
        }
        
        return true;
    } catch (error) {
        console.error('로컬 스토리지 불러오기 실패:', error);
        return false;
    }
}

/**
 * 오래된 데이터 정리 (30일 이상)
 */
function cleanupOldData() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = formatDate(thirtyDaysAgo);
        
        // 타임라인 정리
        timelineData = timelineData.filter(item => item.date >= cutoffDate);
        
        // 완료된 투약 정리
        medicationData = medicationData.filter(item => 
            item.status === MEDICATION_STATUS.PENDING || item.date >= cutoffDate
        );
        
        // 읽은 알림 정리
        notificationData = notificationData.filter(item => 
            !item.read || (item.timestamp && new Date(item.timestamp) >= thirtyDaysAgo)
        );
        
        updateCalendarEvents();
        console.log('오래된 데이터 정리 완료');
    } catch (error) {
        console.error('데이터 정리 오류:', error);
    }
}

/**
 * 데이터 초기화 (개발용)
 * @returns {boolean} 초기화 여부
 */
function resetAllData() {
    if (confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        try {
            localStorage.clear();
            location.reload();
            return true;
        } catch (error) {
            console.error('데이터 초기화 오류:', error);
            return false;
        }
    }
    return false;
}

// ============================================
// 사용자 모드 관리
// ============================================

/**
 * 사용자 모드 토글
 * @returns {string} 변경된 모드
 */
function toggleUserMode() {
    userMode = userMode === USER_MODES.FAMILY ? USER_MODES.PROFESSIONAL : USER_MODES.FAMILY;
    saveToLocalStorage();
    return userMode;
}

/**
 * 현재 사용자 모드 반환
 * @returns {string} 현재 모드
 */
function getUserMode() {
    return userMode;
}

/**
 * 전문가 모드 여부 확인
 * @returns {boolean} 전문가 모드 여부
 */
function isProfessionalMode() {
    return userMode === USER_MODES.PROFESSIONAL;
}

// ============================================
// 초기화
// ============================================

// 초기 캘린더 이벤트 생성
updateCalendarEvents();

// 페이지 로드 시 저장된 데이터 불러오기
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        loadFromLocalStorage();
        updateNotificationBadge();
    });
}

// ============================================
// 전역 API 노출
// ============================================

if (typeof window !== 'undefined') {
    window.barabomData = {
        // 상수
        USER_MODES,
        RECORD_TYPES,
        MEDICATION_STATUS,
        NOTIFICATION_TYPES,
        
        // 데이터
        familyData,
        get timelineData() { return [...timelineData]; },
        get medicationData() { return [...medicationData]; },
        get notificationData() { return [...notificationData]; },
        professionalStats,
        get calendarEvents() { return deepClone(calendarEvents); },
        
        // 타임라인 함수
        addTimelineRecord,
        getRecordsByDate,
        getRecentRecords,
        deleteTimelineRecord,
        
        // 투약 함수
        addMedication,
        completeMedication,
        getPendingMedications,
        getCompletedMedications,
        getMedicationsByDate,
        
        // 알림 함수
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        getUnreadNotificationCount,
        updateNotificationBadge,
        deleteNotification,
        
        // 캘린더 함수
        updateCalendarEvents,
        getEventsByDate,
        
        // 유틸리티
        getIconForType,
        getTypeLabel,
        formatDate,
        getToday,
        getCurrentTime,
        getDefaultPet,
        
        // 스토리지
        saveToLocalStorage,
        loadFromLocalStorage,
        resetAllData,
        cleanupOldData,
        
        // 사용자 모드
        toggleUserMode,
        getUserMode,
        isProfessionalMode
    };
}
