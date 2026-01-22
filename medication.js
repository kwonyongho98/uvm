/* ============================================
   바라봄 - 투약 의뢰 시스템
   투약 의뢰 작성, 관리, 완료 처리
   ============================================ */

'use strict';

// ============================================
// 상태 관리
// ============================================

const MedicationManager = {
    selectedPhoto: '',
    selectedTiming: '점심 뒤',
    selectedDosage: '1알',
    selectedPriority: 'normal',
    completionPhoto: '',
    currentMedicationId: null
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
 * 폼 유효성 검사
 */
function validateMedicationForm() {
    const errors = [];
    
    if (!MedicationManager.selectedPhoto) {
        errors.push('약 사진을 업로드해주세요');
    }
    
    const medicationName = document.getElementById('medicationName')?.value.trim();
    if (!medicationName) {
        errors.push('약 이름을 입력해주세요');
    }
    
    const time = document.getElementById('medicationTime')?.value;
    if (!time) {
        errors.push('투약 시간을 선택해주세요');
    }
    
    const assignedTo = document.getElementById('assignedTo')?.value;
    if (!assignedTo) {
        errors.push('담당 전문가를 선택해주세요');
    }
    
    return errors;
}

// ============================================
// 투약 의뢰 모달
// ============================================

/**
 * 투약 의뢰 모달 열기
 */
function openMedicationModal() {
    try {
        const modal = createMedicationRequestModal();
        showModal(modal);
        
        // 기본값 설정
        setTimeout(() => {
            selectTiming(MedicationManager.selectedTiming);
            selectDosage(MedicationManager.selectedDosage);
            selectPriority(MedicationManager.selectedPriority);
        }, 100);
    } catch (error) {
        console.error('투약 모달 열기 오류:', error);
        showToast('투약 의뢰를 열 수 없습니다');
    }
}

/**
 * 투약 의뢰 모달 HTML 생성
 */
function createMedicationRequestModal() {
    const pet = window.barabomData?.familyData?.pets?.[0];
    const professionals = window.barabomData?.familyData?.professionals || [];
    const today = window.barabomData?.getToday() || '';
    
    if (!pet) {
        throw new Error('반려동물 정보를 찾을 수 없습니다');
    }
    
    return `
        <div class="modal" id="medicationModal" role="dialog" aria-labelledby="medicationModalTitle" aria-modal="true">
            <div class="modal-overlay" onclick="closeMedicationModal()" aria-hidden="true"></div>
            <div class="modal-content" style="max-height: 90vh;">
                <div class="modal-header">
                    <h3 id="medicationModalTitle">💊 ${escapeHtml(pet.name)}의 투약 의뢰</h3>
                    <button class="modal-close" 
                            onclick="closeMedicationModal()" 
                            aria-label="투약 의뢰 닫기">×</button>
                </div>
                
                <div class="modal-body">
                    <!-- 지난번 의뢰서 불러오기 -->
                    <button type="button" 
                            class="btn-load-previous" 
                            onclick="loadPreviousMedication()"
                            aria-label="이전 투약 의뢰서 불러오기">
                        ⚡ 지난번 의뢰서 불러오기
                    </button>
                    
                    <!-- 약 사진 (필수) -->
                    <div class="form-group">
                        <label class="required">약 사진 (필수)</label>
                        <p class="form-hint">오투약 방지를 위해 필수입니다</p>
                        <div id="medicationPhotoPreview" class="medication-photo-preview">
                            ${createPhotoUploadButton('약 사진 촬영하기', 'uploadMedicationPhoto')}
                        </div>
                    </div>
                    
                    <!-- 약 이름 -->
                    <div class="form-group">
                        <label for="medicationName" class="required">약 이름 (필수)</label>
                        <input type="text" 
                               id="medicationName" 
                               class="input-field" 
                               placeholder="예: 알러지약 (세티리진)"
                               aria-required="true"
                               maxlength="100">
                    </div>
                    
                    <!-- 투약 시간 & 날짜 -->
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label for="medicationTime" class="required">투약 시간</label>
                            <input type="time" 
                                   id="medicationTime" 
                                   class="input-field"
                                   aria-required="true">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="medicationDate">날짜</label>
                            <input type="date" 
                                   id="medicationDate" 
                                   class="input-field" 
                                   value="${today}">
                        </div>
                    </div>
                    
                    <!-- 투약 타이밍 -->
                    <div class="form-group">
                        <label>어느 때?</label>
                        <div class="timing-buttons" 
                             id="timingButtons" 
                             role="radiogroup" 
                             aria-label="투약 타이밍 선택">
                            ${['점심 뒤', '아침 식사 후', '오후 4시', '간식과 함께', '저녁 식사 후', '자기 전'].map(timing => `
                                <button type="button" 
                                        class="timing-btn" 
                                        onclick="selectTiming('${escapeHtml(timing)}')"
                                        role="radio"
                                        aria-checked="false"
                                        data-timing="${escapeHtml(timing)}">
                                    ${escapeHtml(timing)}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 복용량 -->
                    <div class="form-group">
                        <label>복용량</label>
                        <div class="dosage-grid" role="radiogroup" aria-label="복용량 선택">
                            ${['0.5알', '1알', '2알', '1ml', '2.5ml', '5ml', '가루약 1포', '가루약 2포', '직접입력'].map(dosage => `
                                <button type="button" 
                                        class="dosage-btn" 
                                        onclick="selectDosage('${escapeHtml(dosage)}')"
                                        role="radio"
                                        aria-checked="false"
                                        data-dosage="${escapeHtml(dosage)}">
                                    ${escapeHtml(dosage)}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 담당 전문가 -->
                    <div class="form-group">
                        <label for="assignedTo" class="required">담당 전문가</label>
                        <select id="assignedTo" 
                                class="input-field" 
                                aria-required="true">
                            <option value="">선택해주세요</option>
                            ${professionals.map(pro => `
                                <option value="${escapeHtml(pro.name)}">${escapeHtml(pro.name)}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- 급여 방법 및 주의사항 -->
                    <div class="form-group">
                        <label for="medicationInstructions">급여 방법 및 주의사항</label>
                        <textarea id="medicationInstructions" 
                                  class="input-field" 
                                  rows="3"
                                  maxlength="500"
                                  placeholder="예: 가루약은 츄르에 섞어주세요"></textarea>
                    </div>
                    
                    <!-- 특이사항 -->
                    <div class="form-group">
                        <label for="medicationNotes">특이사항</label>
                        <input type="text" 
                               id="medicationNotes" 
                               class="input-field" 
                               placeholder="예: 냉장 보관 필수"
                               maxlength="100">
                    </div>
                    
                    <!-- 우선순위 -->
                    <div class="form-group">
                        <label>우선순위</label>
                        <div class="priority-buttons" role="radiogroup" aria-label="우선순위 선택">
                            <button type="button" 
                                    class="priority-btn" 
                                    data-priority="high" 
                                    onclick="selectPriority('high')"
                                    role="radio"
                                    aria-checked="false">
                                🔴 긴급
                            </button>
                            <button type="button" 
                                    class="priority-btn active" 
                                    data-priority="normal" 
                                    onclick="selectPriority('normal')"
                                    role="radio"
                                    aria-checked="true">
                                🟢 보통
                            </button>
                            <button type="button" 
                                    class="priority-btn" 
                                    data-priority="low" 
                                    onclick="selectPriority('low')"
                                    role="radio"
                                    aria-checked="false">
                                ⚪ 낮음
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeMedicationModal()">취소</button>
                    <button class="btn-primary" onclick="submitMedicationRequest()">
                        📤 선생님께 전달하기
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * 사진 업로드 버튼 HTML 생성
 */
function createPhotoUploadButton(text, onClick) {
    return `
        <button type="button" 
                class="photo-upload-btn" 
                onclick="${onClick}()"
                aria-label="${escapeHtml(text)}">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
            </svg>
            <span>${escapeHtml(text)}</span>
        </button>
    `;
}

// ============================================
// 사진 관리
// ============================================

/**
 * 투약 사진 업로드 (데모)
 */
function uploadMedicationPhoto() {
    try {
        const demoPhotos = [
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
            'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
            'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400'
        ];
        
        MedicationManager.selectedPhoto = demoPhotos[Math.floor(Math.random() * demoPhotos.length)];
        
        const preview = document.getElementById('medicationPhotoPreview');
        if (preview) {
            preview.innerHTML = createPhotoPreview(MedicationManager.selectedPhoto, '약 사진', 'removeMedicationPhoto');
        }
        
        showToast('사진이 업로드되었습니다 ✓');
    } catch (error) {
        console.error('사진 업로드 오류:', error);
        showToast('사진 업로드에 실패했습니다');
    }
}

/**
 * 투약 사진 제거
 */
function removeMedicationPhoto() {
    try {
        MedicationManager.selectedPhoto = '';
        const preview = document.getElementById('medicationPhotoPreview');
        if (preview) {
            preview.innerHTML = createPhotoUploadButton('약 사진 촬영하기', 'uploadMedicationPhoto');
        }
    } catch (error) {
        console.error('사진 제거 오류:', error);
    }
}

/**
 * 완료 사진 업로드 (데모)
 */
function uploadCompletionPhoto() {
    try {
        const demoPhotos = [
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
            'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'
        ];
        
        MedicationManager.completionPhoto = demoPhotos[Math.floor(Math.random() * demoPhotos.length)];
        
        const preview = document.getElementById('completionPhotoPreview');
        if (preview) {
            preview.innerHTML = createPhotoPreview(MedicationManager.completionPhoto, '완료 사진', 'removeCompletionPhoto');
        }
        
        showToast('사진이 업로드되었습니다 ✓');
    } catch (error) {
        console.error('완료 사진 업로드 오류:', error);
        showToast('사진 업로드에 실패했습니다');
    }
}

/**
 * 완료 사진 제거
 */
function removeCompletionPhoto() {
    try {
        MedicationManager.completionPhoto = '';
        const preview = document.getElementById('completionPhotoPreview');
        if (preview) {
            preview.innerHTML = createPhotoUploadButton('투약 완료 사진 촬영', 'uploadCompletionPhoto');
        }
    } catch (error) {
        console.error('완료 사진 제거 오류:', error);
    }
}

/**
 * 사진 프리뷰 HTML 생성
 */
function createPhotoPreview(photoUrl, altText, removeFunction) {
    return `
        <div class="photo-preview-item">
            <img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(altText)}">
            <button type="button" 
                    class="photo-remove-btn" 
                    onclick="${removeFunction}()"
                    aria-label="사진 제거">×</button>
        </div>
    `;
}

// ============================================
// 선택 관리
// ============================================

/**
 * 타이밍 선택
 */
function selectTiming(timing) {
    try {
        MedicationManager.selectedTiming = timing;
        document.querySelectorAll('.timing-btn').forEach(btn => {
            const isSelected = btn.getAttribute('data-timing') === timing;
            btn.classList.toggle('active', isSelected);
            btn.setAttribute('aria-checked', isSelected.toString());
        });
    } catch (error) {
        console.error('타이밍 선택 오류:', error);
    }
}

/**
 * 복용량 선택
 */
function selectDosage(dosage) {
    try {
        if (dosage === '직접입력') {
            const custom = prompt('복용량을 입력해주세요:');
            if (custom && custom.trim()) {
                MedicationManager.selectedDosage = custom.trim();
                showToast(`복용량: ${custom.trim()}`);
            }
            return;
        }
        
        MedicationManager.selectedDosage = dosage;
        document.querySelectorAll('.dosage-btn').forEach(btn => {
            const isSelected = btn.getAttribute('data-dosage') === dosage;
            btn.classList.toggle('active', isSelected);
            btn.setAttribute('aria-checked', isSelected.toString());
        });
    } catch (error) {
        console.error('복용량 선택 오류:', error);
    }
}

/**
 * 우선순위 선택
 */
function selectPriority(priority) {
    try {
        MedicationManager.selectedPriority = priority;
        document.querySelectorAll('.priority-btn').forEach(btn => {
            const isSelected = btn.getAttribute('data-priority') === priority;
            btn.classList.toggle('active', isSelected);
            btn.setAttribute('aria-checked', isSelected.toString());
        });
    } catch (error) {
        console.error('우선순위 선택 오류:', error);
    }
}

// ============================================
// 이전 의뢰서 불러오기
// ============================================

/**
 * 이전 투약 의뢰서 불러오기
 */
function loadPreviousMedication() {
    try {
        const completedMeds = window.barabomData?.getCompletedMedications?.() || [];
        
        if (completedMeds.length === 0) {
            showToast('이전 투약 기록이 없습니다');
            return;
        }
        
        const lastMed = completedMeds[0];
        
        // 필드 채우기
        const nameField = document.getElementById('medicationName');
        const timeField = document.getElementById('medicationTime');
        const instructionsField = document.getElementById('medicationInstructions');
        const notesField = document.getElementById('medicationNotes');
        const assignedToField = document.getElementById('assignedTo');
        
        if (nameField) nameField.value = lastMed.medicationName || '';
        if (timeField) timeField.value = lastMed.time || '';
        if (instructionsField) instructionsField.value = lastMed.instructions || '';
        if (notesField) notesField.value = lastMed.specialNotes || '';
        if (assignedToField) assignedToField.value = lastMed.assignedTo || '';
        
        // 선택 항목 복원
        if (lastMed.timing) selectTiming(lastMed.timing);
        if (lastMed.dosage) selectDosage(lastMed.dosage);
        
        // 사진 복원
        if (lastMed.medicationPhoto) {
            MedicationManager.selectedPhoto = lastMed.medicationPhoto;
            const preview = document.getElementById('medicationPhotoPreview');
            if (preview) {
                preview.innerHTML = createPhotoPreview(lastMed.medicationPhoto, '약 사진', 'removeMedicationPhoto');
            }
        }
        
        showToast('이전 의뢰서를 불러왔습니다 ⚡');
    } catch (error) {
        console.error('이전 의뢰서 불러오기 오류:', error);
        showToast('의뢰서를 불러올 수 없습니다');
    }
}

// ============================================
// 투약 의뢰 제출
// ============================================

/**
 * 투약 의뢰 제출
 */
function submitMedicationRequest() {
    try {
        // 유효성 검사
        const errors = validateMedicationForm();
        if (errors.length > 0) {
            showToast(errors[0]);
            return;
        }
        
        const medicationName = document.getElementById('medicationName').value.trim();
        const time = document.getElementById('medicationTime').value;
        const date = document.getElementById('medicationDate').value;
        const assignedTo = document.getElementById('assignedTo').value;
        const instructions = document.getElementById('medicationInstructions')?.value.trim() || '';
        const specialNotes = document.getElementById('medicationNotes')?.value.trim() || '';
        
        const medication = {
            time,
            timing: MedicationManager.selectedTiming,
            dosage: MedicationManager.selectedDosage,
            medicationName,
            medicationPhoto: MedicationManager.selectedPhoto,
            instructions,
            specialNotes,
            assignedTo,
            date,
            priority: MedicationManager.selectedPriority
        };
        
        const result = window.barabomData?.addMedication(medication);
        
        if (result) {
            resetMedicationForm();
            closeMedicationModal();
            
            if (typeof renderHomeScreen === 'function') {
                renderHomeScreen();
            }
            
            showToast('투약 의뢰가 전송되었습니다 📤');
        } else {
            throw new Error('투약 의뢰 추가 실패');
        }
    } catch (error) {
        console.error('투약 의뢰 제출 오류:', error);
        showToast('투약 의뢰 전송에 실패했습니다');
    }
}

/**
 * 폼 초기화
 */
function resetMedicationForm() {
    MedicationManager.selectedPhoto = '';
    MedicationManager.selectedTiming = '점심 뒤';
    MedicationManager.selectedDosage = '1알';
    MedicationManager.selectedPriority = 'normal';
}

/**
 * 투약 의뢰 모달 닫기
 */
function closeMedicationModal() {
    try {
        const modal = document.getElementById('medicationModal');
        if (modal) {
            modal.remove();
        }
        resetMedicationForm();
    } catch (error) {
        console.error('모달 닫기 오류:', error);
    }
}

// ============================================
// 투약 상세 (전문가용)
// ============================================

/**
 * 투약 상세 모달 열기
 */
function openMedicationDetail() {
    try {
        const pendingMeds = window.barabomData?.getPendingMedications?.() || [];
        
        if (pendingMeds.length === 0) {
            showToast('대기중인 투약이 없습니다');
            return;
        }
        
        showMedicationDetailModal(pendingMeds[0]);
    } catch (error) {
        console.error('투약 상세 열기 오류:', error);
        showToast('투약 정보를 불러올 수 없습니다');
    }
}

/**
 * 투약 상세 모달 HTML 생성 및 표시
 */
function showMedicationDetailModal(medication) {
    if (!medication) return;
    
    MedicationManager.currentMedicationId = medication.id;
    
    const modal = `
        <div class="modal" id="medicationDetailModal" role="dialog" aria-labelledby="detailModalTitle" aria-modal="true">
            <div class="modal-overlay" onclick="closeMedicationDetailModal()" aria-hidden="true"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="detailModalTitle">💊 투약 확인</h3>
                    <button class="modal-close" 
                            onclick="closeMedicationDetailModal()"
                            aria-label="투약 확인 닫기">×</button>
                </div>
                
                <div class="modal-body">
                    <!-- 반려견 정보 -->
                    <div class="medication-pet-info">
                        <img src="${escapeHtml(medication.petPhoto)}" 
                             alt="${escapeHtml(medication.petName)}">
                        <div>
                            <h4>${escapeHtml(medication.petName)}</h4>
                            <p>${escapeHtml(medication.requestedBy)} 보호자님</p>
                        </div>
                    </div>
                    
                    <!-- 약 사진 -->
                    <div class="medication-photo-large">
                        <img src="${escapeHtml(medication.medicationPhoto)}" 
                             alt="약 사진">
                    </div>
                    
                    <!-- 투약 정보 -->
                    <div class="medication-info-box">
                        <div class="info-row">
                            <span class="info-label">약 이름</span>
                            <span class="info-value">${escapeHtml(medication.medicationName)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">시간</span>
                            <span class="info-value">${escapeHtml(medication.time)} (${escapeHtml(medication.timing)})</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">복용량</span>
                            <span class="info-value">${escapeHtml(medication.dosage)}</span>
                        </div>
                        ${medication.priority === 'high' ? `
                            <div class="priority-alert" role="alert">
                                🔴 긴급 투약입니다
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- 주의사항 -->
                    ${medication.instructions ? `
                        <div class="instruction-box">
                            <p class="instruction-title">📋 급여 방법 및 주의사항</p>
                            <p class="instruction-text">${escapeHtml(medication.instructions)}</p>
                        </div>
                    ` : ''}
                    
                    ${medication.specialNotes ? `
                        <div class="special-notes-box">
                            <p class="notes-title">⚠️ 특이사항</p>
                            <p class="notes-text">${escapeHtml(medication.specialNotes)}</p>
                        </div>
                    ` : ''}
                    
                    <div class="confirmation-text" role="alert">
                        이 약이 맞습니까?
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeMedicationDetailModal()">
                        취소
                    </button>
                    <button class="btn-primary" onclick="showCompletionModal()">
                        투약 완료하기 ✓
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal(modal);
}

/**
 * 투약 상세 모달 닫기
 */
function closeMedicationDetailModal() {
    try {
        const modal = document.getElementById('medicationDetailModal');
        if (modal) {
            modal.remove();
        }
    } catch (error) {
        console.error('상세 모달 닫기 오류:', error);
    }
}

// ============================================
// 투약 완료
// ============================================

/**
 * 완료 모달 표시
 */
function showCompletionModal() {
    try {
        const modal = `
            <div class="modal" id="completionModal" role="dialog" aria-labelledby="completionModalTitle" aria-modal="true">
                <div class="modal-overlay" onclick="closeCompletionModal()" aria-hidden="true"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="completionModalTitle">✅ 투약 완료 확인</h3>
                        <button class="modal-close" 
                                onclick="closeCompletionModal()"
                                aria-label="완료 확인 닫기">×</button>
                    </div>
                    
                    <div class="modal-body">
                        <p class="completion-instruction">
                            투약 완료 사진을 업로드해주세요
                        </p>
                        
                        <div id="completionPhotoPreview" class="completion-photo-preview">
                            ${createPhotoUploadButton('투약 완료 사진 촬영', 'uploadCompletionPhoto')}
                        </div>
                        
                        <div class="form-group">
                            <label for="completionNote">메모 (선택)</label>
                            <textarea id="completionNote" 
                                      class="input-field" 
                                      rows="3"
                                      maxlength="200"
                                      placeholder="예: 잘 먹었어요!"></textarea>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="closeCompletionModal()">
                            취소
                        </button>
                        <button class="btn-primary" onclick="confirmCompletion()">
                            완료 확정 ✓
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        closeMedicationDetailModal();
        showModal(modal);
    } catch (error) {
        console.error('완료 모달 표시 오류:', error);
        showToast('완료 화면을 열 수 없습니다');
    }
}

/**
 * 투약 완료 확정
 */
function confirmCompletion() {
    try {
        if (!MedicationManager.completionPhoto) {
            showToast('완료 사진을 업로드해주세요');
            return;
        }
        
        const note = document.getElementById('completionNote')?.value.trim() || '';
        
        const result = window.barabomData?.completeMedication(MedicationManager.currentMedicationId, {
            photo: MedicationManager.completionPhoto,
            note,
            completedBy: '선생님'
        });
        
        if (result) {
            MedicationManager.completionPhoto = '';
            MedicationManager.currentMedicationId = null;
            closeCompletionModal();
            
            if (typeof renderHomeScreen === 'function') {
                renderHomeScreen();
            }
            
            showToast('투약이 완료되었습니다 ✓');
        } else {
            throw new Error('투약 완료 처리 실패');
        }
    } catch (error) {
        console.error('투약 완료 확정 오류:', error);
        showToast('투약 완료 처리에 실패했습니다');
    }
}

/**
 * 완료 모달 닫기
 */
function closeCompletionModal() {
    try {
        const modal = document.getElementById('completionModal');
        if (modal) {
            modal.remove();
        }
        MedicationManager.completionPhoto = '';
    } catch (error) {
        console.error('완료 모달 닫기 오류:', error);
    }
}

// ============================================
// 정리 함수
// ============================================

/**
 * 메모리 정리
 */
function cleanupMedicationSystem() {
    MedicationManager.selectedPhoto = '';
    MedicationManager.completionPhoto = '';
    MedicationManager.currentMedicationId = null;
}

// 페이지 언로드 시 정리
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanupMedicationSystem);
}

// ============================================
// 스타일 추가
// ============================================

function addMedicationStyles() {
    if (document.getElementById('medicationStyles')) return;
    
    const medicationStyles = document.createElement('style');
    medicationStyles.id = 'medicationStyles';
    medicationStyles.textContent = `
    .required::after {
        content: ' *';
        color: #ef4444;
    }
    
    .form-hint {
        font-size: 0.75rem;
        color: #6b7280;
        margin-top: 0.25rem;
        margin-bottom: 0.5rem;
    }
    
    .form-row {
        display: flex;
        gap: 0.75rem;
    }
    
    .btn-load-previous {
        width: 100%;
        padding: 0.75rem;
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        cursor: pointer;
        margin-bottom: 1.5rem;
        transition: all 0.2s;
        font-weight: 500;
    }
    
    .btn-load-previous:hover {
        background: #e5e7eb;
        transform: translateY(-1px);
    }
    
    .btn-load-previous:active {
        transform: translateY(0);
    }
    
    .medication-photo-preview,
    .completion-photo-preview {
        margin-top: 0.5rem;
        min-height: 200px;
    }
    
    .photo-upload-btn {
        width: 100%;
        height: 200px;
        border: 2px dashed #d1d5db;
        border-radius: 0.75rem;
        background: #f9fafb;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .photo-upload-btn:hover {
        border-color: #3b82f6;
        background: #eff6ff;
    }
    
    .photo-upload-btn svg {
        color: #9ca3af;
    }
    
    .photo-upload-btn span {
        color: #6b7280;
        font-size: 0.875rem;
        font-weight: 500;
    }
    
    .photo-preview-item {
        position: relative;
        width: 100%;
        height: 200px;
        border-radius: 0.75rem;
        overflow: hidden;
    }
    
    .photo-preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .photo-remove-btn {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        line-height: 1;
    }
    
    .photo-remove-btn:hover {
        background: rgba(220, 38, 38, 1);
        transform: scale(1.1);
    }
    
    .timing-buttons,
    .dosage-grid,
    .priority-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .timing-btn,
    .dosage-btn,
    .priority-btn {
        padding: 0.625rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        background: white;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .timing-btn:hover,
    .dosage-btn:hover,
    .priority-btn:hover {
        border-color: #3b82f6;
        background: #eff6ff;
        transform: translateY(-1px);
    }
    
    .timing-btn:active,
    .dosage-btn:active,
    .priority-btn:active {
        transform: translateY(0);
    }
    
    .timing-btn.active,
    .dosage-btn.active,
    .priority-btn.active {
        border-color: #3b82f6;
        background: #3b82f6;
        color: white;
        font-weight: 600;
    }
    
    .dosage-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
    }
    
    .medication-pet-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 0.75rem;
        margin-bottom: 1rem;
    }
    
    .medication-pet-info img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .medication-pet-info h4 {
        font-size: 1.125rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }
    
    .medication-pet-info p {
        font-size: 0.875rem;
        color: #6b7280;
    }
    
    .medication-photo-large {
        width: 100%;
        height: 250px;
        border-radius: 0.75rem;
        overflow: hidden;
        margin-bottom: 1rem;
    }
    
    .medication-photo-large img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .medication-info-box {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 0.75rem;
        margin-bottom: 1rem;
    }
    
    .info-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .info-row:last-child {
        border-bottom: none;
    }
    
    .info-label {
        font-size: 0.875rem;
        color: #6b7280;
    }
    
    .info-value {
        font-size: 0.875rem;
        font-weight: 600;
    }
    
    .priority-alert {
        background: #fee2e2;
        color: #991b1b;
        padding: 0.75rem;
        border-radius: 0.5rem;
        margin-top: 0.5rem;
        font-weight: 600;
        text-align: center;
    }
    
    .instruction-box,
    .special-notes-box {
        background: #fffbeb;
        border: 1px solid #fbbf24;
        padding: 1rem;
        border-radius: 0.75rem;
        margin-bottom: 1rem;
    }
    
    .instruction-title,
    .notes-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: #92400e;
        margin-bottom: 0.5rem;
    }
    
    .instruction-text,
    .notes-text {
        font-size: 0.875rem;
        color: #78350f;
        line-height: 1.5;
        word-break: break-word;
    }
    
    .confirmation-text {
        text-align: center;
        font-size: 1.125rem;
        font-weight: 700;
        color: #ef4444;
        padding: 1rem;
        background: #fee2e2;
        border-radius: 0.75rem;
        margin-top: 1rem;
    }
    
    .completion-instruction {
        text-align: center;
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 1rem;
    }
    
    @media (max-width: 480px) {
        .dosage-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    `;
    document.head.appendChild(medicationStyles);
}

// 스타일 초기화
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', addMedicationStyles);
}
