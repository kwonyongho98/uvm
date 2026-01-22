/* ============================================
   리펫 - 또래 비교 리포트
   같은 견종, 나이의 강아지 데이터 비교 분석
   ============================================ */

'use strict';

// ============================================
// 전역 상태 관리
// ============================================

const PeerReportManager = {
    currentPet: null,
    peerData: null,
    comparisonData: null
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
 * 백분위 계산
 */
function calculatePercentile(value, mean, stdDev) {
    const z = (value - mean) / stdDev;
    const percentile = Math.round((1 - (1 / (1 + Math.exp(1.7 * z)))) * 100);
    return Math.max(1, Math.min(99, percentile));
}

// ============================================
// 또래 데이터 생성
// ============================================

/**
 * 또래 비교 데이터 생성
 */
function generatePeerData() {
    const pet = window.barabomData?.familyData?.pets?.[0];
    if (!pet) return null;
    
    // 현재 반려견 데이터
    const petWeight = parseFloat(pet.weight) || 5.2;
    const petAge = parseInt(pet.age) || 3;
    
    // 견종별 평균 데이터 (닥스훈트 기준)
    const breedAverages = {
        '푸들': { weight: 4.8, walkPerMonth: 15, playTime: 45 },
        '닥스훈트': { weight: 7.5, walkPerMonth: 12, playTime: 40 },
        '시츄': { weight: 6.0, walkPerMonth: 10, playTime: 35 },
        '말티즈': { weight: 3.5, walkPerMonth: 18, playTime: 50 },
        '포메라니안': { weight: 3.0, walkPerMonth: 20, playTime: 55 }
    };
    
    const breedAvg = breedAverages[pet.breed] || breedAverages['푸들'];
    
    // 활동량 계산 (최근 30일)
    const recentRecords = window.barabomData?.timelineData || [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const walkCount = recentRecords.filter(r => 
        r.type === 'walk' && new Date(r.date) >= thirtyDaysAgo
    ).length;
    
    const playCount = recentRecords.filter(r => 
        r.type === 'play' && new Date(r.date) >= thirtyDaysAgo
    ).length;
    
    // 비교 데이터 생성
    PeerReportManager.currentPet = {
        name: pet.name,
        breed: pet.breed,
        age: petAge,
        weight: petWeight,
        walkPerMonth: walkCount,
        playCount: playCount
    };
    
    PeerReportManager.peerData = {
        avgWeight: breedAvg.weight,
        avgWalkPerMonth: breedAvg.walkPerMonth,
        avgPlayTime: breedAvg.playTime,
        totalPeers: Math.floor(Math.random() * 500) + 1000 // 1000-1500
    };
    
    // 백분위 계산
    const weightPercentile = calculatePercentile(petWeight, breedAvg.weight, 0.8);
    const activityPercentile = calculatePercentile(walkCount, breedAvg.walkPerMonth, 5);
    
    PeerReportManager.comparisonData = {
        weight: {
            value: petWeight,
            average: breedAvg.weight,
            difference: petWeight - breedAvg.weight,
            percentile: weightPercentile,
            status: getWeightStatus(petWeight, breedAvg.weight)
        },
        activity: {
            value: walkCount,
            average: breedAvg.walkPerMonth,
            difference: walkCount - breedAvg.walkPerMonth,
            percentile: activityPercentile,
            status: getActivityStatus(activityPercentile)
        },
        health: {
            vaccineStatus: 'up-to-date',
            lastCheckup: '2주 전',
            score: 85 + Math.floor(Math.random() * 10)
        }
    };
    
    return PeerReportManager.comparisonData;
}

/**
 * 체중 상태 평가
 */
function getWeightStatus(current, average) {
    const diff = current - average;
    const percentage = (diff / average) * 100;
    
    if (percentage > 15) return { label: '과체중 주의', color: 'warning', icon: '⚠️' };
    if (percentage > 5) return { label: '평균보다 약간 높음', color: 'caution', icon: '📊' };
    if (percentage < -15) return { label: '저체중 주의', color: 'warning', icon: '⚠️' };
    if (percentage < -5) return { label: '평균보다 약간 낮음', color: 'caution', icon: '📊' };
    return { label: '정상 범위', color: 'good', icon: '✅' };
}

/**
 * 활동량 상태 평가
 */
function getActivityStatus(percentile) {
    if (percentile >= 80) return { label: '매우 활발', color: 'excellent', icon: '🌟' };
    if (percentile >= 60) return { label: '활발', color: 'good', icon: '👍' };
    if (percentile >= 40) return { label: '보통', color: 'normal', icon: '😊' };
    if (percentile >= 20) return { label: '부족', color: 'caution', icon: '💤' };
    return { label: '매우 부족', color: 'warning', icon: '⚠️' };
}

// ============================================
// 리포트 미리보기 업데이트
// ============================================

/**
 * 홈 화면 리포트 미리보기 업데이트
 */
function updatePeerReportPreview() {
    try {
        const data = generatePeerData();
        if (!data) return;
        
        // 활동량 바
        const activityBar = document.getElementById('activityBar');
        if (activityBar) {
            activityBar.style.width = `${data.activity.percentile}%`;
        }
        
        // 체중 바
        const weightBar = document.getElementById('weightBar');
        if (weightBar) {
            const weightPercent = Math.min(100, Math.max(0, 50 + (data.weight.difference / data.weight.average) * 50));
            weightBar.style.width = `${weightPercent}%`;
        }
        
    } catch (error) {
        console.error('리포트 미리보기 업데이트 오류:', error);
    }
}

// ============================================
// 또래 비교 리포트 모달
// ============================================

/**
 * 또래 비교 리포트 모달 열기
 */
function openPeerReportModal() {
    try {
        const data = generatePeerData();
        if (!data) {
            showToast('반려견 정보를 불러올 수 없습니다');
            return;
        }
        
        const modal = createPeerReportModal(data);
        showModal(modal);
        
    } catch (error) {
        console.error('리포트 모달 열기 오류:', error);
        showToast('리포트를 열 수 없습니다');
    }
}

/**
 * 또래 비교 리포트 모달 HTML 생성
 */
function createPeerReportModal(data) {
    const pet = PeerReportManager.currentPet;
    const peer = PeerReportManager.peerData;
    
    return `
        <div class="modal peer-modal" id="peerReportModal" role="dialog" aria-labelledby="peerModalTitle" aria-modal="true">
            <div class="modal-overlay" onclick="closePeerReport()" aria-hidden="true"></div>
            <div class="modal-content peer-content">
                <div class="modal-header peer-header">
                    <h3 id="peerModalTitle">📊 또래 비교 리포트</h3>
                    <button class="modal-close" 
                            onclick="closePeerReport()"
                            aria-label="리포트 닫기">×</button>
                </div>
                
                <div class="modal-body peer-body">
                    <!-- 기본 정보 -->
                    <div class="peer-intro">
                        <p class="peer-intro-text">
                            <strong>${escapeHtml(pet.name)}</strong>와 같은 <strong>${escapeHtml(pet.breed)}</strong>, 
                            <strong>${pet.age}살</strong> 강아지 <strong>${peer.totalPeers.toLocaleString()}마리</strong>의 
                            데이터를 비교했어요
                        </p>
                    </div>
                    
                    <!-- 체중 비교 -->
                    <section class="comparison-section">
                        <div class="section-header">
                            <h4 class="comparison-title">
                                ${data.weight.status.icon} 체중
                            </h4>
                            <span class="status-badge ${data.weight.status.color}">
                                ${escapeHtml(data.weight.status.label)}
                            </span>
                        </div>
                        
                        <div class="comparison-stats">
                            <div class="stat-box mine">
                                <span class="stat-label">${escapeHtml(pet.name)}</span>
                                <span class="stat-value">${data.weight.value}kg</span>
                            </div>
                            <div class="stat-divider">vs</div>
                            <div class="stat-box peer">
                                <span class="stat-label">또래 평균</span>
                                <span class="stat-value">${data.weight.average}kg</span>
                            </div>
                        </div>
                        
                        <div class="percentile-bar">
                            <div class="percentile-fill" style="width: ${data.weight.percentile}%"></div>
                        </div>
                        <p class="percentile-text">상위 ${100 - data.weight.percentile}%</p>
                        
                        <div class="insight-box">
                            <p class="insight-icon">💡</p>
                            <div class="insight-content">
                                <p class="insight-title">인사이트</p>
                                <p class="insight-text">
                                    ${generateWeightInsight(data.weight)}
                                </p>
                            </div>
                        </div>
                    </section>
                    
                    <!-- 활동량 비교 -->
                    <section class="comparison-section">
                        <div class="section-header">
                            <h4 class="comparison-title">
                                ${data.activity.status.icon} 활동량
                            </h4>
                            <span class="status-badge ${data.activity.status.color}">
                                ${escapeHtml(data.activity.status.label)}
                            </span>
                        </div>
                        
                        <div class="comparison-stats">
                            <div class="stat-box mine">
                                <span class="stat-label">${escapeHtml(pet.name)}</span>
                                <span class="stat-value">${data.activity.value}회/월</span>
                            </div>
                            <div class="stat-divider">vs</div>
                            <div class="stat-box peer">
                                <span class="stat-label">또래 평균</span>
                                <span class="stat-value">${data.activity.average}회/월</span>
                            </div>
                        </div>
                        
                        <div class="percentile-bar">
                            <div class="percentile-fill activity" style="width: ${data.activity.percentile}%"></div>
                        </div>
                        <p class="percentile-text">상위 ${100 - data.activity.percentile}%</p>
                        
                        <div class="insight-box">
                            <p class="insight-icon">💡</p>
                            <div class="insight-content">
                                <p class="insight-title">인사이트</p>
                                <p class="insight-text">
                                    ${generateActivityInsight(data.activity)}
                                </p>
                            </div>
                        </div>
                    </section>
                    
                    <!-- 건강 점수 -->
                    <section class="comparison-section">
                        <div class="section-header">
                            <h4 class="comparison-title">
                                ❤️ 전체 건강 점수
                            </h4>
                        </div>
                        
                        <div class="health-score-container">
                            <div class="health-score-circle">
                                <svg viewBox="0 0 100 100" class="health-circle-svg">
                                    <circle cx="50" cy="50" r="45" class="health-circle-bg"></circle>
                                    <circle cx="50" cy="50" r="45" class="health-circle-fill"
                                            style="stroke-dasharray: ${data.health.score * 2.827}, 283"></circle>
                                </svg>
                                <div class="health-score-text">
                                    <span class="health-score-number">${data.health.score}</span>
                                    <span class="health-score-max">/100</span>
                                </div>
                            </div>
                            <div class="health-details">
                                <div class="health-item">
                                    <span class="health-label">예방접종</span>
                                    <span class="health-value good">✓ 최신</span>
                                </div>
                                <div class="health-item">
                                    <span class="health-label">마지막 검진</span>
                                    <span class="health-value">${data.health.lastCheckup}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <!-- 추천 -->
                    <section class="recommendation-section">
                        <h4 class="recommendation-title">🎯 맞춤 추천</h4>
                        ${generateRecommendations(data)}
                    </section>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closePeerReport()">닫기</button>
                    <button class="btn-primary" onclick="shareReport()">
                        📤 공유하기
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * 체중 인사이트 생성
 */
function generateWeightInsight(weightData) {
    const diff = weightData.difference;
    const pet = PeerReportManager.currentPet;
    
    if (diff > 1) {
        return `${pet.name}는 또래보다 ${diff.toFixed(1)}kg 더 나가요. 관절 건강을 위해 체중 관리가 필요할 수 있어요. 수의사와 상담을 권장합니다.`;
    } else if (diff > 0.3) {
        return `${pet.name}는 또래보다 조금 더 나가지만 정상 범위예요. 현재 체중을 유지하는 것이 좋겠어요.`;
    } else if (diff < -1) {
        return `${pet.name}는 또래보다 ${Math.abs(diff).toFixed(1)}kg 덜 나가요. 영양 상태를 확인해보는 것이 좋겠어요.`;
    } else {
        return `${pet.name}는 또래와 비슷한 체중을 유지하고 있어요. 건강한 상태입니다!`;
    }
}

/**
 * 활동량 인사이트 생성
 */
function generateActivityInsight(activityData) {
    const percentile = activityData.percentile;
    const pet = PeerReportManager.currentPet;
    
    if (percentile >= 80) {
        return `${pet.name}는 또래보다 훨씬 활발해요! 상위 ${100 - percentile}%에 속합니다. 충분한 운동으로 건강을 잘 유지하고 있어요.`;
    } else if (percentile >= 60) {
        return `${pet.name}는 또래보다 활발한 편이에요. 이대로 꾸준히 운동시켜주세요!`;
    } else if (percentile >= 40) {
        return `${pet.name}는 평균적인 활동량을 보이고 있어요. 조금 더 산책을 늘리면 더 좋겠어요.`;
    } else {
        return `${pet.name}는 또래보다 활동량이 부족해요. 하루 30분씩 산책을 늘려보는 것은 어떨까요?`;
    }
}

/**
 * 맞춤 추천 생성
 */
function generateRecommendations(data) {
    const recommendations = [];
    
    // 체중 관련 추천
    if (data.weight.difference > 0.5) {
        recommendations.push({
            icon: '🥗',
            title: '다이어트 사료',
            description: '관절 건강을 위한 체중 관리용 사료',
            link: '#'
        });
    }
    
    // 활동량 관련 추천
    if (data.activity.percentile < 50) {
        recommendations.push({
            icon: '🎾',
            title: '실내 놀이 장난감',
            description: '집에서도 충분한 활동량 보장',
            link: '#'
        });
    }
    
    // 관절 관련 추천
    if (data.weight.difference > 0.3) {
        recommendations.push({
            icon: '💊',
            title: '관절 영양제',
            description: '관절 건강을 위한 글루코사민 함유',
            link: '#'
        });
    }
    
    // 기본 추천
    recommendations.push({
        icon: '🏥',
        title: '정기 건강검진',
        description: '6개월마다 정기 검진 권장',
        link: '#'
    });
    
    if (recommendations.length === 0) {
        return '<p class="no-recommendations">현재 건강 상태가 양호합니다! 👍</p>';
    }
    
    return recommendations.map(rec => `
        <div class="recommendation-item">
            <span class="rec-icon">${rec.icon}</span>
            <div class="rec-content">
                <p class="rec-title">${escapeHtml(rec.title)}</p>
                <p class="rec-description">${escapeHtml(rec.description)}</p>
            </div>
            <button class="rec-btn" onclick="handleRecommendationClick('${rec.title}')">
                보기
            </button>
        </div>
    `).join('');
}

/**
 * 추천 클릭 핸들러
 */
function handleRecommendationClick(title) {
    showToast(`"${title}" 기능은 곧 추가됩니다 🎁`);
}

/**
 * 리포트 공유
 */
function shareReport() {
    try {
        const pet = PeerReportManager.currentPet;
        const data = PeerReportManager.comparisonData;
        
        const shareText = `${pet.name}의 또래 비교 리포트\n\n` +
                         `체중: ${data.weight.value}kg (또래 평균 ${data.weight.average}kg)\n` +
                         `활동량: 상위 ${100 - data.activity.percentile}%\n` +
                         `건강 점수: ${data.health.score}/100\n\n` +
                         `리펫에서 확인하세요!`;
        
        if (navigator.share) {
            navigator.share({
                title: `${pet.name}의 또래 비교 리포트`,
                text: shareText
            }).catch(err => {
                console.log('공유 취소:', err);
            });
        } else {
            // 클립보드에 복사
            navigator.clipboard.writeText(shareText).then(() => {
                showToast('리포트가 클립보드에 복사되었습니다 📋');
            }).catch(() => {
                showToast('공유 기능을 사용할 수 없습니다');
            });
        }
        
    } catch (error) {
        console.error('리포트 공유 오류:', error);
        showToast('공유에 실패했습니다');
    }
}

/**
 * 리포트 모달 닫기
 */
function closePeerReport() {
    try {
        const modal = document.getElementById('peerReportModal');
        if (modal) {
            modal.remove();
        }
    } catch (error) {
        console.error('리포트 닫기 오류:', error);
    }
}

// ============================================
// 초기화
// ============================================

/**
 * 또래 비교 시스템 초기화
 */
function initPeerReportSystem() {
    try {
        console.log('📊 또래 비교 시스템 초기화 중...');
        
        // 데이터 생성
        generatePeerData();
        
        // 미리보기 업데이트
        updatePeerReportPreview();
        
        // 스타일 추가
        addPeerReportStyles();
        
        console.log('✅ 또래 비교 시스템 초기화 완료');
    } catch (error) {
        console.error('또래 비교 시스템 초기화 오류:', error);
    }
}

// ============================================
// 페이지 로드 시 초기화
// ============================================

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initPeerReportSystem);
}

// ============================================
// 전역 API 노출
// ============================================

if (typeof window !== 'undefined') {
    window.PeerReport = {
        open: openPeerReportModal,
        close: closePeerReport,
        update: updatePeerReportPreview,
        generate: generatePeerData
    };
}

// ============================================
// 스타일 추가
// ============================================

function addPeerReportStyles() {
    if (document.getElementById('peerReportStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'peerReportStyles';
    styles.textContent = `
    /* 또래 비교 프리뷰 */
    .peer-stats-preview {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .peer-stat-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .peer-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #4a5568;
        min-width: 60px;
    }
    
    .peer-bar {
        flex: 1;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .peer-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        border-radius: 4px;
        transition: width 0.5s ease;
    }
    
    .peer-fill.warning {
        background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
    }
    
    .peer-value {
        font-size: 0.75rem;
        font-weight: 600;
        color: #059669;
        min-width: 80px;
        text-align: right;
    }
    
    .view-report-btn {
        background: none;
        border: none;
        color: #ff6b35;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .view-report-btn:hover {
        color: #ff5722;
        transform: scale(1.05);
    }
    
    /* 리포트 모달 */
    .peer-modal .peer-content {
        max-width: 600px;
    }
    
    .peer-header {
        background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
        color: white;
    }
    
    .peer-body {
        max-height: 70vh;
        overflow-y: auto;
    }
    
    .peer-intro {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 1.5rem;
        border-radius: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .peer-intro-text {
        font-size: 0.9375rem;
        line-height: 1.6;
        color: #2d3748;
    }
    
    .comparison-section {
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .comparison-section:last-child {
        border-bottom: none;
    }
    
    .comparison-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .status-badge {
        font-size: 0.75rem;
        padding: 4px 12px;
        border-radius: 12px;
        font-weight: 600;
    }
    
    .status-badge.good {
        background: #d1fae5;
        color: #065f46;
    }
    
    .status-badge.excellent {
        background: #dbeafe;
        color: #1e40af;
    }
    
    .status-badge.normal {
        background: #e5e7eb;
        color: #374151;
    }
    
    .status-badge.caution {
        background: #fef3c7;
        color: #92400e;
    }
    
    .status-badge.warning {
        background: #fee2e2;
        color: #991b1b;
    }
    
    .comparison-stats {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 1.5rem 0;
    }
    
    .stat-box {
        flex: 1;
        padding: 1.25rem;
        border-radius: 1rem;
        text-align: center;
    }
    
    .stat-box.mine {
        background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
        color: white;
    }
    
    .stat-box.peer {
        background: #f3f4f6;
        color: #374151;
    }
    
    .stat-label {
        display: block;
        font-size: 0.75rem;
        margin-bottom: 0.5rem;
        opacity: 0.9;
    }
    
    .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
    }
    
    .stat-divider {
        font-size: 0.875rem;
        font-weight: 600;
        color: #9ca3af;
    }
    
    .percentile-bar {
        width: 100%;
        height: 12px;
        background: #e5e7eb;
        border-radius: 6px;
        overflow: hidden;
        margin-top: 1rem;
    }
    
    .percentile-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        border-radius: 6px;
        transition: width 0.8s ease;
    }
    
    .percentile-fill.activity {
        background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
    }
    
    .percentile-text {
        font-size: 0.875rem;
        color: #6b7280;
        margin-top: 0.5rem;
        text-align: right;
    }
    
    .insight-box {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: #fffbeb;
        border-left: 4px solid #f59e0b;
        border-radius: 0.5rem;
        margin-top: 1.5rem;
    }
    
    .insight-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
    }
    
    .insight-content {
        flex: 1;
    }
    
    .insight-title {
        font-size: 0.875rem;
        font-weight: 700;
        color: #92400e;
        margin-bottom: 0.25rem;
    }
    
    .insight-text {
        font-size: 0.875rem;
        line-height: 1.6;
        color: #78350f;
    }
    
    .health-score-container {
        display: flex;
        gap: 2rem;
        align-items: center;
        padding: 1.5rem;
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border-radius: 1rem;
        margin-top: 1rem;
    }
    
    .health-score-circle {
        position: relative;
        width: 120px;
        height: 120px;
        flex-shrink: 0;
    }
    
    .health-circle-svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
    }
    
    .health-circle-bg {
        fill: none;
        stroke: #e5e7eb;
        stroke-width: 8;
    }
    
    .health-circle-fill {
        fill: none;
        stroke: #10b981;
        stroke-width: 8;
        stroke-linecap: round;
        transition: stroke-dasharray 1s ease;
    }
    
    .health-score-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
    }
    
    .health-score-number {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        color: #10b981;
    }
    
    .health-score-max {
        font-size: 0.875rem;
        color: #6b7280;
    }
    
    .health-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .health-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .health-label {
        font-size: 0.875rem;
        color: #6b7280;
    }
    
    .health-value {
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
    }
    
    .health-value.good {
        color: #059669;
    }
    
    .recommendation-section {
        background: #f9fafb;
        padding: 1.5rem;
        border-radius: 1rem;
    }
    
    .recommendation-title {
        font-size: 1rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 1rem;
    }
    
    .recommendation-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: white;
        border-radius: 0.75rem;
        margin-bottom: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .rec-icon {
        font-size: 2rem;
        flex-shrink: 0;
    }
    
    .rec-content {
        flex: 1;
        min-width: 0;
    }
    
    .rec-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 0.125rem;
    }
    
    .rec-description {
        font-size: 0.75rem;
        color: #6b7280;
    }
    
    .rec-btn {
        background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }
    
    .rec-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    }
    
    /* 반응형 */
    @media (max-width: 480px) {
        .comparison-stats {
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .stat-box {
            width: 100%;
        }
        
        .stat-divider {
            display: none;
        }
        
        .health-score-container {
            flex-direction: column;
            gap: 1.5rem;
        }
    }
    `;
    
    document.head.appendChild(styles);
}
