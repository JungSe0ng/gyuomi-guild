// ===========================
// Firebase Firestore 기반 공략 시스템
// ===========================

// 전역 변수
let guides = [];
let defenseTeams = [];

// 영웅 데이터
const heroData = {
    '구세나': ['밀리아', '갤리두스', '파이', '쥬리', '로지'],
    '찐스': ['브란즈&브란셀', '손오공', '프레이야', '트루드', '라이언', '엘리시아', '키리엘', '카일', '아킬라', '카구라', '클라한', '오를리', '비스킷', '플라튼', '콜트', '린', '카르마', '멜키르', '연희', '태오', '바네사', '스파이크', '제이브', '레이첼', '아일린', '델론즈', '크리스', '루디', '실베스타', '에이스'],
    '짭스': ['백각', '아멜리아', '미호', '데이지', '타카', '파스칼', '아라곤', '엘리스', '발리스타', '첸슬러', '룩', '지크', '세인', '에스파다', '니아', '루리', '벨리카', '리나', '비담', '유신', '녹스'],
    '희귀': ['레이', '진', '캐티', '블랙로즈', '아수라', '노호', '클로에', '메이', '세라', '제인', '유이', '실비아', '루시', '빅토리아', '카론', '조커', '카린', '에반', '쥬피', '스니퍼', '소이', '풍연', '헤브니아', '헬레니아', '아리엘', '리', '사라', '라니아', '클레오', '베인', '레오', '유리', '라쿤', '호킨']
};

// 가나다순 정렬
Object.keys(heroData).forEach(grade => {
    heroData[grade].sort((a, b) => a.localeCompare(b, 'ko'));
});

// 장비 옵션
const equipmentSets = ['모두', '선봉장', '성기사', '암살자', '복수자', '조율자', '수문장', '수호자', '추적자', '주술사'];
const weaponOptions = ['모두', '약점 공격 확률', '치명타 확률', '치명타 피해', '모든 공격력(%)', '모든 공격력', '방어력(%)', '방어력', '생명력(%)', '생명력', '효과 적중'];
const armorOptions = ['모두', '받는 피해 감소', '막기 확률', '모든 공격력(%)', '모든 공격력', '방어력(%)', '방어력', '생명력(%)', '생명력', '효과 저항'];

// ===========================
// Firebase 데이터 로드/저장
// ===========================

async function loadData() {
    try {
        // 공략 데이터 로드
        const guidesSnapshot = await window.firestore.getDocs(
            window.firestore.query(
                window.firestore.collection(window.db, 'guides'),
                window.firestore.orderBy('createdAt', 'desc')
            )
        );
        guides = [];
        guidesSnapshot.forEach(doc => {
            guides.push({ id: doc.id, ...doc.data() });
        });

        // 방어팀 데이터 로드
        const defenseSnapshot = await window.firestore.getDocs(
            window.firestore.query(
                window.firestore.collection(window.db, 'defenseTeams'),
                window.firestore.orderBy('createdAt', 'desc')
            )
        );
        defenseTeams = [];
        defenseSnapshot.forEach(doc => {
            defenseTeams.push({ id: doc.id, ...doc.data() });
        });

        renderGuides();
        renderDefenseTeams();
    } catch (error) {
        console.error('데이터 로드 오류:', error);
    }
}

// ===========================
// 초기화
// ===========================

function init() {
    loadData();
    
    // 서브탭 이벤트 리스너
    document.querySelectorAll('#attack-tab .sub-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const subtab = btn.dataset.subtab;
            switchSubTab(subtab);
        });
    });

    document.querySelectorAll('#defense-tab .sub-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const subtab = btn.dataset.subtab;
            switchDefenseSubTab(subtab);
        });
    });
}

// ===========================
// 탭 전환
// ===========================

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tab + '-tab').classList.add('active');
    event.target.classList.add('active');
}

function switchSubTab(sub) {
    document.querySelectorAll('#attack-tab .sub-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('#attack-tab .sub-tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(sub + '-content').classList.add('active');
    event.target.classList.add('active');
    
    if (sub === 'list') {
        renderGuides();
    }
}

function switchDefenseSubTab(sub) {
    document.querySelectorAll('#defense-tab .sub-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('#defense-tab .sub-tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(sub + '-content').classList.add('active');
    event.target.classList.add('active');
    
    if (sub === 'def-list') {
        renderDefenseTeams();
    }
}

// ===========================
// 영웅 선택 업데이트
// ===========================

function updateEnemyHero1Options(grade) {
    const select = document.getElementById('enemyHero1');
    if (grade && heroData[grade]) {
        select.disabled = false;
        select.innerHTML = '<option value="">영웅 선택</option>';
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    } else {
        select.disabled = true;
        select.innerHTML = '<option value="">등급을 먼저 선택하세요</option>';
    }
}

function updateEnemyHero2Options(grade) {
    const select = document.getElementById('enemyHero2');
    if (grade && heroData[grade]) {
        select.disabled = false;
        select.innerHTML = '<option value="">영웅 선택</option>';
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    } else {
        select.disabled = true;
        select.innerHTML = '<option value="">등급을 먼저 선택하세요</option>';
    }
}

function updateEnemyHero3Options(grade) {
    const select = document.getElementById('enemyHero3');
    if (grade && heroData[grade]) {
        select.disabled = false;
        select.innerHTML = '<option value="">영웅 선택</option>';
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    } else {
        select.disabled = true;
        select.innerHTML = '<option value="">등급을 먼저 선택하세요</option>';
    }
}

function updateAllyHero1Options(grade) {
    const select = document.getElementById('allyHero1');
    if (grade && heroData[grade]) {
        select.disabled = false;
        select.innerHTML = '<option value="">영웅 선택</option>';
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    } else {
        select.disabled = true;
        select.innerHTML = '<option value="">등급을 먼저 선택하세요</option>';
    }
}

function updateAllyHero2Options(grade) {
    const select = document.getElementById('allyHero2');
    if (grade && heroData[grade]) {
        select.disabled = false;
        select.innerHTML = '<option value="">영웅 선택</option>';
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    } else {
        select.disabled = true;
        select.innerHTML = '<option value="">등급을 먼저 선택하세요</option>';
    }
}

function updateAllyHero3Options(grade) {
    const select = document.getElementById('allyHero3');
    if (grade && heroData[grade]) {
        select.disabled = false;
        select.innerHTML = '<option value="">영웅 선택</option>';
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    } else {
        select.disabled = true;
        select.innerHTML = '<option value="">등급을 먼저 선택하세요</option>';
    }
}

function updateDefTeamHero1Options(grade) {
    const select = document.getElementById('defTeamHero1');
    if (grade && heroData[grade]) {
        select.disabled = false;
        select.innerHTML = '<option value="">영웅 선택</option>';
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    } else {
        select.disabled = true;
        select.innerHTML = '<option value="">등급을 먼저 선택하세요</option>';
    }
}

function updateDefTeamHero2Options(grade) {
    const select = document.getElementById('defTeamHero2');
    if (grade && heroData[grade]) {
        select.disabled = false;
        select.innerHTML = '<option value="">영웅 선택</option>';
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    } else {
        select.disabled = true;
        select.innerHTML = '<option value="">등급을 먼저 선택하세요</option>';
    }
}

function updateDefTeamHero3Options(grade) {
    const select = document.getElementById('defTeamHero3');
    if (grade && heroData[grade]) {
        select.disabled = false;
        select.innerHTML = '<option value="">영웅 선택</option>';
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    } else {
        select.disabled = true;
        select.innerHTML = '<option value="">등급을 먼저 선택하세요</option>';
    }
}

// ===========================
// 장비 UI 업데이트
// ===========================

function updateEquipment() {
    const hero1 = document.getElementById('allyHero1').value;
    const hero2 = document.getElementById('allyHero2').value;
    const hero3 = document.getElementById('allyHero3').value;
    
    if (!hero1 || !hero2 || !hero3) return;
    
    const container = document.getElementById('equipmentContainer');
    container.innerHTML = `
        <div class="equipment-section">
            <h4>⚔️ 장비 설정</h4>
            <div class="equipment-grid">
                ${[1, 2, 3].map(i => {
                    const heroName = document.getElementById(`allyHero${i}`).value;
                    return `
                        <div class="equipment-col">
                            <h5>🎯 ${heroName}</h5>
                            <div class="equipment-item">
                                <label>무기 세트</label>
                                <select id="weaponSet${i}">
                                    ${equipmentSets.map(set => `<option value="${set}">${set}</option>`).join('')}
                                </select>
                            </div>
                            <div class="equipment-item">
                                <label>무기 옵션</label>
                                <select id="weaponOpt${i}">
                                    ${weaponOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                                </select>
                            </div>
                            <div class="equipment-item">
                                <label>방어구 세트</label>
                                <select id="armorSet${i}">
                                    ${equipmentSets.map(set => `<option value="${set}">${set}</option>`).join('')}
                                </select>
                            </div>
                            <div class="equipment-item">
                                <label>방어구 옵션</label>
                                <select id="armorOpt${i}">
                                    ${armorOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function updateDefenseEquipment() {
    const hero1 = document.getElementById('defTeamHero1').value;
    const hero2 = document.getElementById('defTeamHero2').value;
    const hero3 = document.getElementById('defTeamHero3').value;
    
    if (!hero1 || !hero2 || !hero3) return;
    
    const container = document.getElementById('defenseEquipmentContainer');
    container.innerHTML = `
        <div class="equipment-section">
            <h4>🛡️ 장비 설정</h4>
            <div class="equipment-grid">
                ${[1, 2, 3].map(i => {
                    const heroName = document.getElementById(`defTeamHero${i}`).value;
                    return `
                        <div class="equipment-col">
                            <h5>🎯 ${heroName}</h5>
                            <div class="equipment-item">
                                <label>무기 세트</label>
                                <select id="defWeaponSet${i}">
                                    ${equipmentSets.map(set => `<option value="${set}">${set}</option>`).join('')}
                                </select>
                            </div>
                            <div class="equipment-item">
                                <label>무기 옵션</label>
                                <select id="defWeaponOpt${i}">
                                    ${weaponOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                                </select>
                            </div>
                            <div class="equipment-item">
                                <label>방어구 세트</label>
                                <select id="defArmorSet${i}">
                                    ${equipmentSets.map(set => `<option value="${set}">${set}</option>`).join('')}
                                </select>
                            </div>
                            <div class="equipment-item">
                                <label>방어구 옵션</label>
                                <select id="defArmorOpt${i}">
                                    ${armorOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}
// ===========================
// 공략 저장 (Firebase)
// ===========================

async function saveGuide(e) {
    e.preventDefault();
    
    try {
        const guideData = {
            title: document.getElementById('guideTitle').value,
            enemyHeroes: [
                document.getElementById('enemyHero1').value,
                document.getElementById('enemyHero2').value,
                document.getElementById('enemyHero3').value
            ],
            allyHeroes: [
                document.getElementById('allyHero1').value,
                document.getElementById('allyHero2').value,
                document.getElementById('allyHero3').value
            ],
            equipment: {
                hero1: {
                    weaponSet: document.getElementById('weaponSet1').value,
                    weaponOpt: document.getElementById('weaponOpt1').value,
                    armorSet: document.getElementById('armorSet1').value,
                    armorOpt: document.getElementById('armorOpt1').value
                },
                hero2: {
                    weaponSet: document.getElementById('weaponSet2').value,
                    weaponOpt: document.getElementById('weaponOpt2').value,
                    armorSet: document.getElementById('armorSet2').value,
                    armorOpt: document.getElementById('armorOpt2').value
                },
                hero3: {
                    weaponSet: document.getElementById('weaponSet3').value,
                    weaponOpt: document.getElementById('weaponOpt3').value,
                    armorSet: document.getElementById('armorSet3').value,
                    armorOpt: document.getElementById('armorOpt3').value
                }
            },
            detail: document.getElementById('guideDetail').value,
            createdAt: new Date().toISOString(),
            author: currentUser.nickname
        };

        await window.firestore.addDoc(window.firestore.collection(window.db, 'guides'), guideData);
        
        alert('공략이 저장되었습니다!');
        document.getElementById('guideForm').reset();
        document.getElementById('equipmentContainer').innerHTML = '';
        
        await loadData();
        switchSubTab('list');
        
    } catch (error) {
        console.error('공략 저장 오류:', error);
        alert('공략 저장에 실패했습니다.');
    }
}

// ===========================
// 방어팀 저장 (Firebase)
// ===========================

async function saveDefenseTeam(e) {
    e.preventDefault();
    
    try {
        const defenseData = {
            name: document.getElementById('defenseName').value,
            heroes: [
                document.getElementById('defTeamHero1').value,
                document.getElementById('defTeamHero2').value,
                document.getElementById('defTeamHero3').value
            ],
            equipment: {
                hero1: {
                    weaponSet: document.getElementById('defWeaponSet1').value,
                    weaponOpt: document.getElementById('defWeaponOpt1').value,
                    armorSet: document.getElementById('defArmorSet1').value,
                    armorOpt: document.getElementById('defArmorOpt1').value
                },
                hero2: {
                    weaponSet: document.getElementById('defWeaponSet2').value,
                    weaponOpt: document.getElementById('defWeaponOpt2').value,
                    armorSet: document.getElementById('defArmorSet2').value,
                    armorOpt: document.getElementById('defArmorOpt2').value
                },
                hero3: {
                    weaponSet: document.getElementById('defWeaponSet3').value,
                    weaponOpt: document.getElementById('defWeaponOpt3').value,
                    armorSet: document.getElementById('defArmorSet3').value,
                    armorOpt: document.getElementById('defArmorOpt3').value
                }
            },
            tip: document.getElementById('defenseTip').value,
            createdAt: new Date().toISOString(),
            author: currentUser.nickname
        };

        await window.firestore.addDoc(window.firestore.collection(window.db, 'defenseTeams'), defenseData);
        
        alert('방어팀이 저장되었습니다!');
        document.getElementById('defenseForm').reset();
        document.getElementById('defenseEquipmentContainer').innerHTML = '';
        
        await loadData();
        switchDefenseSubTab('def-list');
        
    } catch (error) {
        console.error('방어팀 저장 오류:', error);
        alert('방어팀 저장에 실패했습니다.');
    }
}

// ===========================
// 공략 삭제 (Firebase)
// ===========================

async function deleteGuide(id) {
    if (!confirm('이 공략을 삭제하시겠습니까?')) return;
    
    try {
        await window.firestore.deleteDoc(window.firestore.doc(window.db, 'guides', id));
        alert('공략이 삭제되었습니다.');
        await loadData();
    } catch (error) {
        console.error('공략 삭제 오류:', error);
        alert('공략 삭제에 실패했습니다.');
    }
}

// ===========================
// 방어팀 삭제 (Firebase)
// ===========================

async function deleteDefenseTeam(id) {
    if (!confirm('이 방어팀을 삭제하시겠습니까?')) return;
    
    try {
        await window.firestore.deleteDoc(window.firestore.doc(window.db, 'defenseTeams', id));
        alert('방어팀이 삭제되었습니다.');
        await loadData();
    } catch (error) {
        console.error('방어팀 삭제 오류:', error);
        alert('방어팀 삭제에 실패했습니다.');
    }
}

// ===========================
// 공략 렌더링
// ===========================

function renderGuides() {
    const container = document.getElementById('guideList');
    
    if (guides.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>📚</div>
                <p>등록된 공략이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = guides.map(guide => `
        <div class="guide-item">
            <div class="guide-header">
                <div>
                    <div class="guide-title">${guide.title}</div>
                    <div style="color: #999; font-size: 0.9em; margin-top: 5px;">
                        작성자: ${guide.author || '익명'} | ${new Date(guide.createdAt).toLocaleString()}
                    </div>
                </div>
                <div class="guide-actions">
                    <button class="btn btn-danger delete-btn" onclick="deleteGuide('${guide.id}')">삭제</button>
                </div>
            </div>
            
            <div style="margin: 15px 0;">
                <div style="font-weight: bold; margin-bottom: 10px;">🎯 상대 방어팀:</div>
                <div>
                    ${guide.enemyHeroes.map(hero => `<span class="hero-badge">${hero}</span>`).join('')}
                </div>
            </div>
            
            <div style="margin: 15px 0;">
                <div style="font-weight: bold; margin-bottom: 10px;">⚔️ 아군 공격팀:</div>
                <div>
                    ${guide.allyHeroes.map(hero => `<span class="hero-badge">${hero}</span>`).join('')}
                </div>
            </div>
            
            <div style="margin: 15px 0;">
                <div style="font-weight: bold; margin-bottom: 10px;">🛠️ 장비 설정:</div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                    ${guide.allyHeroes.map((hero, i) => {
                        const eq = guide.equipment[`hero${i+1}`];
                        return `
                            <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 8px;">
                                <div style="font-weight: bold; color: #B08AB0; margin-bottom: 5px;">${hero}</div>
                                <div style="font-size: 0.9em; color: #666;">
                                    무기: ${eq.weaponSet} / ${eq.weaponOpt}<br>
                                    방어구: ${eq.armorSet} / ${eq.armorOpt}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div style="margin: 15px 0;">
                <div style="font-weight: bold; margin-bottom: 10px;">📝 공략 설명:</div>
                <div style="background: #fff8e1; padding: 15px; border-radius: 10px; line-height: 1.6;">
                    ${guide.detail.replace(/\n/g, '<br>')}
                </div>
            </div>
        </div>
    `).join('');
    
    updateButtonsVisibility();
}

// ===========================
// 방어팀 렌더링
// ===========================

function renderDefenseTeams() {
    const container = document.getElementById('defenseList');
    
    if (defenseTeams.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>🛡️</div>
                <p>등록된 방어팀이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = defenseTeams.map(team => `
        <div class="guide-item">
            <div class="guide-header">
                <div>
                    <div class="guide-title">${team.name}</div>
                    <div style="color: #999; font-size: 0.9em; margin-top: 5px;">
                        작성자: ${team.author || '익명'} | ${new Date(team.createdAt).toLocaleString()}
                    </div>
                </div>
                <div class="guide-actions">
                    <button class="btn btn-danger delete-btn" onclick="deleteDefenseTeam('${team.id}')">삭제</button>
                </div>
            </div>
            
            <div style="margin: 15px 0;">
                <div style="font-weight: bold; margin-bottom: 10px;">🛡️ 방어 영웅:</div>
                <div>
                    ${team.heroes.map(hero => `<span class="hero-badge" style="background: linear-gradient(135deg, #98D8C8, #6FC3A8);">${hero}</span>`).join('')}
                </div>
            </div>
            
            <div style="margin: 15px 0;">
                <div style="font-weight: bold; margin-bottom: 10px;">🛠️ 장비 설정:</div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                    ${team.heroes.map((hero, i) => {
                        const eq = team.equipment[`hero${i+1}`];
                        return `
                            <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 8px;">
                                <div style="font-weight: bold; color: #98D8C8; margin-bottom: 5px;">${hero}</div>
                                <div style="font-size: 0.9em; color: #666;">
                                    무기: ${eq.weaponSet} / ${eq.weaponOpt}<br>
                                    방어구: ${eq.armorSet} / ${eq.armorOpt}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            ${team.tip ? `
                <div style="margin: 15px 0;">
                    <div style="font-weight: bold; margin-bottom: 10px;">💡 운용 팁:</div>
                    <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; line-height: 1.6;">
                        ${team.tip.replace(/\n/g, '<br>')}
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    updateButtonsVisibility();
}

// ===========================
// 검색 기능
// ===========================

function searchGuides() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        renderGuides();
        return;
    }
    
    const filtered = guides.filter(guide => {
        return guide.title.toLowerCase().includes(searchTerm) ||
               guide.enemyHeroes.some(h => h.toLowerCase().includes(searchTerm)) ||
               guide.allyHeroes.some(h => h.toLowerCase().includes(searchTerm)) ||
               guide.detail.toLowerCase().includes(searchTerm);
    });
    
    const container = document.getElementById('guideList');
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>🔍</div>
                <p>"${searchTerm}"에 대한 검색 결과가 없습니다.</p>
            </div>
        `;
        return;
    }
    
    // filtered 배열로 렌더링 (guides 대신)
    const tempGuides = guides;
    guides = filtered;
    renderGuides();
    guides = tempGuides;
}
