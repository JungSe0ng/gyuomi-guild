// === 전역 함수 정의 ===

        function switchTab(tab) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(tab + '-tab').classList.add('active');
            const buttons = document.querySelectorAll('.tab-btn');
            if (tab === 'home') buttons[0]?.classList.add('active');
            else if (tab === 'attack') buttons[1]?.classList.add('active');
            else if (tab === 'defense') buttons[2]?.classList.add('active');
            if (tab === 'attack') switchSubTab('register');
        }

        function switchSubTab(sub) {
            document.querySelectorAll('#attack-tab .sub-content').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('#attack-tab .sub-tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(sub + '-content').classList.add('active');
            const buttons = document.querySelectorAll('#attack-tab .sub-tab-btn');
            if (sub === 'register') buttons[0]?.classList.add('active');
            else if (sub === 'list') buttons[1]?.classList.add('active');
            if (sub === 'list') renderGuides();
        }

        function switchDefenseSubTab(sub) {
            document.querySelectorAll('#defense-tab .sub-content').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('#defense-tab .sub-tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(sub + '-content').classList.add('active');
            const buttons = document.querySelectorAll('#defense-tab .sub-tab-btn');
            if (sub === 'def-register') buttons[0]?.classList.add('active');
            else if (sub === 'def-list') buttons[1]?.classList.add('active');
            if (sub === 'def-list') renderDefenseTeams();
        }

        // 데이터
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

        const equipmentSets = ['모두', '선봉장', '성기사', '암살자', '복수자', '조율자', '수문장', '수호자', '추적자', '주술사'];
        const weaponOptions = [
            '모두',
            '약점 공격 확률',
            '치명타 확률', 
            '치명타 피해',
            '모든 공격력(%)',
            '모든 공격력',
            '방어력(%)',
            '방어력',
            '생명력(%)',
            '생명력',
            '효과 적중'
        ];
        const armorOptions = [
            '모두',
            '받는 피해 감소',
            '막기 확률',
            '모든 공격력(%)',
            '모든 공격력',
            '방어력(%)',
            '방어력',
            '생명력(%)',
            '생명력',
            '효과 저항'
        ];

        let guides = [];
        let defenseTeams = [];

        // 초기화
        function init() {
            // 초기 상태: 영웅 선택 비활성화
            const heroSelects = ['defHero1', 'defHero2', 'defHero3', 'defTeamHero1', 'defTeamHero2', 'defTeamHero3'];
            heroSelects.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="">등급을 먼저 선택하세요</option>';
                    select.disabled = true;
                }
            });

            // 저장된 데이터 로드
            loadData();
            updateCounts();
            renderGuides();
            renderDefenseTeams();
            
            // 이벤트 리스너 등록
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (this.dataset.tab) {
                        switchTab(this.dataset.tab);
                    }
                });
            });
            
            document.querySelectorAll('.main-card').forEach(card => {
                if (card.dataset.tab) {
                    card.addEventListener('click', function() {
                        switchTab(this.dataset.tab);
                    });
                }
            });
            
            document.querySelectorAll('#attack-tab .sub-tab-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (this.dataset.subtab) {
                        switchSubTab(this.dataset.subtab);
                    }
                });
            });
            
            document.querySelectorAll('#defense-tab .sub-tab-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (this.dataset.subtab) {
                        switchDefenseSubTab(this.dataset.subtab);
                    }
                });
            });
        }

        // 방어 영웅 1 등급 선택
        function updateDefHero1Options(grade) {
            const select = document.getElementById('defHero1');
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

        // 방어 영웅 2 등급 선택
        function updateDefHero2Options(grade) {
            const select = document.getElementById('defHero2');
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

        // 방어 영웅 3 등급 선택
        function updateDefHero3Options(grade) {
            const select = document.getElementById('defHero3');
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

        // 방어팀 영웅 1 등급 선택
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

        // 방어팀 영웅 2 등급 선택
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

        // 방어팀 영웅 3 등급 선택
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

        // 공격 영웅 1 등급 선택
        function updateAtkHero1Options(grade) {
            const select = document.getElementById('atkHero1');
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

        // 공격 영웅 2 등급 선택
        function updateAtkHero2Options(grade) {
            const select = document.getElementById('atkHero2');
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

        // 공격 영웅 3 등급 선택
        function updateAtkHero3Options(grade) {
            const select = document.getElementById('atkHero3');
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

        // 메인 탭 전환
        window.switchTab = function(tab) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            
            document.getElementById(tab + '-tab').classList.add('active');
            
            // 해당 버튼 찾아서 active 추가
            const buttons = document.querySelectorAll('.tab-btn');
            if (tab === 'home') {
                buttons[0].classList.add('active');
            } else if (tab === 'attack') {
                buttons[1].classList.add('active');
            } else if (tab === 'defense') {
                buttons[2].classList.add('active');
            }
            
            if (tab === 'attack') {
                switchSubTab('register');
            }
        }

        // 서브 탭 전환
        window.switchSubTab = function(sub) {
            document.querySelectorAll('#attack-tab .sub-content').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('#attack-tab .sub-tab-btn').forEach(b => b.classList.remove('active'));
            
            document.getElementById(sub + '-content').classList.add('active');
            
            // 해당 버튼 찾아서 active 추가
            const buttons = document.querySelectorAll('#attack-tab .sub-tab-btn');
            if (sub === 'register') {
                buttons[0].classList.add('active');
            } else if (sub === 'list') {
                buttons[1].classList.add('active');
            }
            
            if (sub === 'list') {
                renderGuides();
            }
        }

        // 방어 서브 탭 전환
        window.switchDefenseSubTab = function(sub) {
            document.querySelectorAll('#defense-tab .sub-content').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('#defense-tab .sub-tab-btn').forEach(b => b.classList.remove('active'));
            
            document.getElementById(sub + '-content').classList.add('active');
            
            // 해당 버튼 찾아서 active 추가
            const buttons = document.querySelectorAll('#defense-tab .sub-tab-btn');
            if (sub === 'def-register') {
                buttons[0].classList.add('active');
            } else if (sub === 'def-list') {
                buttons[1].classList.add('active');
            }
            
            if (sub === 'def-list') {
                renderDefenseTeams();
            }
        }

        // 카운트 업데이트
        function updateCounts() {
            document.getElementById('attackCount').textContent = guides.length + '개 등록';
            document.getElementById('defenseCount').textContent = defenseTeams.length + '개 등록';
        }

        // 공략 저장 (방어팀만)
        window.saveGuide = function(e) {
            e.preventDefault();
            
            const guide = {
                id: Date.now(),
                name: document.getElementById('guideName').value,
                defenseHeroes: [
                    document.getElementById('defHero1').value,
                    document.getElementById('defHero2').value,
                    document.getElementById('defHero3').value
                ],
                description: document.getElementById('guideDescription').value,
                strategies: [],
                createdAt: new Date().toISOString()
            };

            guides.push(guide);
            saveData();
            updateCounts();
            renderGuides();
            
            document.getElementById('guideForm').reset();
            
            alert('공략이 등록되었습니다! 이제 공격 전략을 추가하세요.');
            switchSubTab('list');
        }

        // 공격 공략 수정
        window.editGuide = function(id) {
            const guide = guides.find(g => g.id === id);
            if (!guide) return;
            
            // 등록 탭으로 이동
            switchSubTab('register');
            
            setTimeout(() => {
                document.getElementById('guideName').value = guide.name;
                
                // 방어 영웅들의 등급 찾아서 선택
                if (guide.defenseHeroes[0]) {
                    let grade1 = null;
                    for (const [g, heroes] of Object.entries(heroData)) {
                        if (heroes.includes(guide.defenseHeroes[0])) {
                            grade1 = g;
                            break;
                        }
                    }
                    const gradeSelect1 = document.querySelectorAll('#register-content select[onchange*="updateDefHero"]')[0];
                    if (gradeSelect1 && grade1) {
                        gradeSelect1.value = grade1;
                        updateDefHero1Options(grade1);
                        setTimeout(() => {
                            document.getElementById('defHero1').value = guide.defenseHeroes[0];
                        }, 50);
                    }
                }
                
                if (guide.defenseHeroes[1]) {
                    let grade2 = null;
                    for (const [g, heroes] of Object.entries(heroData)) {
                        if (heroes.includes(guide.defenseHeroes[1])) {
                            grade2 = g;
                            break;
                        }
                    }
                    const gradeSelect2 = document.querySelectorAll('#register-content select[onchange*="updateDefHero"]')[1];
                    if (gradeSelect2 && grade2) {
                        gradeSelect2.value = grade2;
                        updateDefHero2Options(grade2);
                        setTimeout(() => {
                            document.getElementById('defHero2').value = guide.defenseHeroes[1];
                        }, 50);
                    }
                }
                
                if (guide.defenseHeroes[2]) {
                    let grade3 = null;
                    for (const [g, heroes] of Object.entries(heroData)) {
                        if (heroes.includes(guide.defenseHeroes[2])) {
                            grade3 = g;
                            break;
                        }
                    }
                    const gradeSelect3 = document.querySelectorAll('#register-content select[onchange*="updateDefHero"]')[2];
                    if (gradeSelect3 && grade3) {
                        gradeSelect3.value = grade3;
                        updateDefHero3Options(grade3);
                        setTimeout(() => {
                            document.getElementById('defHero3').value = guide.defenseHeroes[2];
                        }, 50);
                    }
                }
                
                if (guide.description) {
                    document.getElementById('guideDescription').value = guide.description;
                }
                
                // 폼 제출 시 기존 공략 업데이트
                const form = document.getElementById('guideForm');
                form.onsubmit = function(e) {
                    e.preventDefault();
                    
                    guide.name = document.getElementById('guideName').value;
                    guide.defenseHeroes = [
                        document.getElementById('defHero1').value,
                        document.getElementById('defHero2').value,
                        document.getElementById('defHero3').value
                    ];
                    guide.description = document.getElementById('guideDescription').value;
                    
                    saveData();
                    updateCounts();
                    renderGuides();
                    
                    form.reset();
                    alert('공략이 수정되었습니다!');
                    switchSubTab('list');
                    
                    // 폼 제출 핸들러 원래대로 복구
                    form.onsubmit = saveGuide;
                };
            }, 100);
        }

        // 공략 목록 렌더링
        window.renderGuides = function() {
            const container = document.getElementById('guideList');
            
            if (guides.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div>🐰✨</div>
                        <h3>등록된 공략이 없습니다</h3>
                        <p>첫 번째 공략을 등록해보세요!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = guides.map(guide => `
                <div class="guide-item">
                    <div class="guide-header">
                        <div class="guide-title">${guide.name}</div>
                        <div class="guide-actions">
                            ${currentUser && currentUser.role === 'admin' ? `
                                <button class="btn btn-warning" onclick="editGuide(${guide.id})" style="background: linear-gradient(135deg, #FFD93D, #FFC107);">수정</button>
                                <button class="btn btn-success" onclick="openStrategyModal(${guide.id})">+ 공격 전략 추가</button>
                                <button class="btn btn-danger" onclick="deleteGuide(${guide.id})">삭제</button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong>🛡️ 상대 방어:</strong><br>
                        ${guide.defenseHeroes.map(h => `<span class="hero-badge">${h}</span>`).join('')}
                    </div>
                    
                    ${guide.description ? `<p style="color: #666; margin-bottom: 15px;">${guide.description}</p>` : ''}
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                        <strong>⚔️ 공격 전략 (${guide.strategies.length}개):</strong>
                        ${guide.strategies.length > 0 ? guide.strategies.map((s, idx) => `
                            <div style="margin: 10px 0; background: white; border-radius: 8px; border-left: 4px solid #667eea; overflow: hidden;">
                                <div style="padding: 15px; cursor: pointer; background: linear-gradient(135deg, #f8f9fa, #ffffff);" onclick="toggleStrategy('${guide.id}-${idx}')">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <span id="toggle-icon-${guide.id}-${idx}" style="font-size: 1.2em; transition: transform 0.3s;">▶</span>
                                            <strong style="font-size: 1.05em;">${s.name}</strong>
                                        </div>
                                        ${currentUser && currentUser.role === 'admin' ? `
                                            <div style="display: flex; gap: 8px;" onclick="event.stopPropagation()">
                                                <button class="btn btn-warning" style="padding: 8px 16px; font-size: 0.9em; background: linear-gradient(135deg, #ffc107, #ff9800);" onclick="editStrategy(${guide.id}, ${idx})">수정</button>
                                                <button class="btn btn-danger" style="padding: 8px 16px; font-size: 0.9em;" onclick="deleteStrategy(${guide.id}, ${idx})">삭제</button>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                                
                                <div id="strategy-content-${guide.id}-${idx}" style="display: none; padding: 15px; border-top: 1px solid #e0e0e0;">
                                    <strong style="color: #667eea;">공격 영웅:</strong> ${s.heroes.map(h => h.name).join(', ')}<br>
                                    ${s.heroes.map(h => `
                                        <div style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 5px; font-size: 0.95em;">
                                            <strong>${h.name}</strong>
                                            ${h.set ? ` | 📦 ${h.set}` : ''}
                                            ${h.w1 ? ` | ⚔️ 무기1: ${h.w1}` : ''}
                                            ${h.w2 ? ` | ⚔️ 무기2: ${h.w2}` : ''}
                                            ${h.a1 ? ` | 🛡️ 방어구1: ${h.a1}` : ''}
                                            ${h.a2 ? ` | 🛡️ 방어구2: ${h.a2}` : ''}
                                        </div>
                                    `).join('')}
                                    ${s.skills && s.skills.length > 0 ? `<div style="margin-top: 10px; padding: 10px; background: #fff8e1; border-radius: 5px; border-left: 3px solid #ffc107;"><strong>🎯 스킬 순서:</strong> ${s.skills.join(' → ')}</div>` : ''}
                                    ${s.tip ? `<div style="margin-top: 8px; padding: 10px; background: #e3f2fd; border-radius: 5px; border-left: 3px solid #2196f3;"><strong>💡 운용 팁:</strong> ${s.tip}</div>` : ''}
                                    
                                    <!-- 전략별 댓글 -->
                                    <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                                        <h5 style="margin: 0 0 10px 0; color: #667eea;">💬 댓글 (${s.comments ? s.comments.length : 0})</h5>
                                        ${generateStrategyCommentsHtml(guide.id, idx, s.comments)}
                                        ${generateStrategyCommentFormHtml(guide.id, idx)}
                                    </div>
                                </div>
                            </div>
                        `).join('') : '<p style="color: #999; margin: 10px 0;">등록된 공격 전략이 없습니다. 추가 버튼을 클릭하세요.</p>'}
                    </div>
                    

                    
                    <div style="text-align: right; color: #999; font-size: 0.9em; margin-top: 10px;">
                        등록일: ${new Date(guide.createdAt).toLocaleString('ko-KR')}
                    </div>
                </div>
            `).join('');
        }



// 공략 검색 필터
function filterGuides() {
    const searchTerm = document.getElementById('searchGuide').value.toLowerCase().trim();
    const guideItems = document.querySelectorAll('#guideList .guide-item');
    
    guideItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

        // 공격 전략 모달 열기
        let currentGuideId = null;
        window.openStrategyModal = function(guideId) {
            currentGuideId = guideId;
            const guide = guides.find(g => g.id === guideId);
            
            const modalHtml = `
                <div id="strategyModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; overflow-y: auto;">
                    <div style="background: white; border-radius: 20px; max-width: 900px; width: 100%; margin: auto; padding: 0;">
                        <div style="position: sticky; top: 0; background: white; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 30px; border-bottom: 2px solid #f0f0f0; border-radius: 20px 20px 0 0;">
                            <h2 style="color: #667eea; margin: 0;">⚔️ 공격 전략 추가</h2>
                            <button onclick="closeStrategyModal()" style="background: none; border: none; font-size: 2em; cursor: pointer; color: #999; line-height: 1;">&times;</button>
                        </div>
                        
                        <div style="padding: 30px; max-height: calc(90vh - 150px); overflow-y: auto;">
                            <form id="strategyForm" onsubmit="saveStrategy(event)">
                                <div class="form-group">
                                    <label>전략 이름</label>
                                    <input type="text" id="strategyName" placeholder="예: 스파이크 중심 돌파" required>
                                </div>

                                <div class="form-group">
                                    <label>공격 영웅 (3명)</label>
                                    <div class="hero-grid">
                                        <div>
                                            <select onchange="updateAtkHero1Options(this.value)" style="margin-bottom: 8px;">
                                                <option value="">등급 선택</option>
                                                <option value="구세나">구세나</option>
                                                <option value="찐스">찐스</option>
                                                <option value="짭스">짭스</option>
                                                <option value="희귀">희귀</option>
                                            </select>
                                            <select id="atkHero1" required onchange="updateStrategyEquipment()" disabled>
                                                <option value="">영웅 선택</option>
                                            </select>
                                        </div>
                                        <div>
                                            <select onchange="updateAtkHero2Options(this.value)" style="margin-bottom: 8px;">
                                                <option value="">등급 선택</option>
                                                <option value="구세나">구세나</option>
                                                <option value="찐스">찐스</option>
                                                <option value="짭스">짭스</option>
                                                <option value="희귀">희귀</option>
                                            </select>
                                            <select id="atkHero2" required onchange="updateStrategyEquipment()" disabled>
                                                <option value="">영웅 선택</option>
                                            </select>
                                        </div>
                                        <div>
                                            <select onchange="updateAtkHero3Options(this.value)" style="margin-bottom: 8px;">
                                                <option value="">등급 선택</option>
                                                <option value="구세나">구세나</option>
                                                <option value="찐스">찐스</option>
                                                <option value="짭스">짭스</option>
                                                <option value="희귀">희귀</option>
                                            </select>
                                            <select id="atkHero3" required onchange="updateStrategyEquipment()" disabled>
                                                <option value="">영웅 선택</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div id="strategyEquipmentContainer"></div>

                                <div class="skill-section">
                                    <h4>🎯 스킬 사용 순서</h4>
                                    <p style="margin-bottom: 15px; color: #666;">각 영웅이 보유한 스킬 6개 중 3개를 순서대로 선택하세요</p>
                                    <div class="skill-grid" id="availableSkills"></div>
                                    <div class="form-group">
                                        <label>스킬 순서 (3개 선택)</label>
                                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                                            <select id="skillOrder1" required>
                                                <option value="">1순위</option>
                                            </select>
                                            <select id="skillOrder2" required>
                                                <option value="">2순위</option>
                                            </select>
                                            <select id="skillOrder3" required>
                                                <option value="">3순위</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>전체 운용 팁</label>
                                    <textarea id="strategyTip" rows="3" placeholder="전체적인 공격 순서, 포지셔닝, 타이밍 등"></textarea>
                                </div>

                                <div style="position: sticky; bottom: 0; background: white; padding: 20px 0; margin-top: 20px; border-top: 2px solid #f0f0f0;">
                                    <button type="submit" class="btn btn-primary" style="width: 100%;">전략 추가하기</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // 영웅 셀렉트 초기화
            ['atkHero1', 'atkHero2', 'atkHero3'].forEach(id => {
                const select = document.getElementById(id);
                select.disabled = true;
                select.innerHTML = '<option value="">등급을 먼저 선택하세요</option>';
            });
        }

        // 모달 닫기
        window.closeStrategyModal = function() {
            const modal = document.getElementById('strategyModal');
            if (modal) modal.remove();
            currentGuideId = null;
        }

        // 전략 장비 UI 업데이트
        function updateStrategyEquipment() {
            const hero1 = document.getElementById('atkHero1').value;
            const hero2 = document.getElementById('atkHero2').value;
            const hero3 = document.getElementById('atkHero3').value;
            
            const selectedHeroes = [
                { name: hero1, id: 1 },
                { name: hero2, id: 2 },
                { name: hero3, id: 3 }
            ].filter(h => h.name);

            // 장비 UI
            const container = document.getElementById('strategyEquipmentContainer');
            container.innerHTML = selectedHeroes.map(hero => `
                <div class="equipment-section">
                    <h4>🎖️ ${hero.name} 장비 세팅</h4>
                    
                    <div class="form-group">
                        <label>공통 세트</label>
                        <select id="set${hero.id}">
                            <option value="">세트 선택</option>
                            ${equipmentSets.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>

                    <div class="equipment-grid">
                        <div class="equipment-col">
                            <h5>⚔️ 무기</h5>
                            <div class="equipment-item">
                                <label>무기1 옵션</label>
                                <select id="w1${hero.id}">
                                    <option value="">옵션 선택</option>
                                    ${weaponOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                                </select>
                            </div>
                            <div class="equipment-item">
                                <label>무기2 옵션</label>
                                <select id="w2${hero.id}">
                                    <option value="">옵션 선택</option>
                                    ${weaponOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="equipment-col">
                            <h5>🛡️ 방어구</h5>
                            <div class="equipment-item">
                                <label>방어구1 옵션</label>
                                <select id="a1${hero.id}">
                                    <option value="">옵션 선택</option>
                                    ${armorOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                                </select>
                            </div>
                            <div class="equipment-item">
                                <label>방어구2 옵션</label>
                                <select id="a2${hero.id}">
                                    <option value="">옵션 선택</option>
                                    ${armorOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // 스킬 UI - 영웅 3명의 스킬 표시
            const skillContainer = document.getElementById('availableSkills');
            const skillSelects = ['skillOrder1', 'skillOrder2', 'skillOrder3'];
            
            if (selectedHeroes.length === 3) {
                // 배지용 스킬 순서 (2가 먼저)
                const badgeSkills = [
                    `${hero1} 스킬2`,
                    `${hero2} 스킬2`,
                    `${hero3} 스킬2`,
                    `${hero1} 스킬1`,
                    `${hero2} 스킬1`,
                    `${hero3} 스킬1`
                ];

                // 드롭다운용 스킬 순서 (1이 먼저)
                const dropdownSkills = [
                    `${hero1} 스킬1`,
                    `${hero1} 스킬2`,
                    `${hero2} 스킬1`,
                    `${hero2} 스킬2`,
                    `${hero3} 스킬1`,
                    `${hero3} 스킬2`
                ];

                skillContainer.innerHTML = badgeSkills.map(skill => 
                    `<div class="skill-badge">${skill}</div>`
                ).join('');

                // 스킬 선택 드롭다운 업데이트
                skillSelects.forEach(selectId => {
                    const select = document.getElementById(selectId);
                    const currentValue = select.value;
                    const placeholder = selectId === 'skillOrder1' ? '1순위' : selectId === 'skillOrder2' ? '2순위' : '3순위';
                    select.innerHTML = `<option value="">${placeholder}</option>`;
                    dropdownSkills.forEach(skill => {
                        select.innerHTML += `<option value="${skill}">${skill}</option>`;
                    });
                    if (currentValue) select.value = currentValue;
                });
            } else {
                skillContainer.innerHTML = '<p style="color: #999; text-align: center;">영웅 3명을 모두 선택하세요</p>';
            }
        }

        // 전략 저장
        function saveStrategy(e) {
            e.preventDefault();
            
            const hero1 = document.getElementById('atkHero1').value;
            const hero2 = document.getElementById('atkHero2').value;
            const hero3 = document.getElementById('atkHero3').value;

            const strategy = {
                name: document.getElementById('strategyName').value,
                heroes: [
                    {
                        name: hero1,
                        set: document.getElementById('set1')?.value || '',
                        w1: document.getElementById('w11')?.value || '',
                        w2: document.getElementById('w21')?.value || '',
                        a1: document.getElementById('a11')?.value || '',
                        a2: document.getElementById('a21')?.value || ''
                    },
                    {
                        name: hero2,
                        set: document.getElementById('set2')?.value || '',
                        w1: document.getElementById('w12')?.value || '',
                        w2: document.getElementById('w22')?.value || '',
                        a1: document.getElementById('a12')?.value || '',
                        a2: document.getElementById('a22')?.value || ''
                    },
                    {
                        name: hero3,
                        set: document.getElementById('set3')?.value || '',
                        w1: document.getElementById('w13')?.value || '',
                        w2: document.getElementById('w23')?.value || '',
                        a1: document.getElementById('a13')?.value || '',
                        a2: document.getElementById('a23')?.value || ''
                    }
                ].filter(h => h.name),
                skills: [
                    document.getElementById('skillOrder1')?.value,
                    document.getElementById('skillOrder2')?.value,
                    document.getElementById('skillOrder3')?.value
                ].filter(s => s),
                tip: document.getElementById('strategyTip').value
            };

            const guide = guides.find(g => g.id === currentGuideId);
            if (guide) {
                guide.strategies.push(strategy);
                saveData();
                renderGuides();
                closeStrategyModal();
                alert('공격 전략이 추가되었습니다!');
            }
        }

        // 전략 삭제
        window.deleteStrategy = function(guideId, strategyIdx) {
            if (!confirm('이 전략을 삭제하시겠습니까?')) return;
            
            const guide = guides.find(g => g.id === guideId);
            if (guide) {
                guide.strategies.splice(strategyIdx, 1);
                saveData();
                renderGuides();
            }
        }

        // 전략 수정
        window.editStrategy = function(guideId, strategyIdx) {
            const guide = guides.find(g => g.id === guideId);
            if (!guide || !guide.strategies[strategyIdx]) return;
            
            const strategy = guide.strategies[strategyIdx];
            currentGuideId = guideId;
            
            // 모달 열기
            openStrategyModal(guideId);
            
            // 약간의 딜레이 후 폼에 데이터 채우기
            setTimeout(() => {
                document.getElementById('strategyName').value = strategy.name;
                
                // 영웅 등급 선택 활성화 및 영웅 선택
                if (strategy.heroes[0]) {
                    // 영웅 이름으로 등급 찾기
                    let grade1 = null;
                    for (const [g, heroes] of Object.entries(heroData)) {
                        if (heroes.includes(strategy.heroes[0].name)) {
                            grade1 = g;
                            break;
                        }
                    }
                    // 등급 선택 드롭다운 찾아서 선택
                    const gradeSelect1 = document.querySelector('#strategyModal select[onchange*="updateAtkHero1Options"]');
                    if (gradeSelect1 && grade1) {
                        gradeSelect1.value = grade1;
                        updateAtkHero1Options(grade1);
                        setTimeout(() => {
                            document.getElementById('atkHero1').value = strategy.heroes[0].name;
                        }, 50);
                    }
                }
                if (strategy.heroes[1]) {
                    let grade2 = null;
                    for (const [g, heroes] of Object.entries(heroData)) {
                        if (heroes.includes(strategy.heroes[1].name)) {
                            grade2 = g;
                            break;
                        }
                    }
                    const gradeSelect2 = document.querySelector('#strategyModal select[onchange*="updateAtkHero2Options"]');
                    if (gradeSelect2 && grade2) {
                        gradeSelect2.value = grade2;
                        updateAtkHero2Options(grade2);
                        setTimeout(() => {
                            document.getElementById('atkHero2').value = strategy.heroes[1].name;
                        }, 50);
                    }
                }
                if (strategy.heroes[2]) {
                    let grade3 = null;
                    for (const [g, heroes] of Object.entries(heroData)) {
                        if (heroes.includes(strategy.heroes[2].name)) {
                            grade3 = g;
                            break;
                        }
                    }
                    const gradeSelect3 = document.querySelector('#strategyModal select[onchange*="updateAtkHero3Options"]');
                    if (gradeSelect3 && grade3) {
                        gradeSelect3.value = grade3;
                        updateAtkHero3Options(grade3);
                        setTimeout(() => {
                            document.getElementById('atkHero3').value = strategy.heroes[2].name;
                        }, 50);
                    }
                }
                
                // 장비 UI 업데이트 (영웅 선택 완료 후)
                setTimeout(() => {
                    updateStrategyEquipment();
                    
                    // 장비 UI가 생성된 후 데이터 채우기
                    setTimeout(() => {
                        strategy.heroes.forEach((hero, idx) => {
                        const id = idx + 1;
                        if (document.getElementById(`set${id}`)) {
                            document.getElementById(`set${id}`).value = hero.set || '';
                        }
                        if (document.getElementById(`w1${id}`)) {
                            document.getElementById(`w1${id}`).value = hero.w1 || '';
                        }
                        if (document.getElementById(`w2${id}`)) {
                            document.getElementById(`w2${id}`).value = hero.w2 || '';
                        }
                        if (document.getElementById(`a1${id}`)) {
                            document.getElementById(`a1${id}`).value = hero.a1 || '';
                        }
                        if (document.getElementById(`a2${id}`)) {
                            document.getElementById(`a2${id}`).value = hero.a2 || '';
                        }
                    });
                    
                    // 스킬 선택
                    if (strategy.skills && strategy.skills.length > 0) {
                        if (document.getElementById('skillOrder1')) {
                            document.getElementById('skillOrder1').value = strategy.skills[0] || '';
                        }
                        if (document.getElementById('skillOrder2')) {
                            document.getElementById('skillOrder2').value = strategy.skills[1] || '';
                        }
                        if (document.getElementById('skillOrder3')) {
                            document.getElementById('skillOrder3').value = strategy.skills[2] || '';
                        }
                    }
                    
                        // 팁
                        if (document.getElementById('strategyTip')) {
                            document.getElementById('strategyTip').value = strategy.tip || '';
                        }
                    }, 150);
                }, 100);
                
                // 폼 제출 시 기존 전략 업데이트
                const form = document.getElementById('strategyForm');
                form.onsubmit = function(e) {
                    e.preventDefault();
                    
                    const hero1 = document.getElementById('atkHero1').value;
                    const hero2 = document.getElementById('atkHero2').value;
                    const hero3 = document.getElementById('atkHero3').value;

                    const updatedStrategy = {
                        name: document.getElementById('strategyName').value,
                        heroes: [
                            {
                                name: hero1,
                                set: document.getElementById('set1')?.value || '',
                                w1: document.getElementById('w11')?.value || '',
                                w2: document.getElementById('w21')?.value || '',
                                a1: document.getElementById('a11')?.value || '',
                                a2: document.getElementById('a21')?.value || ''
                            },
                            {
                                name: hero2,
                                set: document.getElementById('set2')?.value || '',
                                w1: document.getElementById('w12')?.value || '',
                                w2: document.getElementById('w22')?.value || '',
                                a1: document.getElementById('a12')?.value || '',
                                a2: document.getElementById('a22')?.value || ''
                            },
                            {
                                name: hero3,
                                set: document.getElementById('set3')?.value || '',
                                w1: document.getElementById('w13')?.value || '',
                                w2: document.getElementById('w23')?.value || '',
                                a1: document.getElementById('a13')?.value || '',
                                a2: document.getElementById('a23')?.value || ''
                            }
                        ].filter(h => h.name),
                        skills: [
                            document.getElementById('skillOrder1')?.value,
                            document.getElementById('skillOrder2')?.value,
                            document.getElementById('skillOrder3')?.value
                        ].filter(s => s),
                        tip: document.getElementById('strategyTip').value
                    };

                    // 기존 전략 교체
                    guide.strategies[strategyIdx] = updatedStrategy;
                    saveData();
                    renderGuides();
                    closeStrategyModal();
                    alert('전략이 수정되었습니다!');
                    
                    // 폼 제출 핸들러 원래대로 복구
                    form.onsubmit = saveStrategy;
                };
            }, 100);
        }

        // 공략 삭제
        window.deleteGuide = function(id) {
            if (!confirm('정말 삭제하시겠습니까?')) return;
            guides = guides.filter(g => g.id !== id);
            saveData();
            updateCounts();
            renderGuides();
        }

        // 방어팀 장비 UI 업데이트
        function updateDefenseEquipment() {
            const hero1 = document.getElementById('defTeamHero1').value;
            const hero2 = document.getElementById('defTeamHero2').value;
            const hero3 = document.getElementById('defTeamHero3').value;
            
            const selectedHeroes = [
                { name: hero1, id: 1 },
                { name: hero2, id: 2 },
                { name: hero3, id: 3 }
            ].filter(h => h.name);

            const container = document.getElementById('defenseEquipmentContainer');
            
            // 장비 UI
            let html = selectedHeroes.map(hero => `
                <div class="equipment-section">
                    <h4>🎖️ ${hero.name} 장비 세팅</h4>
                    
                    <div class="form-group">
                        <label>공통 세트</label>
                        <select id="defSet${hero.id}">
                            <option value="">세트 선택</option>
                            ${equipmentSets.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>

                    <div class="equipment-grid">
                        <div class="equipment-col">
                            <h5>⚔️ 무기</h5>
                            <div class="equipment-item">
                                <label>무기1 옵션</label>
                                <select id="defW1${hero.id}">
                                    <option value="">옵션 선택</option>
                                    ${weaponOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                                </select>
                            </div>
                            <div class="equipment-item">
                                <label>무기2 옵션</label>
                                <select id="defW2${hero.id}">
                                    <option value="">옵션 선택</option>
                                    ${weaponOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="equipment-col">
                            <h5>🛡️ 방어구</h5>
                            <div class="equipment-item">
                                <label>방어구1 옵션</label>
                                <select id="defA1${hero.id}">
                                    <option value="">옵션 선택</option>
                                    ${armorOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                                </select>
                            </div>
                            <div class="equipment-item">
                                <label>방어구2 옵션</label>
                                <select id="defA2${hero.id}">
                                    <option value="">옵션 선택</option>
                                    ${armorOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // 스킬 순서 UI
            if (selectedHeroes.length === 3) {
                // 배지용 스킬 순서 (2가 먼저)
                const badgeSkills = [
                    `${hero1} 스킬2`,
                    `${hero2} 스킬2`,
                    `${hero3} 스킬2`,
                    `${hero1} 스킬1`,
                    `${hero2} 스킬1`,
                    `${hero3} 스킬1`
                ];

                // 드롭다운용 스킬 순서 (1이 먼저)
                const dropdownSkills = [
                    `${hero1} 스킬1`,
                    `${hero1} 스킬2`,
                    `${hero2} 스킬1`,
                    `${hero2} 스킬2`,
                    `${hero3} 스킬1`,
                    `${hero3} 스킬2`
                ];

                html += `
                    <div class="skill-section">
                        <h4>🎯 스킬 사용 순서</h4>
                        <p style="margin-bottom: 15px; color: #666;">각 영웅이 보유한 스킬 6개 중 3개를 순서대로 선택하세요</p>
                        <div class="skill-grid">
                            ${badgeSkills.map(skill => `<div class="skill-badge">${skill}</div>`).join('')}
                        </div>
                        <div class="form-group">
                            <label>스킬 순서 (3개 선택)</label>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                                <select id="defSkillOrder1" required>
                                    <option value="">1순위</option>
                                    ${dropdownSkills.map(s => {
                                        // displayText 제거 - 원본 그대로 사용
                                        return `<option value="${s}">${s}</option>`;
                                    }).join('')}
                                </select>
                                <select id="defSkillOrder2" required>
                                    <option value="">2순위</option>
                                    ${dropdownSkills.map(s => {
                                        // displayText 제거 - 원본 그대로 사용
                                        return `<option value="${s}">${s}</option>`;
                                    }).join('')}
                                </select>
                                <select id="defSkillOrder3" required>
                                    <option value="">3순위</option>
                                    ${dropdownSkills.map(s => {
                                        // displayText 제거 - 원본 그대로 사용
                                        return `<option value="${s}">${s}</option>`;
                                    }).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                `;
            }

            container.innerHTML = html;
        }

        // 방어팀 저장
        function saveDefenseTeam(e) {
            e.preventDefault();
            
            const hero1 = document.getElementById('defTeamHero1').value;
            const hero2 = document.getElementById('defTeamHero2').value;
            const hero3 = document.getElementById('defTeamHero3').value;

            const team = {
                id: Date.now(),
                name: document.getElementById('defenseName').value,
                heroes: [
                    {
                        name: hero1,
                        set: document.getElementById('defSet1')?.value || '',
                        w1: document.getElementById('defW11')?.value || '',
                        w2: document.getElementById('defW21')?.value || '',
                        a1: document.getElementById('defA11')?.value || '',
                        a2: document.getElementById('defA21')?.value || ''
                    },
                    {
                        name: hero2,
                        set: document.getElementById('defSet2')?.value || '',
                        w1: document.getElementById('defW12')?.value || '',
                        w2: document.getElementById('defW22')?.value || '',
                        a1: document.getElementById('defA12')?.value || '',
                        a2: document.getElementById('defA22')?.value || ''
                    },
                    {
                        name: hero3,
                        set: document.getElementById('defSet3')?.value || '',
                        w1: document.getElementById('defW13')?.value || '',
                        w2: document.getElementById('defW23')?.value || '',
                        a1: document.getElementById('defA13')?.value || '',
                        a2: document.getElementById('defA23')?.value || ''
                    }
                ].filter(h => h.name),
                skills: [
                    document.getElementById('defSkillOrder1')?.value,
                    document.getElementById('defSkillOrder2')?.value,
                    document.getElementById('defSkillOrder3')?.value
                ].filter(s => s),
                tip: document.getElementById('defenseTip').value,
                createdAt: new Date().toISOString()
            };

            defenseTeams.push(team);
            saveData();
            updateCounts();
            renderDefenseTeams();
            
            document.getElementById('defenseForm').reset();
            document.getElementById('defenseEquipmentContainer').innerHTML = '';
            
            alert('방어팀이 저장되었습니다!');
            switchDefenseSubTab('def-list');
        }

        // 방어팀 목록 렌더링
        function renderDefenseTeams() {
            const container = document.getElementById('defenseList');
            
            if (defenseTeams.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div>🐰✨</div>
                        <h3>등록된 방어팀이 없습니다</h3>
                        <p>첫 번째 방어팀을 등록해보세요!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = defenseTeams.map(team => `
                <div class="guide-item">
                    <div class="guide-header">
                        <div class="guide-title">${team.name}</div>
                        <div class="guide-actions">
                            ${currentUser && currentUser.role === 'admin' ? `
                                <button class="btn btn-warning" style="background: linear-gradient(135deg, #ffc107, #ff9800);" onclick="editDefenseTeam(${team.id})">수정</button>
                                <button class="btn btn-danger" onclick="deleteDefenseTeam(${team.id})">삭제</button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong>🛡️ 방어 영웅:</strong><br>
                        ${team.heroes.map(h => `
                            <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                                <strong>${h.name}</strong>
                                ${h.set ? `<br>📦 세트: ${h.set}` : ''}
                                ${h.w1 ? `<br>⚔️ 무기1: ${h.w1}` : ''}
                                ${h.w2 ? `<br>⚔️ 무기2: ${h.w2}` : ''}
                                ${h.a1 ? `<br>🛡️ 방어구1: ${h.a1}` : ''}
                                ${h.a2 ? `<br>🛡️ 방어구2: ${h.a2}` : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    ${team.skills && team.skills.length > 0 ? `
                        <div style="margin-bottom: 15px; padding: 15px; background: #fff8e1; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <strong>🎯 스킬 순서:</strong> ${team.skills.join(' → ')}
                        </div>
                    ` : ''}
                    
                    ${team.tip ? `
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
                            <strong>💡 운용 팁:</strong><br>
                            ${team.tip}
                        </div>
                    ` : ''}
                    
                    <!-- 댓글 섹션 -->
                    <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                        <h4 style="margin: 0 0 15px 0; color: #667eea;">💬 댓글 (${team.comments ? team.comments.length : 0})</h4>
                        ${generateCommentsHtml('defense', team.id, team.comments)}
                        ${generateCommentFormHtml('defense', team.id)}
                    </div>
                    
                    <div style="text-align: right; color: #999; font-size: 0.9em; margin-top: 10px;">
                        등록일: ${new Date(team.createdAt).toLocaleString('ko-KR')}
                    </div>
                </div>
            `).join('');
        }

        // 방어팀 삭제
        window.deleteDefenseTeam = function(id) {
            if (!confirm('정말 삭제하시겠습니까?')) return;
            defenseTeams = defenseTeams.filter(t => t.id !== id);
            saveData();
            updateCounts();
            renderDefenseTeams();
        }

        // 방어팀 수정
        window.editDefenseTeam = function(id) {
            const team = defenseTeams.find(t => t.id === id);
            if (!team) return;
            
            // 등록 탭으로 이동
            switchDefenseSubTab('def-register');
            
            // 약간의 딜레이 후 폼에 데이터 채우기
            setTimeout(() => {
                document.getElementById('defenseName').value = team.name;
                
                // 영웅 선택
                if (team.heroes[0]) {
                    document.getElementById('defTeamHero1').value = team.heroes[0].name;
                }
                if (team.heroes[1]) {
                    document.getElementById('defTeamHero2').value = team.heroes[1].name;
                }
                if (team.heroes[2]) {
                    document.getElementById('defTeamHero3').value = team.heroes[2].name;
                }
                
                // 장비 UI 업데이트
                updateDefenseEquipment();
                
                // 약간의 딜레이 후 장비 및 스킬 데이터 채우기
                setTimeout(() => {
                    team.heroes.forEach((hero, idx) => {
                        const heroId = idx + 1;
                        if (document.getElementById(`defSet${heroId}`)) {
                            document.getElementById(`defSet${heroId}`).value = hero.set || '';
                        }
                        if (document.getElementById(`defW1${heroId}`)) {
                            document.getElementById(`defW1${heroId}`).value = hero.w1 || '';
                        }
                        if (document.getElementById(`defW2${heroId}`)) {
                            document.getElementById(`defW2${heroId}`).value = hero.w2 || '';
                        }
                        if (document.getElementById(`defA1${heroId}`)) {
                            document.getElementById(`defA1${heroId}`).value = hero.a1 || '';
                        }
                        if (document.getElementById(`defA2${heroId}`)) {
                            document.getElementById(`defA2${heroId}`).value = hero.a2 || '';
                        }
                    });
                    
                    // 스킬 선택
                    if (team.skills && team.skills.length > 0) {
                        if (document.getElementById('defSkillOrder1')) {
                            document.getElementById('defSkillOrder1').value = team.skills[0] || '';
                        }
                        if (document.getElementById('defSkillOrder2')) {
                            document.getElementById('defSkillOrder2').value = team.skills[1] || '';
                        }
                        if (document.getElementById('defSkillOrder3')) {
                            document.getElementById('defSkillOrder3').value = team.skills[2] || '';
                        }
                    }
                    
                    // 팁
                    if (document.getElementById('defenseTip')) {
                        document.getElementById('defenseTip').value = team.tip || '';
                    }
                }, 100);
                
                // 폼 제출 시 기존 팀 업데이트
                const form = document.getElementById('defenseForm');
                form.onsubmit = function(e) {
                    e.preventDefault();
                    
                    const hero1 = document.getElementById('defTeamHero1').value;
                    const hero2 = document.getElementById('defTeamHero2').value;
                    const hero3 = document.getElementById('defTeamHero3').value;

                    const updatedTeam = {
                        id: team.id,
                        name: document.getElementById('defenseName').value,
                        heroes: [
                            {
                                name: hero1,
                                set: document.getElementById('defSet1')?.value || '',
                                w1: document.getElementById('defW11')?.value || '',
                                w2: document.getElementById('defW21')?.value || '',
                                a1: document.getElementById('defA11')?.value || '',
                                a2: document.getElementById('defA21')?.value || ''
                            },
                            {
                                name: hero2,
                                set: document.getElementById('defSet2')?.value || '',
                                w1: document.getElementById('defW12')?.value || '',
                                w2: document.getElementById('defW22')?.value || '',
                                a1: document.getElementById('defA12')?.value || '',
                                a2: document.getElementById('defA22')?.value || ''
                            },
                            {
                                name: hero3,
                                set: document.getElementById('defSet3')?.value || '',
                                w1: document.getElementById('defW13')?.value || '',
                                w2: document.getElementById('defW23')?.value || '',
                                a1: document.getElementById('defA13')?.value || '',
                                a2: document.getElementById('defA23')?.value || ''
                            }
                        ].filter(h => h.name),
                        skills: [
                            document.getElementById('defSkillOrder1')?.value,
                            document.getElementById('defSkillOrder2')?.value,
                            document.getElementById('defSkillOrder3')?.value
                        ].filter(s => s),
                        tip: document.getElementById('defenseTip').value,
                        createdAt: team.createdAt
                    };

                    // 기존 팀 교체
                    const index = defenseTeams.findIndex(t => t.id === id);
                    if (index !== -1) {
                        defenseTeams[index] = updatedTeam;
                        saveData();
                        updateCounts();
                        renderDefenseTeams();
                        
                        form.reset();
                        document.getElementById('defenseEquipmentContainer').innerHTML = '';
                        
                        alert('방어팀이 수정되었습니다!');
                        switchDefenseSubTab('def-list');
                        
                        // 폼 제출 핸들러 원래대로 복구
                        form.onsubmit = saveDefenseTeam;
                    }
                };
            }, 100);
        }

        // 데이터 저장
        function saveData() {
            localStorage.setItem('guides', JSON.stringify(guides));
            localStorage.setItem('defenseTeams', JSON.stringify(defenseTeams));
        }

        // 데이터 로드
        function loadData() {
            guides = JSON.parse(localStorage.getItem('guides') || '[]');
            defenseTeams = JSON.parse(localStorage.getItem('defenseTeams') || '[]');
        }

        // 페이지 로드 시 초기화
        init();
// ===========================


// 전략 토글
function toggleStrategy(id) {
    const content = document.getElementById(`strategy-content-${id}`);
    const icon = document.getElementById(`toggle-icon-${id}`);
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(90deg)';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
        icon.textContent = '▶';
    }
}

// 전략별 댓글 HTML 생성
function generateStrategyCommentsHtml(guideId, strategyIdx, comments) {
    if (!comments || comments.length === 0) {
        return '<p style="color: #999; text-align: center; padding: 10px; font-size: 0.9em;">아직 댓글이 없습니다.</p>';
    }
    
    return comments.map(comment => {
        const canDelete = currentUser && (comment.author === currentUser.nickname || currentUser.role === 'admin');
        return `
            <div style="padding: 12px; background: white; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #98D8C8;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                    <div>
                        <strong style="color: #667eea; font-size: 0.95em;">${comment.author}</strong>
                        <span style="color: #999; font-size: 0.8em; margin-left: 8px;">
                            ${new Date(comment.date).toLocaleString('ko-KR')}
                        </span>
                    </div>
                    ${canDelete ? `
                        <button onclick="deleteStrategyComment(${guideId}, ${strategyIdx}, ${comment.id})" 
                            style="padding: 3px 8px; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8em;">
                            삭제
                        </button>
                    ` : ''}
                </div>
                <div style="color: #333; line-height: 1.5; white-space: pre-wrap; font-size: 0.9em;">${comment.text}</div>
            </div>
        `;
    }).join('');
}

function generateStrategyCommentFormHtml(guideId, strategyIdx) {
    if (!currentUser) {
        return '<p style="color: #999; text-align: center; padding: 10px; font-size: 0.85em;">댓글을 작성하려면 로그인이 필요합니다.</p>';
    }
    
    return `
        <div style="margin-top: 10px;">
            <textarea id="strategy-comment-${guideId}-${strategyIdx}" 
                placeholder="이 전략에 대한 댓글을 입력하세요..." 
                style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; resize: vertical; min-height: 60px; font-family: inherit; font-size: 0.9em;"
                onfocus="this.style.borderColor='#98D8C8'" 
                onblur="this.style.borderColor='#e0e0e0'"></textarea>
            <button onclick="addStrategyComment(${guideId}, ${strategyIdx})" 
                style="margin-top: 8px; padding: 8px 16px; background: linear-gradient(135deg, #98D8C8, #6FC3A8); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.9em;">
                💬 댓글 작성
            </button>
        </div>
    `;
}

// 전략 댓글 추가
function addStrategyComment(guideId, strategyIdx) {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }

    const commentText = document.getElementById(`strategy-comment-${guideId}-${strategyIdx}`).value.trim();
    if (!commentText) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    const guide = guides.find(g => g.id === guideId);
    if (!guide || !guide.strategies[strategyIdx]) return;

    const strategy = guide.strategies[strategyIdx];
    if (!strategy.comments) strategy.comments = [];

    strategy.comments.push({
        id: Date.now(),
        author: currentUser.nickname,
        text: commentText,
        date: new Date().toISOString()
    });

    saveData();
    renderGuides();
    
    // 토글 상태 유지
    setTimeout(() => {
        toggleStrategy(`${guideId}-${strategyIdx}`);
    }, 100);
}

// 전략 댓글 삭제
function deleteStrategyComment(guideId, strategyIdx, commentId) {
    if (!currentUser) return;

    const guide = guides.find(g => g.id === guideId);
    if (!guide || !guide.strategies[strategyIdx]) return;

    const strategy = guide.strategies[strategyIdx];
    const comment = strategy.comments.find(c => c.id === commentId);
    if (!comment) return;

    if (comment.author !== currentUser.nickname && currentUser.role !== 'admin') {
        alert('본인 댓글만 삭제할 수 있습니다.');
        return;
    }

    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    strategy.comments = strategy.comments.filter(c => c.id !== commentId);
    saveData();
    renderGuides();
    
    // 토글 상태 유지
    setTimeout(() => {
        toggleStrategy(`${guideId}-${strategyIdx}`);
    }, 100);
}

// 댓글 시스템
// ===========================

// 댓글 추가
function addComment(targetType, targetId) {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    const commentInput = document.getElementById(`${targetType}-comment-${targetId}`);
    if (!commentInput) return;
    
    const commentText = commentInput.value.trim();
    if (!commentText) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }
    
    const newComment = {
        id: Date.now(),
        author: currentUser.nickname,
        text: commentText,
        createdAt: new Date().toISOString()
    };
    
    if (targetType === 'guide') {
        const guide = guides.find(g => g.id === targetId);
        if (guide) {
            if (!guide.comments) guide.comments = [];
            guide.comments.push(newComment);
            saveData();
            renderGuides();
        }
    } else if (targetType === 'defense') {
        const team = defenseTeams.find(t => t.id === targetId);
        if (team) {
            if (!team.comments) team.comments = [];
            team.comments.push(newComment);
            saveData();
            renderDefenseTeams();
        }
    }
    
    commentInput.value = '';
}

// 댓글 삭제
function deleteComment(targetType, targetId, commentId) {
    if (!currentUser) return;
    
    if (targetType === 'guide') {
        const guide = guides.find(g => g.id === targetId);
        if (guide && guide.comments) {
            const commentIndex = guide.comments.findIndex(c => c.id === commentId);
            if (commentIndex !== -1) {
                const comment = guide.comments[commentIndex];
                if (comment.author !== currentUser.nickname && currentUser.role !== 'admin') {
                    alert('본인의 댓글만 삭제할 수 있습니다.');
                    return;
                }
                if (confirm('댓글을 삭제하시겠습니까?')) {
                    guide.comments.splice(commentIndex, 1);
                    saveData();
                    renderGuides();
                }
            }
        }
    } else if (targetType === 'defense') {
        const team = defenseTeams.find(t => t.id === targetId);
        if (team && team.comments) {
            const commentIndex = team.comments.findIndex(c => c.id === commentId);
            if (commentIndex !== -1) {
                const comment = team.comments[commentIndex];
                if (comment.author !== currentUser.nickname && currentUser.role !== 'admin') {
                    alert('본인의 댓글만 삭제할 수 있습니다.');
                    return;
                }
                if (confirm('댓글을 삭제하시겠습니까?')) {
                    team.comments.splice(commentIndex, 1);
                    saveData();
                    renderDefenseTeams();
                }
            }
        }
    }
}

// 댓글 HTML 생성
function generateCommentsHtml(targetType, targetId, comments) {
    if (!comments || comments.length === 0) {
        return '<p style="text-align: center; color: #999; padding: 20px;">아직 댓글이 없습니다.</p>';
    }
    
    return comments.map(comment => {
        const canDelete = currentUser && (comment.author === currentUser.nickname || currentUser.role === 'admin');
        const date = new Date(comment.createdAt);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        return `
            <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <strong style="color: #333;">${comment.author}</strong>
                        <span style="color: #999; font-size: 0.85em; margin-left: 8px;">${dateStr}</span>
                    </div>
                    ${canDelete ? `
                        <button onclick="deleteComment('${targetType}', ${targetId}, ${comment.id})" 
                            style="padding: 4px 8px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.85em;">
                            삭제
                        </button>
                    ` : ''}
                </div>
                <div style="color: #555; line-height: 1.5;">${comment.text}</div>
            </div>
        `;
    }).join('');
}

// 댓글 입력 폼 HTML 생성
function generateCommentFormHtml(targetType, targetId) {
    if (!currentUser) {
        return '<p style="text-align: center; color: #999; padding: 20px;">댓글을 작성하려면 로그인이 필요합니다.</p>';
    }
    
    return `
        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <input type="text" id="${targetType}-comment-${targetId}" 
                placeholder="댓글을 입력하세요..." 
                style="flex: 1; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95em;"
                onkeypress="if(event.key === 'Enter') addComment('${targetType}', ${targetId})">
            <button onclick="addComment('${targetType}', ${targetId})" 
                style="padding: 10px 20px; background: linear-gradient(135deg, #98D8C8, #6FC3A8); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; white-space: nowrap;">
                작성
            </button>
        </div>
    `;
}

