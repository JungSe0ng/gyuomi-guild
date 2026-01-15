// ===========================
// Firebase Firestore 기반 공략 시스템 v2
// ===========================

// 전역 변수
let guides = [];
let defenseTeams = [];
let currentStrategyId = null; // 현재 공격팀 추가할 공략 ID

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

        console.log('데이터 로드 완료:', guides.length, '개 공략,', defenseTeams.length, '개 방어팀');
        
        renderGuides();
        renderDefenseTeams();
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        alert('데이터를 불러오는데 실패했습니다.');
    }
}

// ===========================
// 초기화
// ===========================

function init() {
    loadData();
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
// 영웅 선택 드롭다운 업데이트
// ===========================

// 상대 방어팀 영웅 선택
function updateEnemyHero1Options(grade) {
    const select = document.getElementById('enemyHero1');
    select.disabled = !grade;
    select.innerHTML = '<option value="">영웅 선택</option>';
    if (grade && heroData[grade]) {
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    }
}

function updateEnemyHero2Options(grade) {
    const select = document.getElementById('enemyHero2');
    select.disabled = !grade;
    select.innerHTML = '<option value="">영웅 선택</option>';
    if (grade && heroData[grade]) {
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    }
}

function updateEnemyHero3Options(grade) {
    const select = document.getElementById('enemyHero3');
    select.disabled = !grade;
    select.innerHTML = '<option value="">영웅 선택</option>';
    if (grade && heroData[grade]) {
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    }
}

// 방어팀 영웅 선택
function updateDefTeamHero1Options(grade) {
    const select = document.getElementById('defTeamHero1');
    select.disabled = !grade;
    select.innerHTML = '<option value="">영웅 선택</option>';
    if (grade && heroData[grade]) {
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    }
}

function updateDefTeamHero2Options(grade) {
    const select = document.getElementById('defTeamHero2');
    select.disabled = !grade;
    select.innerHTML = '<option value="">영웅 선택</option>';
    if (grade && heroData[grade]) {
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    }
}

function updateDefTeamHero3Options(grade) {
    const select = document.getElementById('defTeamHero3');
    select.disabled = !grade;
    select.innerHTML = '<option value="">영웅 선택</option>';
    if (grade && heroData[grade]) {
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    }
}

// ===========================
// 공략 저장 (상대 방어팀만)
// ===========================

async function saveGuide(event) {
    event.preventDefault();
    
    const title = document.getElementById('guideTitle').value.trim();
    const enemyHero1 = document.getElementById('enemyHero1').value;
    const enemyHero2 = document.getElementById('enemyHero2').value;
    const enemyHero3 = document.getElementById('enemyHero3').value;

    if (!title || !enemyHero1 || !enemyHero2 || !enemyHero3) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    try {
        const guideData = {
            title: title,
            enemyTeam: [enemyHero1, enemyHero2, enemyHero3],
            attackStrategies: [], // 빈 배열로 시작
            createdAt: new Date().toISOString(),
            createdBy: currentUser.nickname
        };

        const docRef = await window.firestore.addDoc(
            window.firestore.collection(window.db, 'guides'),
            guideData
        );

        alert('공략이 저장되었습니다! 이제 공격팀을 추가하세요.');
        
        // 폼 초기화
        document.getElementById('guideForm').reset();
        document.querySelectorAll('#guideForm select').forEach(s => {
            if (s.id.startsWith('enemy')) s.disabled = true;
        });

        // 데이터 새로고침
        await loadData();
        
        // 목록 탭으로 이동
        switchSubTab('list');
        
    } catch (error) {
        console.error('공략 저장 오류:', error);
        alert('공략 저장에 실패했습니다: ' + error.message);
    }
}

// ===========================
// 공략 목록 렌더링
// ===========================

function renderGuides() {
    const container = document.getElementById('guideList');
    if (!container) return;

    if (guides.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">등록된 공략이 없습니다.</p>';
        return;
    }

    container.innerHTML = guides.map(guide => renderGuideCard(guide)).join('');
}

function renderGuideCard(guide) {
    const isAdmin = currentUser && currentUser.role === 'admin';
    const strategies = guide.attackStrategies || [];
    
    return `
        <div class="guide-card" style="background: white; border-radius: 15px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                <div>
                    <h3 style="margin: 0 0 10px 0; color: #B08AB0;">${guide.title}</h3>
                    <p style="margin: 0; font-size: 0.9em; color: #999;">작성자: ${guide.createdBy} | ${new Date(guide.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
                ${isAdmin ? `
                    <div style="display: flex; gap: 8px;">
                        <button onclick="showAddStrategyModal('${guide.id}')" class="btn" style="padding: 8px 16px; background: #98D8C8; font-size: 0.9em;">
                            ➕ 공격팀 추가
                        </button>
                        <button onclick="deleteGuide('${guide.id}')" class="btn" style="padding: 8px 16px; background: #ff6b6b; font-size: 0.9em;">
                            🗑️ 삭제
                        </button>
                    </div>
                ` : ''}
            </div>

            <div style="background: rgba(176,138,176,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #B08AB0;">🛡️ 상대 방어팀:</h4>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${guide.enemyTeam.map(hero => `
                        <span style="padding: 8px 16px; background: rgba(255,182,193,0.3); border-radius: 8px; font-weight: 500;">
                            ${hero}
                        </span>
                    `).join('')}
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0; color: #98D8C8;">⚔️ 공격 전략 (${strategies.length}개)</h4>
                    <button onclick="toggleStrategies('${guide.id}')" style="padding: 6px 12px; background: rgba(152,216,200,0.2); border: none; border-radius: 6px; cursor: pointer; font-size: 0.9em;">
                        <span id="toggle-${guide.id}">▼ 펼치기</span>
                    </button>
                </div>
                
                <div id="strategies-${guide.id}" style="display: none;">
                    ${strategies.length === 0 ? 
                        '<p style="text-align: center; color: #999; padding: 20px;">등록된 공격팀이 없습니다.</p>' :
                        strategies.map((strategy, idx) => renderStrategyCard(guide.id, strategy, idx, isAdmin)).join('')
                    }
                </div>
            </div>
        </div>
    `;
}

function renderStrategyCard(guideId, strategy, index, isAdmin) {
    const comments = strategy.comments || [];
    
    return `
        <div style="background: rgba(152,216,200,0.05); border: 2px solid rgba(152,216,200,0.3); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div>
                    <h5 style="margin: 0 0 10px 0; color: #333;">공격팀 ${index + 1}</h5>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        ${strategy.heroes.map(hero => `
                            <span style="padding: 6px 12px; background: rgba(152,216,200,0.3); border-radius: 6px; font-size: 0.9em;">
                                ${hero}
                            </span>
                        `).join('')}
                    </div>
                </div>
                ${isAdmin ? `
                    <div style="display: flex; gap: 8px;">
                        <button onclick="editStrategy('${guideId}', ${index})" style="padding: 6px 12px; background: #ffd93d; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85em;">
                            ✏️ 수정
                        </button>
                        <button onclick="deleteStrategy('${guideId}', ${index})" style="padding: 6px 12px; background: #ff6b6b; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85em; color: white;">
                            🗑️ 삭제
                        </button>
                    </div>
                ` : ''}
            </div>

            ${strategy.tip ? `
                <div style="background: rgba(255,253,208,0.5); padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ffd93d;">
                    <p style="margin: 0; font-size: 0.9em; color: #666;">💡 ${strategy.tip}</p>
                </div>
            ` : ''}

            <div style="border-top: 1px solid rgba(0,0,0,0.1); padding-top: 15px; margin-top: 15px;">
                <h6 style="margin: 0 0 10px 0; color: #666;">💬 댓글 (${comments.length})</h6>
                
                <div style="max-height: 200px; overflow-y: auto; margin-bottom: 10px;">
                    ${comments.map(comment => `
                        <div style="background: rgba(255,255,255,0.5); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                <span style="font-weight: 600; font-size: 0.9em; color: #B08AB0;">${comment.user}</span>
                                <span style="font-size: 0.75em; color: #999;">${new Date(comment.time).toLocaleString('ko-KR')}</span>
                            </div>
                            <p style="margin: 0; font-size: 0.9em; color: #555;">${comment.text}</p>
                        </div>
                    `).join('')}
                </div>

                <div style="display: flex; gap: 8px;">
                    <input type="text" id="comment-${guideId}-${index}" placeholder="댓글을 입력하세요..." style="flex: 1; padding: 8px 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.9em;">
                    <button onclick="addComment('${guideId}', ${index})" style="padding: 8px 16px; background: #98D8C8; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9em; white-space: nowrap;">
                        댓글 작성
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ===========================
// 토글 기능
// ===========================

function toggleStrategies(guideId) {
    const container = document.getElementById(`strategies-${guideId}`);
    const toggleBtn = document.getElementById(`toggle-${guideId}`);
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        toggleBtn.textContent = '▲ 접기';
    } else {
        container.style.display = 'none';
        toggleBtn.textContent = '▼ 펼치기';
    }
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
        const titleMatch = guide.title.toLowerCase().includes(searchTerm);
        const enemyMatch = guide.enemyTeam.some(hero => hero.toLowerCase().includes(searchTerm));
        const strategyMatch = (guide.attackStrategies || []).some(strategy => 
            strategy.heroes.some(hero => hero.toLowerCase().includes(searchTerm))
        );
        
        return titleMatch || enemyMatch || strategyMatch;
    });

    const container = document.getElementById('guideList');
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">검색 결과가 없습니다.</p>';
    } else {
        container.innerHTML = filtered.map(guide => renderGuideCard(guide)).join('');
    }
}

// 계속...

// ===========================
// 공격팀 추가 모달
// ===========================

function showAddStrategyModal(guideId) {
    currentStrategyId = guideId;
    
    const modal = document.createElement('div');
    modal.id = 'strategyModal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="closeStrategyModal()">
            <div style="background: white; border-radius: 20px; padding: 30px; max-width: 800px; width: 100%; max-height: 80vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <h2 style="margin: 0 0 25px 0; color: #98D8C8;">⚔️ 공격팀 추가</h2>
                
                <form id="strategyForm" onsubmit="saveStrategy(event)">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">공격 영웅 (3명)</label>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                            <div>
                                <select onchange="updateAttackHero1Options(this.value)" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; margin-bottom: 8px;">
                                    <option value="">등급 선택</option>
                                    <option value="구세나">구세나</option>
                                    <option value="찐스">찐스</option>
                                    <option value="짭스">짭스</option>
                                    <option value="희귀">희귀</option>
                                </select>
                                <select id="attackHero1" required disabled style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                                    <option value="">영웅 선택</option>
                                </select>
                            </div>
                            <div>
                                <select onchange="updateAttackHero2Options(this.value)" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; margin-bottom: 8px;">
                                    <option value="">등급 선택</option>
                                    <option value="구세나">구세나</option>
                                    <option value="찐스">찐스</option>
                                    <option value="짭스">짭스</option>
                                    <option value="희귀">희귀</option>
                                </select>
                                <select id="attackHero2" required disabled style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                                    <option value="">영웅 선택</option>
                                </select>
                            </div>
                            <div>
                                <select onchange="updateAttackHero3Options(this.value)" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; margin-bottom: 8px;">
                                    <option value="">등급 선택</option>
                                    <option value="구세나">구세나</option>
                                    <option value="찐스">찐스</option>
                                    <option value="짭스">짭스</option>
                                    <option value="희귀">희귀</option>
                                </select>
                                <select id="attackHero3" required disabled style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                                    <option value="">영웅 선택</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">스킬 우선순위 (선택사항)</label>
                        <input type="text" id="skillPriority" placeholder="예: 1스킬 → 2스킬 → 3스킬" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>

                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">운용 팁 (선택사항)</label>
                        <textarea id="strategyTip" rows="3" placeholder="공격팀 운용법, 스킬 사용 순서, 주의사항 등..." style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; resize: vertical;"></textarea>
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="closeStrategyModal()" style="padding: 12px 24px; background: #ddd; border: none; border-radius: 8px; cursor: pointer; font-size: 1em;">
                            취소
                        </button>
                        <button type="submit" style="padding: 12px 24px; background: #98D8C8; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1em; font-weight: bold;">
                            저장하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeStrategyModal() {
    const modal = document.getElementById('strategyModal');
    if (modal) modal.remove();
    currentStrategyId = null;
}

// 공격팀 영웅 선택 업데이트
function updateAttackHero1Options(grade) {
    const select = document.getElementById('attackHero1');
    select.disabled = !grade;
    select.innerHTML = '<option value="">영웅 선택</option>';
    if (grade && heroData[grade]) {
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    }
}

function updateAttackHero2Options(grade) {
    const select = document.getElementById('attackHero2');
    select.disabled = !grade;
    select.innerHTML = '<option value="">영웅 선택</option>';
    if (grade && heroData[grade]) {
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    }
}

function updateAttackHero3Options(grade) {
    const select = document.getElementById('attackHero3');
    select.disabled = !grade;
    select.innerHTML = '<option value="">영웅 선택</option>';
    if (grade && heroData[grade]) {
        heroData[grade].forEach(hero => {
            select.innerHTML += `<option value="${hero}">${hero}</option>`;
        });
    }
}

// ===========================
// 공격팀 저장
// ===========================

async function saveStrategy(event) {
    event.preventDefault();
    
    const attackHero1 = document.getElementById('attackHero1').value;
    const attackHero2 = document.getElementById('attackHero2').value;
    const attackHero3 = document.getElementById('attackHero3').value;
    const skillPriority = document.getElementById('skillPriority').value.trim();
    const tip = document.getElementById('strategyTip').value.trim();

    if (!attackHero1 || !attackHero2 || !attackHero3) {
        alert('공격 영웅 3명을 모두 선택해주세요.');
        return;
    }

    try {
        const guide = guides.find(g => g.id === currentStrategyId);
        if (!guide) {
            alert('공략을 찾을 수 없습니다.');
            return;
        }

        const newStrategy = {
            heroes: [attackHero1, attackHero2, attackHero3],
            skillPriority: skillPriority || '',
            tip: tip || '',
            comments: [],
            createdAt: new Date().toISOString(),
            createdBy: currentUser.nickname
        };

        const strategies = guide.attackStrategies || [];
        strategies.push(newStrategy);

        await window.firestore.updateDoc(
            window.firestore.doc(window.db, 'guides', currentStrategyId),
            { attackStrategies: strategies }
        );

        alert('공격팀이 추가되었습니다!');
        closeStrategyModal();
        await loadData();
        
    } catch (error) {
        console.error('공격팀 저장 오류:', error);
        alert('공격팀 저장에 실패했습니다: ' + error.message);
    }
}

// ===========================
// 댓글 추가
// ===========================

async function addComment(guideId, strategyIndex) {
    const input = document.getElementById(`comment-${guideId}-${strategyIndex}`);
    const text = input.value.trim();
    
    if (!text) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    try {
        const guide = guides.find(g => g.id === guideId);
        if (!guide || !guide.attackStrategies || !guide.attackStrategies[strategyIndex]) {
            alert('공략을 찾을 수 없습니다.');
            return;
        }

        const comment = {
            user: currentUser.nickname,
            text: text,
            time: new Date().toISOString()
        };

        const strategies = [...guide.attackStrategies];
        if (!strategies[strategyIndex].comments) {
            strategies[strategyIndex].comments = [];
        }
        strategies[strategyIndex].comments.push(comment);

        await window.firestore.updateDoc(
            window.firestore.doc(window.db, 'guides', guideId),
            { attackStrategies: strategies }
        );

        input.value = '';
        await loadData();
        
    } catch (error) {
        console.error('댓글 추가 오류:', error);
        alert('댓글 추가에 실패했습니다.');
    }
}

// ===========================
// 공략 삭제
// ===========================

async function deleteGuide(guideId) {
    if (!confirm('이 공략을 삭제하시겠습니까?')) return;

    try {
        await window.firestore.deleteDoc(window.firestore.doc(window.db, 'guides', guideId));
        alert('공략이 삭제되었습니다.');
        await loadData();
    } catch (error) {
        console.error('공략 삭제 오류:', error);
        alert('공략 삭제에 실패했습니다.');
    }
}

// ===========================
// 공격팀 삭제
// ===========================

async function deleteStrategy(guideId, strategyIndex) {
    if (!confirm('이 공격팀을 삭제하시겠습니까?')) return;

    try {
        const guide = guides.find(g => g.id === guideId);
        if (!guide) return;

        const strategies = [...guide.attackStrategies];
        strategies.splice(strategyIndex, 1);

        await window.firestore.updateDoc(
            window.firestore.doc(window.db, 'guides', guideId),
            { attackStrategies: strategies }
        );

        alert('공격팀이 삭제되었습니다.');
        await loadData();
    } catch (error) {
        console.error('공격팀 삭제 오류:', error);
        alert('공격팀 삭제에 실패했습니다.');
    }
}

// ===========================
// 방어팀 장비 설정 업데이트
// ===========================

function updateDefenseEquipment() {
    const hero1 = document.getElementById('defTeamHero1').value;
    const hero2 = document.getElementById('defTeamHero2').value;
    const hero3 = document.getElementById('defTeamHero3').value;
    
    const container = document.getElementById('defenseEquipmentContainer');
    
    if (!hero1 && !hero2 && !hero3) {
        container.innerHTML = '';
        return;
    }

    let html = '<div class="form-group"><label>⚙️ 영웅별 장비 설정</label></div>';

    [
        { id: 1, hero: hero1, name: '영웅 1' },
        { id: 2, hero: hero2, name: '영웅 2' },
        { id: 3, hero: hero3, name: '영웅 3' }
    ].forEach(({ id, hero, name }) => {
        if (!hero) return;

        html += `
            <div style="background: rgba(152,216,200,0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #98D8C8;">${name}: ${hero}</h4>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">장비 세트</label>
                    <select id="defHero${id}Set" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                        ${equipmentSets.map(set => `<option value="${set}">${set}</option>`).join('')}
                    </select>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">무기 1 옵션</label>
                        <select id="defHero${id}Weapon1" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                            ${weaponOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">무기 2 옵션</label>
                        <select id="defHero${id}Weapon2" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                            ${weaponOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">방어구 1 옵션</label>
                        <select id="defHero${id}Armor1" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                            ${armorOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">방어구 2 옵션</label>
                        <select id="defHero${id}Armor2" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                            ${armorOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">스킬 우선순위</label>
                    <input type="text" id="defHero${id}SkillPriority" placeholder="예: 1스킬 → 2스킬 → 3스킬" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ===========================
// 방어팀 저장
// ===========================

async function saveDefenseTeam(event) {
    event.preventDefault();
    
    const name = document.getElementById('defenseName').value.trim();
    const hero1 = document.getElementById('defTeamHero1').value;
    const hero2 = document.getElementById('defTeamHero2').value;
    const hero3 = document.getElementById('defTeamHero3').value;
    const tip = document.getElementById('defenseTip').value.trim();

    if (!name || !hero1 || !hero2 || !hero3) {
        alert('팀 이름과 영웅 3명을 모두 입력해주세요.');
        return;
    }

    try {
        const defenseData = {
            name: name,
            heroes: [
                {
                    name: hero1,
                    equipment: {
                        set: document.getElementById('defHero1Set').value,
                        weapon1: document.getElementById('defHero1Weapon1').value,
                        weapon2: document.getElementById('defHero1Weapon2').value,
                        armor1: document.getElementById('defHero1Armor1').value,
                        armor2: document.getElementById('defHero1Armor2').value
                    },
                    skillPriority: document.getElementById('defHero1SkillPriority').value.trim()
                },
                {
                    name: hero2,
                    equipment: {
                        set: document.getElementById('defHero2Set').value,
                        weapon1: document.getElementById('defHero2Weapon1').value,
                        weapon2: document.getElementById('defHero2Weapon2').value,
                        armor1: document.getElementById('defHero2Armor1').value,
                        armor2: document.getElementById('defHero2Armor2').value
                    },
                    skillPriority: document.getElementById('defHero2SkillPriority').value.trim()
                },
                {
                    name: hero3,
                    equipment: {
                        set: document.getElementById('defHero3Set').value,
                        weapon1: document.getElementById('defHero3Weapon1').value,
                        weapon2: document.getElementById('defHero3Weapon2').value,
                        armor1: document.getElementById('defHero3Armor1').value,
                        armor2: document.getElementById('defHero3Armor2').value
                    },
                    skillPriority: document.getElementById('defHero3SkillPriority').value.trim()
                }
            ],
            tip: tip,
            comments: [], // 빈 댓글 배열로 시작
            createdAt: new Date().toISOString(),
            createdBy: currentUser.nickname
        };

        await window.firestore.addDoc(
            window.firestore.collection(window.db, 'defenseTeams'),
            defenseData
        );

        alert('방어팀이 저장되었습니다!');
        
        // 폼 초기화
        document.getElementById('defenseForm').reset();
        document.getElementById('defenseEquipmentContainer').innerHTML = '';
        document.querySelectorAll('#defenseForm select').forEach(s => {
            if (s.id.startsWith('defTeam')) s.disabled = true;
        });

        // 데이터 새로고침
        await loadData();
        
        // 목록 탭으로 이동
        switchDefenseSubTab('def-list');
        
    } catch (error) {
        console.error('방어팀 저장 오류:', error);
        alert('방어팀 저장에 실패했습니다: ' + error.message);
    }
}

// ===========================
// 방어팀 목록 렌더링
// ===========================

function renderDefenseTeams() {
    const container = document.getElementById('defenseList');
    if (!container) return;

    if (defenseTeams.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">등록된 방어팀이 없습니다.</p>';
        return;
    }

    container.innerHTML = defenseTeams.map(team => renderDefenseCard(team)).join('');
}

function renderDefenseCard(team) {
    const isAdmin = currentUser && currentUser.role === 'admin';
    const comments = team.comments || [];
    
    return `
        <div class="defense-card" style="background: white; border-radius: 15px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                <div>
                    <h3 style="margin: 0 0 10px 0; color: #98D8C8;">${team.name}</h3>
                    <p style="margin: 0; font-size: 0.9em; color: #999;">작성자: ${team.createdBy} | ${new Date(team.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
                ${isAdmin ? `
                    <button onclick="deleteDefenseTeam('${team.id}')" class="btn" style="padding: 8px 16px; background: #ff6b6b; color: white; font-size: 0.9em; border: none; border-radius: 8px; cursor: pointer;">
                        🗑️ 삭제
                    </button>
                ` : ''}
            </div>

            <div style="background: rgba(152,216,200,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #98D8C8;">🛡️ 방어 영웅:</h4>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${team.heroes.map(hero => `
                        <span style="padding: 8px 16px; background: rgba(152,216,200,0.3); border-radius: 8px; font-weight: 500;">
                            ${hero.name}
                        </span>
                    `).join('')}
                </div>
            </div>

            <div style="display: grid; gap: 20px; margin-bottom: 20px;">
                ${team.heroes.map((hero, idx) => `
                    <div style="background: rgba(152,216,200,0.05); padding: 20px; border-radius: 12px; border-left: 4px solid #98D8C8;">
                        <h4 style="margin: 0 0 15px 0; color: #98D8C8;">${hero.name}:</h4>
                        
                        <div style="margin-bottom: 12px;">
                            <span style="font-weight: 600; color: #666;">• 세트:</span>
                            <span style="margin-left: 8px; color: #333;">${hero.equipment.set || '미설정'}</span>
                        </div>

                        <div style="margin-bottom: 12px;">
                            <span style="font-weight: 600; color: #666;">• 무기1:</span>
                            <span style="margin-left: 8px; color: #333;">${hero.equipment.weapon1 || '미설정'}</span>
                        </div>

                        <div style="margin-bottom: 12px;">
                            <span style="font-weight: 600; color: #666;">• 무기2:</span>
                            <span style="margin-left: 8px; color: #333;">${hero.equipment.weapon2 || '미설정'}</span>
                        </div>

                        <div style="margin-bottom: 12px;">
                            <span style="font-weight: 600; color: #666;">• 방어구1:</span>
                            <span style="margin-left: 8px; color: #333;">${hero.equipment.armor1 || '미설정'}</span>
                        </div>

                        <div style="margin-bottom: 12px;">
                            <span style="font-weight: 600; color: #666;">• 방어구2:</span>
                            <span style="margin-left: 8px; color: #333;">${hero.equipment.armor2 || '미설정'}</span>
                        </div>

                        ${hero.skillPriority ? `
                            <div style="background: rgba(255,253,208,0.5); padding: 12px; border-radius: 8px; margin-top: 10px;">
                                <span style="font-weight: 600; color: #666;">스킬 순서:</span>
                                <span style="margin-left: 8px; color: #333;">${hero.skillPriority}</span>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>

            ${team.tip ? `
                <div style="background: rgba(255,253,208,0.5); padding: 15px; border-radius: 10px; border-left: 4px solid #ffd93d; margin-bottom: 20px;">
                    <h5 style="margin: 0 0 8px 0; color: #666;">💡 스킬 순서:</h5>
                    <p style="margin: 0; line-height: 1.6; color: #555;">${team.tip}</p>
                </div>
            ` : ''}

            <div style="border-top: 2px solid rgba(0,0,0,0.1); padding-top: 20px; margin-top: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0; color: #666;">💬 댓글 (${comments.length})</h4>
                    <button onclick="toggleDefenseComments('${team.id}')" style="padding: 6px 12px; background: rgba(152,216,200,0.2); border: none; border-radius: 6px; cursor: pointer; font-size: 0.9em;">
                        <span id="toggle-def-${team.id}">▼ 펼치기</span>
                    </button>
                </div>
                
                <div id="def-comments-${team.id}" style="display: none;">
                    <div style="max-height: 200px; overflow-y: auto; margin-bottom: 10px;">
                        ${comments.length === 0 ? 
                            '<p style="text-align: center; color: #999; padding: 20px;">아직 댓글이 없습니다.</p>' :
                            comments.map(comment => `
                                <div style="background: rgba(255,255,255,0.5); padding: 10px; border-radius: 8px; margin-bottom: 8px; border: 1px solid rgba(0,0,0,0.05);">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                        <span style="font-weight: 600; font-size: 0.9em; color: #98D8C8;">${comment.user}</span>
                                        <span style="font-size: 0.75em; color: #999;">${new Date(comment.time).toLocaleString('ko-KR')}</span>
                                    </div>
                                    <p style="margin: 0; font-size: 0.9em; color: #555;">${comment.text}</p>
                                </div>
                            `).join('')
                        }
                    </div>

                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="def-comment-${team.id}" placeholder="댓글을 입력하세요..." style="flex: 1; padding: 8px 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.9em;">
                        <button onclick="addDefenseComment('${team.id}')" style="padding: 8px 16px; background: #98D8C8; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9em; white-space: nowrap;">
                            댓글 작성
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===========================
// 방어팀 삭제
// ===========================

async function deleteDefenseTeam(teamId) {
    if (!confirm('이 방어팀을 삭제하시겠습니까?')) return;

    try {
        await window.firestore.deleteDoc(window.firestore.doc(window.db, 'defenseTeams', teamId));
        alert('방어팀이 삭제되었습니다.');
        await loadData();
    } catch (error) {
        console.error('방어팀 삭제 오류:', error);
        alert('방어팀 삭제에 실패했습니다.');
    }
}

// ===========================
// 방어팀 댓글 토글
// ===========================

function toggleDefenseComments(teamId) {
    const container = document.getElementById(`def-comments-${teamId}`);
    const toggleBtn = document.getElementById(`toggle-def-${teamId}`);
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        toggleBtn.textContent = '▲ 접기';
    } else {
        container.style.display = 'none';
        toggleBtn.textContent = '▼ 펼치기';
    }
}

// ===========================
// 방어팀 댓글 추가
// ===========================

async function addDefenseComment(teamId) {
    const input = document.getElementById(`def-comment-${teamId}`);
    const text = input.value.trim();
    
    if (!text) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    try {
        const team = defenseTeams.find(t => t.id === teamId);
        if (!team) {
            alert('방어팀을 찾을 수 없습니다.');
            return;
        }

        const comment = {
            user: currentUser.nickname,
            text: text,
            time: new Date().toISOString()
        };

        const comments = team.comments || [];
        comments.push(comment);

        await window.firestore.updateDoc(
            window.firestore.doc(window.db, 'defenseTeams', teamId),
            { comments: comments }
        );

        input.value = '';
        await loadData();
        
        // 댓글창 자동으로 펼쳐두기
        setTimeout(() => {
            const container = document.getElementById(`def-comments-${teamId}`);
            const toggleBtn = document.getElementById(`toggle-def-${teamId}`);
            if (container && container.style.display === 'none') {
                container.style.display = 'block';
                toggleBtn.textContent = '▲ 접기';
            }
        }, 100);
        
    } catch (error) {
        console.error('댓글 추가 오류:', error);
        alert('댓글 추가에 실패했습니다.');
    }
}


// ===========================
// 방어팀 댓글 토글
// ===========================

function toggleDefenseComments(teamId) {
    const container = document.getElementById(`def-comments-${teamId}`);
    const toggleBtn = document.getElementById(`toggle-def-${teamId}`);
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        toggleBtn.textContent = '▲ 접기';
    } else {
        container.style.display = 'none';
        toggleBtn.textContent = '▼ 펼치기';
    }
}

// ===========================
// 방어팀 댓글 추가
// ===========================

async function addDefenseComment(teamId) {
    const input = document.getElementById(`def-comment-${teamId}`);
    const text = input.value.trim();
    
    if (!text) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    try {
        const team = defenseTeams.find(t => t.id === teamId);
        if (!team) {
            alert('방어팀을 찾을 수 없습니다.');
            return;
        }

        const comment = {
            user: currentUser.nickname,
            text: text,
            time: new Date().toISOString()
        };

        const comments = team.comments || [];
        comments.push(comment);

        await window.firestore.updateDoc(
            window.firestore.doc(window.db, 'defenseTeams', teamId),
            { comments: comments }
        );

        input.value = '';
        await loadData();
        
        // 댓글 영역 자동으로 펼치기
        setTimeout(() => {
            const container = document.getElementById(`def-comments-${teamId}`);
            const toggleBtn = document.getElementById(`toggle-def-${teamId}`);
            if (container && container.style.display === 'none') {
                container.style.display = 'block';
                toggleBtn.textContent = '▲ 접기';
            }
        }, 100);
        
    } catch (error) {
        console.error('댓글 추가 오류:', error);
        alert('댓글 추가에 실패했습니다.');
    }
}