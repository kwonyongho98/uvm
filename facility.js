/* ============================================
   리펫 - 애견 시설 예약
   유치원/호텔/훈련소 검색, 예약, 결제
   ============================================ */

'use strict';

// ============================================
// 전역 상태 관리
// ============================================

const FacilityManager = {
    selectedRegion: null,
    selectedDistrict: null,
    selectedType: null,
    selectedFacility: null,
    selectedDate: null,
    selectedTime: null,
    selectedService: null
};

// ============================================
// 지역 데이터
// ============================================

const REGIONS = {
    '서울': ['강남구', '서초구', '송파구', '강동구', '마포구', '용산구', '성동구', '광진구'],
    '경기': ['수원시', '성남시', '용인시', '안양시', '부천시', '광명시', '평택시', '과천시'],
    '인천': ['남동구', '연수구', '부평구', '계양구', '서구', '중구'],
    '부산': ['해운대구', '수영구', '동래구', '부산진구', '연제구']
};

// ============================================
// 시설 데이터 (데모)
// ============================================

const FACILITIES = [
    {
        id: 1,
        name: '행복한 애견 유치원',
        type: 'daycare',
        region: '서울',
        district: '강남구',
        address: '서울 강남구 테헤란로 123',
        phone: '02-1234-5678',
        rating: 4.8,
        reviewCount: 245,
        photo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
        description: '전문 훈련사가 상주하는 프리미엄 애견 유치원입니다.',
        services: [
            { name: '하루 돌봄', price: 35000, duration: '1일' },
            { name: '반나절 돌봄', price: 20000, duration: '4시간' },
            { name: '사회성 교육', price: 50000, duration: '1회' }
        ],
        facilities: ['실내 놀이터', '야외 운동장', 'CCTV', '1:1 케어'],
        hours: '09:00 - 19:00',
        availableTimes: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
    },
    {
        id: 2,
        name: '스위트홈 애견호텔',
        type: 'hotel',
        region: '서울',
        district: '강남구',
        address: '서울 강남구 선릉로 456',
        phone: '02-2345-6789',
        rating: 4.9,
        reviewCount: 189,
        photo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
        description: '24시간 케어 시스템으로 안심하고 맡기실 수 있습니다.',
        services: [
            { name: '1박 2일', price: 50000, duration: '1박' },
            { name: '주말 패키지', price: 140000, duration: '2박 3일' },
            { name: '장기 할인', price: 300000, duration: '7박' }
        ],
        facilities: ['개별 룸', '24시간 CCTV', '놀이시간', '산책 서비스'],
        hours: '24시간',
        availableTimes: ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
    },
    {
        id: 3,
        name: '프로 도그 트레이닝',
        type: 'training',
        region: '서울',
        district: '강남구',
        address: '서울 강남구 논현로 789',
        phone: '02-3456-7890',
        rating: 4.7,
        reviewCount: 156,
        photo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
        description: '15년 경력의 전문 훈련사가 직접 교육합니다.',
        services: [
            { name: '기본 훈련 (4주)', price: 400000, duration: '4주' },
            { name: '문제 행동 교정', price: 500000, duration: '6주' },
            { name: '1:1 개인 레슨', price: 80000, duration: '1회' }
        ],
        facilities: ['전문 훈련장', '개별 케이지', '행동 분석'],
        hours: '10:00 - 18:00',
        availableTimes: ['10:00', '11:00', '14:00', '15:00', '16:00']
    },
    {
        id: 4,
        name: '러블리 펫 유치원',
        type: 'daycare',
        region: '서울',
        district: '서초구',
        address: '서울 서초구 반포대로 321',
        phone: '02-4567-8901',
        rating: 4.6,
        reviewCount: 198,
        photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
        description: '소형견 전문 유치원으로 세심한 케어가 특징입니다.',
        services: [
            { name: '하루 돌봄', price: 30000, duration: '1일' },
            { name: '주 3회 패키지', price: 80000, duration: '주' },
            { name: '월 정기권', price: 280000, duration: '월' }
        ],
        facilities: ['실내 놀이방', 'CCTV', '간식 제공', '목욕 서비스'],
        hours: '08:00 - 20:00',
        availableTimes: ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00']
    }
];

// ============================================
// 리뷰 데이터 (데모)
// ============================================

const REVIEWS = {
    1: [
        {
            id: 1,
            author: '김**',
            rating: 5,
            date: '2026-01-20',
            content: '선생님들이 정말 친절하시고 아이가 너무 좋아해요! 매일 가고 싶어합니다 ㅎㅎ',
            photos: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400']
        },
        {
            id: 2,
            author: '이**',
            rating: 5,
            date: '2026-01-18',
            content: 'CCTV로 실시간 확인할 수 있어서 안심됩니다. 강력 추천!',
            photos: []
        },
        {
            id: 3,
            author: '박**',
            rating: 4,
            date: '2026-01-15',
            content: '시설도 깨끗하고 좋아요. 가격이 조금 비싼 편이긴 한데 그만한 가치가 있습니다.',
            photos: []
        }
    ],
    2: [
        {
            id: 4,
            author: '최**',
            rating: 5,
            date: '2026-01-19',
            content: '여행 갔다 와서 아이가 스트레스 없이 잘 있었다고 하니 다행이에요!',
            photos: []
        }
    ],
    3: [
        {
            id: 5,
            author: '정**',
            rating: 5,
            date: '2026-01-17',
            content: '문제 행동이 많았는데 4주만에 정말 많이 좋아졌어요. 전문가시네요!',
            photos: []
        }
    ],
    4: [
        {
            id: 6,
            author: '강**',
            rating: 4,
            date: '2026-01-16',
            content: '소형견 전문이라 그런지 세심하게 봐주세요. 만족합니다!',
            photos: []
        }
    ]
};

// ============================================
// 유틸리티 함수
// ============================================

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatPrice(price) {
    return price.toLocaleString('ko-KR') + '원';
}

// ============================================
// 시설 검색 화면
// ============================================

/**
 * 시설 검색 화면 렌더링
 */
function renderFacilitySearch() {
    const container = document.getElementById('facilityContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="facility-search-container">
            <h2 class="facility-main-title">🏠 애견 시설 찾기</h2>
            
            <!-- 지역 선택 -->
            <div class="search-section">
                <h3 class="search-section-title">지역 선택</h3>
                <div class="region-grid">
                    ${Object.keys(REGIONS).map(region => `
                        <button class="region-btn ${FacilityManager.selectedRegion === region ? 'active' : ''}"
                                onclick="selectRegion('${region}')">
                            ${region}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <!-- 구/시 선택 -->
            ${FacilityManager.selectedRegion ? `
                <div class="search-section">
                    <h3 class="search-section-title">구/시 선택</h3>
                    <div class="district-grid">
                        ${REGIONS[FacilityManager.selectedRegion].map(district => `
                            <button class="district-btn ${FacilityManager.selectedDistrict === district ? 'active' : ''}"
                                    onclick="selectDistrict('${district}')">
                                ${district}
                            </button>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- 시설 유형 선택 -->
            ${FacilityManager.selectedDistrict ? `
                <div class="search-section">
                    <h3 class="search-section-title">시설 유형</h3>
                    <div class="type-grid">
                        <button class="type-btn ${FacilityManager.selectedType === 'daycare' ? 'active' : ''}"
                                onclick="selectType('daycare')">
                            🏫 유치원
                        </button>
                        <button class="type-btn ${FacilityManager.selectedType === 'hotel' ? 'active' : ''}"
                                onclick="selectType('hotel')">
                            🏨 호텔
                        </button>
                        <button class="type-btn ${FacilityManager.selectedType === 'training' ? 'active' : ''}"
                                onclick="selectType('training')">
                            🎓 훈련소
                        </button>
                    </div>
                </div>
            ` : ''}
            
            <!-- 검색 결과 -->
            <div id="searchResults"></div>
        </div>
    `;
    
    if (FacilityManager.selectedType) {
        renderSearchResults();
    }
}

/**
 * 지역 선택
 */
function selectRegion(region) {
    FacilityManager.selectedRegion = region;
    FacilityManager.selectedDistrict = null;
    FacilityManager.selectedType = null;
    renderFacilitySearch();
}

/**
 * 구/시 선택
 */
function selectDistrict(district) {
    FacilityManager.selectedDistrict = district;
    FacilityManager.selectedType = null;
    renderFacilitySearch();
}

/**
 * 시설 유형 선택
 */
function selectType(type) {
    FacilityManager.selectedType = type;
    renderFacilitySearch();
}

/**
 * 검색 결과 렌더링
 */
function renderSearchResults() {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    const filtered = FACILITIES.filter(f => 
        f.region === FacilityManager.selectedRegion &&
        f.district === FacilityManager.selectedDistrict &&
        f.type === FacilityManager.selectedType
    );
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <p>검색 결과가 없습니다</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="search-section">
            <h3 class="search-section-title">검색 결과 (${filtered.length})</h3>
            <div class="facility-list">
                ${filtered.map(facility => `
                    <div class="facility-card" onclick="viewFacilityDetail(${facility.id})">
                        <img src="${facility.photo}" 
                             alt="${escapeHtml(facility.name)}"
                             class="facility-photo"
                             onerror="this.src='https://via.placeholder.com/600x400?text=Facility'">
                        <div class="facility-card-content">
                            <h4 class="facility-name">${escapeHtml(facility.name)}</h4>
                            <div class="facility-rating">
                                <span class="rating-stars">⭐ ${facility.rating}</span>
                                <span class="rating-count">(${facility.reviewCount})</span>
                            </div>
                            <p class="facility-address">${escapeHtml(facility.address)}</p>
                            <p class="facility-description">${escapeHtml(facility.description)}</p>
                            <div class="facility-price">
                                ${formatPrice(facility.services[0].price)}~
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============================================
// 시설 상세 화면
// ============================================

/**
 * 시설 상세 보기
 */
function viewFacilityDetail(facilityId) {
    const facility = FACILITIES.find(f => f.id === facilityId);
    if (!facility) return;
    
    FacilityManager.selectedFacility = facility;
    
    const container = document.getElementById('facilityContent');
    if (!container) return;
    
    const reviews = REVIEWS[facilityId] || [];
    
    container.innerHTML = `
        <div class="facility-detail-container">
            <button class="back-btn" onclick="renderFacilitySearch()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                뒤로
            </button>
            
            <img src="${facility.photo}" 
                 alt="${escapeHtml(facility.name)}"
                 class="facility-detail-photo"
                 onerror="this.src='https://via.placeholder.com/600x400?text=Facility'">
            
            <div class="facility-detail-header">
                <h2 class="facility-detail-name">${escapeHtml(facility.name)}</h2>
                <div class="facility-rating">
                    <span class="rating-stars">⭐ ${facility.rating}</span>
                    <span class="rating-count">(${facility.reviewCount}개 리뷰)</span>
                </div>
            </div>
            
            <div class="facility-info-section">
                <h3 class="info-section-title">📍 기본 정보</h3>
                <p class="info-item">📍 ${escapeHtml(facility.address)}</p>
                <p class="info-item">📞 ${escapeHtml(facility.phone)}</p>
                <p class="info-item">🕐 ${escapeHtml(facility.hours)}</p>
            </div>
            
            <div class="facility-info-section">
                <h3 class="info-section-title">📝 소개</h3>
                <p class="info-description">${escapeHtml(facility.description)}</p>
            </div>
            
            <div class="facility-info-section">
                <h3 class="info-section-title">✨ 시설 및 서비스</h3>
                <div class="facility-tags">
                    ${facility.facilities.map(f => `
                        <span class="facility-tag">✓ ${escapeHtml(f)}</span>
                    `).join('')}
                </div>
            </div>
            
            <div class="facility-info-section">
                <h3 class="info-section-title">💰 서비스 및 가격</h3>
                <div class="service-list">
                    ${facility.services.map(service => `
                        <div class="service-item">
                            <div class="service-info">
                                <p class="service-name">${escapeHtml(service.name)}</p>
                                <p class="service-duration">${escapeHtml(service.duration)}</p>
                            </div>
                            <p class="service-price">${formatPrice(service.price)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="facility-info-section">
                <h3 class="info-section-title">💬 리뷰 (${reviews.length})</h3>
                <div class="review-list">
                    ${reviews.length > 0 ? reviews.map(review => `
                        <div class="review-item">
                            <div class="review-header">
                                <span class="review-author">${escapeHtml(review.author)}</span>
                                <span class="review-rating">⭐ ${review.rating}</span>
                            </div>
                            <p class="review-date">${review.date}</p>
                            <p class="review-content">${escapeHtml(review.content)}</p>
                            ${review.photos.length > 0 ? `
                                <div class="review-photos">
                                    ${review.photos.map(photo => `
                                        <img src="${photo}" 
                                             alt="리뷰 사진"
                                             class="review-photo"
                                             onerror="this.style.display='none'">
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('') : '<p class="no-reviews">아직 리뷰가 없습니다</p>'}
                </div>
            </div>
            
            <div class="facility-cta">
                ${facility.type === 'training' ? `
                    <button class="cta-btn-secondary" onclick="showToast('준비 중입니다')">
                        📞 전화 상담
                    </button>
                    <button class="cta-btn-primary" onclick="openBookingModal()">
                        📅 방문 예약하기
                    </button>
                ` : `
                    <button class="cta-btn-primary full" onclick="openBookingModal()">
                        📅 예약하기
                    </button>
                `}
            </div>
        </div>
    `;
}

// ============================================
// 예약 프로세스
// ============================================

/**
 * 예약 모달 열기
 */
function openBookingModal() {
    const facility = FacilityManager.selectedFacility;
    if (!facility) return;
    
    const modal = `
        <div class="modal" id="bookingModal">
            <div class="modal-overlay" onclick="closeBookingModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📅 예약하기</h3>
                    <button class="modal-close" onclick="closeBookingModal()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="booking-step">
                        <h4 class="booking-step-title">1. 날짜 선택</h4>
                        <input type="date" 
                               id="bookingDate" 
                               class="input-field"
                               min="${new Date().toISOString().split('T')[0]}"
                               onchange="selectBookingDate(this.value)">
                    </div>
                    
                    <div id="timeSelection" class="booking-step hidden">
                        <h4 class="booking-step-title">2. 시간 선택</h4>
                        <div class="time-grid" id="timeGrid"></div>
                    </div>
                    
                    <div id="serviceSelection" class="booking-step hidden">
                        <h4 class="booking-step-title">3. 서비스 선택</h4>
                        <div class="service-selection-list" id="serviceList"></div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeBookingModal()">취소</button>
                    <button class="btn-primary" 
                            id="confirmBookingBtn"
                            onclick="proceedToPayment()"
                            disabled>
                        결제하기
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal(modal);
}

/**
 * 날짜 선택
 */
function selectBookingDate(date) {
    FacilityManager.selectedDate = date;
    FacilityManager.selectedTime = null;
    FacilityManager.selectedService = null;
    
    // 시간 선택 표시
    const timeSection = document.getElementById('timeSelection');
    const timeGrid = document.getElementById('timeGrid');
    
    if (timeSection && timeGrid) {
        timeSection.classList.remove('hidden');
        
        const facility = FacilityManager.selectedFacility;
        timeGrid.innerHTML = facility.availableTimes.map(time => `
            <button class="time-btn" onclick="selectBookingTime('${time}')">
                ${time}
            </button>
        `).join('');
    }
    
    document.getElementById('serviceSelection')?.classList.add('hidden');
    document.getElementById('confirmBookingBtn').disabled = true;
}

/**
 * 시간 선택
 */
function selectBookingTime(time) {
    FacilityManager.selectedTime = time;
    FacilityManager.selectedService = null;
    
    // 모든 시간 버튼 비활성화
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 시간 버튼 활성화
    event.target.classList.add('active');
    
    // 서비스 선택 표시
    const serviceSection = document.getElementById('serviceSelection');
    const serviceList = document.getElementById('serviceList');
    
    if (serviceSection && serviceList) {
        serviceSection.classList.remove('hidden');
        
        const facility = FacilityManager.selectedFacility;
        serviceList.innerHTML = facility.services.map((service, index) => `
            <div class="service-selection-item" onclick="selectService(${index})">
                <div class="service-selection-info">
                    <p class="service-selection-name">${escapeHtml(service.name)}</p>
                    <p class="service-selection-duration">${escapeHtml(service.duration)}</p>
                </div>
                <p class="service-selection-price">${formatPrice(service.price)}</p>
            </div>
        `).join('');
    }
    
    document.getElementById('confirmBookingBtn').disabled = true;
}

/**
 * 서비스 선택
 */
function selectService(index) {
    const facility = FacilityManager.selectedFacility;
    FacilityManager.selectedService = facility.services[index];
    
    // 모든 서비스 항목 비활성화
    document.querySelectorAll('.service-selection-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 선택된 서비스 활성화
    event.currentTarget.classList.add('active');
    
    document.getElementById('confirmBookingBtn').disabled = false;
}

/**
 * 결제 진행
 */
function proceedToPayment() {
    const facility = FacilityManager.selectedFacility;
    const service = FacilityManager.selectedService;
    
    if (!facility || !service || !FacilityManager.selectedDate || !FacilityManager.selectedTime) {
        showToast('모든 항목을 선택해주세요');
        return;
    }
    
    closeBookingModal();
    openPaymentModal();
}

/**
 * 결제 모달 열기
 */
function openPaymentModal() {
    const facility = FacilityManager.selectedFacility;
    const service = FacilityManager.selectedService;
    
    const modal = `
        <div class="modal" id="paymentModal">
            <div class="modal-overlay" onclick="closePaymentModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>💳 결제하기</h3>
                    <button class="modal-close" onclick="closePaymentModal()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="payment-summary">
                        <h4>예약 정보</h4>
                        <div class="summary-item">
                            <span>시설</span>
                            <span>${escapeHtml(facility.name)}</span>
                        </div>
                        <div class="summary-item">
                            <span>서비스</span>
                            <span>${escapeHtml(service.name)}</span>
                        </div>
                        <div class="summary-item">
                            <span>날짜</span>
                            <span>${FacilityManager.selectedDate}</span>
                        </div>
                        <div class="summary-item">
                            <span>시간</span>
                            <span>${FacilityManager.selectedTime}</span>
                        </div>
                        <div class="summary-total">
                            <span>총 결제 금액</span>
                            <span class="total-price">${formatPrice(service.price)}</span>
                        </div>
                    </div>
                    
                    <div class="payment-methods">
                        <h4>결제 수단</h4>
                        <button class="payment-method-btn" onclick="processPayment('kakaopay')">
                            💛 카카오페이
                        </button>
                        <button class="payment-method-btn" onclick="processPayment('naverpay')">
                            💚 네이버페이
                        </button>
                        <button class="payment-method-btn" onclick="processPayment('card')">
                            💳 신용/체크카드
                        </button>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closePaymentModal()">취소</button>
                </div>
            </div>
        </div>
    `;
    
    showModal(modal);
}

/**
 * 결제 처리 (데모)
 */
function processPayment(method) {
    showToast('결제 처리 중...');
    
    setTimeout(() => {
        closePaymentModal();
        showSuccessModal();
    }, 1500);
}

/**
 * 예약 완료 모달
 */
function showSuccessModal() {
    const facility = FacilityManager.selectedFacility;
    const service = FacilityManager.selectedService;
    
    const modal = `
        <div class="modal" id="successModal">
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-body" style="text-align: center; padding: 2rem;">
                    <div class="success-icon">✅</div>
                    <h3 style="margin: 1rem 0;">예약이 완료되었습니다!</h3>
                    <div class="success-info">
                        <p>${escapeHtml(facility.name)}</p>
                        <p>${FacilityManager.selectedDate} ${FacilityManager.selectedTime}</p>
                        <p>${escapeHtml(service.name)} - ${formatPrice(service.price)}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary full" onclick="closeSuccessModal()">
                        확인
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal(modal);
    
    // 알림 추가
    if (window.barabomData?.addNotification) {
        window.barabomData.addNotification({
            message: `${facility.name} 예약이 완료되었습니다`,
            type: 'success'
        });
    }
}

/**
 * 모달 닫기 함수들
 */
function closeBookingModal() {
    document.getElementById('bookingModal')?.remove();
}

function closePaymentModal() {
    document.getElementById('paymentModal')?.remove();
}

function closeSuccessModal() {
    document.getElementById('successModal')?.remove();
    renderFacilitySearch();
}

// ============================================
// 초기화
// ============================================

function initFacilitySystem() {
    console.log('🏠 시설 예약 시스템 초기화');
    renderFacilitySearch();
    addFacilityStyles();
}

// ============================================
// 전역 API 노출
// ============================================

if (typeof window !== 'undefined') {
    window.FacilitySystem = {
        init: initFacilitySystem,
        render: renderFacilitySearch
    };
}

// ============================================
// 스타일 추가
// ============================================

function addFacilityStyles() {
    if (document.getElementById('facilityStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'facilityStyles';
    styles.textContent = `
    .facility-search-container,
    .facility-detail-container {
        padding-bottom: 2rem;
    }
    
    .facility-main-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        color: #ff6b35;
    }
    
    .search-section {
        margin-bottom: 1.5rem;
    }
    
    .search-section-title {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        color: #1f2937;
    }
    
    .region-grid,
    .district-grid,
    .type-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
    }
    
    .region-btn,
    .district-btn,
    .type-btn {
        padding: 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        background: white;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .region-btn:hover,
    .district-btn:hover,
    .type-btn:hover {
        border-color: #ff6b35;
        background: #fff7ed;
    }
    
    .region-btn.active,
    .district-btn.active,
    .type-btn.active {
        border-color: #ff6b35;
        background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
        color: white;
    }
    
    .facility-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .facility-card {
        background: white;
        border-radius: 1rem;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .facility-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
    
    .facility-photo {
        width: 100%;
        height: 200px;
        object-fit: cover;
    }
    
    .facility-card-content {
        padding: 1rem;
    }
    
    .facility-name {
        font-size: 1.125rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    
    .facility-rating {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }
    
    .rating-stars {
        font-size: 0.875rem;
        font-weight: 600;
        color: #f59e0b;
    }
    
    .rating-count {
        font-size: 0.75rem;
        color: #6b7280;
    }
    
    .facility-address {
        font-size: 0.75rem;
        color: #6b7280;
        margin-bottom: 0.5rem;
    }
    
    .facility-description {
        font-size: 0.875rem;
        color: #4b5563;
        margin-bottom: 0.75rem;
        line-height: 1.5;
    }
    
    .facility-price {
        font-size: 1rem;
        font-weight: 700;
        color: #ff6b35;
    }
    
    .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: #f3f4f6;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 1rem;
        transition: all 0.2s;
    }
    
    .back-btn:hover {
        background: #e5e7eb;
    }
    
    .facility-detail-photo {
        width: 100%;
        height: 250px;
        object-fit: cover;
        border-radius: 1rem;
        margin-bottom: 1rem;
    }
    
    .facility-detail-header {
        margin-bottom: 1.5rem;
    }
    
    .facility-detail-name {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    
    .facility-info-section {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 0.75rem;
    }
    
    .info-section-title {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        color: #1f2937;
    }
    
    .info-item {
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
        color: #4b5563;
    }
    
    .info-description {
        font-size: 0.875rem;
        line-height: 1.6;
        color: #4b5563;
    }
    
    .facility-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .facility-tag {
        background: #fff;
        border: 1px solid #e5e7eb;
        padding: 0.5rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .service-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .service-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: white;
        border-radius: 0.75rem;
    }
    
    .service-name {
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }
    
    .service-duration {
        font-size: 0.75rem;
        color: #6b7280;
    }
    
    .service-price {
        font-size: 1rem;
        font-weight: 700;
        color: #ff6b35;
    }
    
    .review-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .review-item {
        padding: 1rem;
        background: white;
        border-radius: 0.75rem;
    }
    
    .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .review-author {
        font-size: 0.875rem;
        font-weight: 600;
    }
    
    .review-rating {
        font-size: 0.75rem;
        color: #f59e0b;
    }
    
    .review-date {
        font-size: 0.75rem;
        color: #6b7280;
        margin-bottom: 0.5rem;
    }
    
    .review-content {
        font-size: 0.875rem;
        line-height: 1.6;
        color: #4b5563;
    }
    
    .review-photos {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }
    
    .review-photo {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 0.5rem;
    }
    
    .facility-cta {
        position: sticky;
        bottom: 0;
        background: white;
        padding: 1rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 0.75rem;
        margin: 0 -1rem -1rem;
    }
    
    .cta-btn-primary,
    .cta-btn-secondary {
        flex: 1;
        padding: 1rem;
        border: none;
        border-radius: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .cta-btn-primary.full {
        flex: auto;
    }
    
    .cta-btn-primary {
        background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
        color: white;
    }
    
    .cta-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    }
    
    .cta-btn-secondary {
        background: white;
        color: #ff6b35;
        border: 2px solid #ff6b35;
    }
    
    .cta-btn-secondary:hover {
        background: #fff7ed;
    }
    
    .booking-step {
        margin-bottom: 1.5rem;
    }
    
    .booking-step-title {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
    }
    
    .time-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
    }
    
    .time-btn {
        padding: 0.75rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.5rem;
        background: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .time-btn:hover {
        border-color: #ff6b35;
        background: #fff7ed;
    }
    
    .time-btn.active {
        border-color: #ff6b35;
        background: #ff6b35;
        color: white;
    }
    
    .service-selection-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .service-selection-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .service-selection-item:hover {
        border-color: #ff6b35;
        background: #fff7ed;
    }
    
    .service-selection-item.active {
        border-color: #ff6b35;
        background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    }
    
    .service-selection-name {
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }
    
    .service-selection-duration {
        font-size: 0.75rem;
        color: #6b7280;
    }
    
    .service-selection-price {
        font-size: 1rem;
        font-weight: 700;
        color: #ff6b35;
    }
    
    .payment-summary {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 0.75rem;
        margin-bottom: 1.5rem;
    }
    
    .payment-summary h4 {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }
    
    .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        font-size: 0.875rem;
    }
    
    .summary-total {
        display: flex;
        justify-content: space-between;
        padding-top: 1rem;
        border-top: 2px solid #e5e7eb;
        font-weight: 700;
        margin-top: 1rem;
    }
    
    .total-price {
        font-size: 1.25rem;
        color: #ff6b35;
    }
    
    .payment-methods h4 {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }
    
    .payment-method-btn {
        width: 100%;
        padding: 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        background: white;
        font-weight: 700;
        cursor: pointer;
        margin-bottom: 0.75rem;
        transition: all 0.2s;
        text-align: left;
    }
    
    .payment-method-btn:hover {
        border-color: #ff6b35;
        background: #fff7ed;
        transform: translateX(4px);
    }
    
    .success-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    
    .success-info {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 0.75rem;
        margin-top: 1rem;
    }
    
    .success-info p {
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
    }
    
    .no-results,
    .no-reviews {
        text-align: center;
        padding: 3rem 1rem;
        color: #6b7280;
    }
    
    .no-results svg {
        margin: 0 auto 1rem;
        color: #d1d5db;
    }
    
    @media (max-width: 480px) {
        .time-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    `;
    
    document.head.appendChild(styles);
}
