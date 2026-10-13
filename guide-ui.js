// ──────────────────────────────────────────
// 길드전·방어 공략 공통 화면 조각
// guildwar.html, defense.html 이 import 해서 쓴다
// (리플레이 팀 줄, 진형 판·편집기, 장비 2x2 카드, 성공률 등급 배지, 우선순위 별)
// ──────────────────────────────────────────

const HERO_IMG_PATH = './heroes/';
const PET_IMG_PATH  = './pets/';
const UI_PATH       = './ui/';

// 장비 옵션 이름 → 스탯 아이콘 (인게임 장비 화면의 스탯 목록과 대조해서 확인)
// '(%)'가 붙은 옵션은 같은 아이콘을 쓴다
const STAT_ICON = {
    '모든 공격력':    'Attack',
    '방어력':         'Defense',
    '생명력':         'Health',
    '속공':           'Speed',
    '치명타 확률':    'CritRate',
    '치명타 피해':    'CritDamage',
    '약점 공격 확률': 'WeakHit',
    '효과 적중':      'EffectHit',
    '효과 저항':      'EffectResist',
    '막기 확률':      'Block',
    '받는 피해 감소': 'DamageReduce',
};

// 세트 → 세트 아이콘 번호 (ui/ICO_Set_NN.png)
// 복수자는 인게임 화면으로 확인. 선봉장·추적자·성기사는 세트 효과 스탯과 아이콘 모양이 같아 확신도가 높다
// NOTE: 수호자·암살자·수문장·주술사·조율자는 추정값이다. 인게임 세트 목록으로 확인되면 번호만 고친다
const SET_ICON = {
    '선봉장': 1,
    '추적자': 2,
    '수호자': 3,
    '성기사': 4,
    '암살자': 5,
    '수문장': 7,
    '주술사': 8,
    '조율자': 9,
    '복수자': 10,
};

// 영웅 등급 → 초상화 테두리 색 (theme.css 변수)
const GRADE_FRAME = {
    '구세나': 'var(--grade-gusena)',
    '찐스':   'var(--grade-jjin)',
    '짭스':   'var(--grade-jjab)',
    '희귀':   'var(--grade-rare)',
};

// 성공률(%) → 공성 등급 배지. 위에서부터 처음 만족하는 구간을 쓴다
const SUCCESS_GRADES = [[95, 'SSS'], [90, 'SS'], [80, 'S'], [70, 'A'], [60, 'B'], [50, 'C'], [40, 'D'], [0, 'F']];

// 진형 4종: 자리 번호(1~5)별 전방(F)/후방(B) (인게임 진형 화면 기준)
export const FORMATIONS = {
    basic:   { name: '기본 진형',   front: [1, 2],       back: [3, 4, 5] },
    balance: { name: '밸런스 진형', front: [1, 2, 3],    back: [4, 5] },
    attack:  { name: '공격 진형',   front: [1],          back: [2, 3, 4, 5] },
    protect: { name: '보호 진형',   front: [1, 2, 3, 4], back: [5] },
};

// 진형 정보가 없는 예전 공략은 기본 진형 1·2·3번 자리로 본다
const DEFAULT_FORMATION = { type: 'basic', positions: [1, 2, 3] };

let gradeByHero = {};

// 페이지의 HERO_DATA({등급: [영웅...]})로 영웅 이름 → 등급 표를 만든다. 페이지 시작 때 한 번 부른다
export function setHeroGrades(heroData) {
    gradeByHero = {};
    Object.entries(heroData).forEach(([grade, heroes]) => {
        heroes.forEach(name => { gradeByHero[name] = grade; });
    });
}

function isBlank(value) {
    return !value || value === '모두';
}

function statIcon(option, sizeClass = '') {
    const key = STAT_ICON[option.replace('(%)', '').trim()];
    if (!key) return '';
    return `<span class="opt-icon ${sizeClass}"><img src="${UI_PATH}ICO_Stat_${key}.png" alt=""></span>`;
}

// 저장된 진형({type, positions})을 읽는다. 없거나 형식이 맞지 않으면 기본 진형 1·2·3번 자리
// positions[i] 는 팀의 i번째 영웅이 서는 자리 번호(1~5)
export function readFormation(formation) {
    const isValid = formation && FORMATIONS[formation.type]
        && Array.isArray(formation.positions) && formation.positions.length === 3;
    const source = isValid ? formation : DEFAULT_FORMATION;
    return { type: source.type, positions: source.positions.map(Number) };
}

// pos 자리에 영웅을 놓는다. 그 자리를 가진 번호가 있으면 그 번호의 영웅을 바꾸고, 없으면 빈 번호에 자리와 함께 넣는다
// 돌려주는 idx 는 영웅이 들어간 번호(0~2). 팀이 다 차서 놓을 수 없으면 -1
export function placeHero(formation, heroes, pos, name) {
    const placed = readFormation(formation);
    const nextHeroes = [...heroes];
    let idx = placed.positions.indexOf(pos);
    if (idx === -1) {
        idx = nextHeroes.findIndex(hero => !hero);
        if (idx === -1) return { formation: placed, heroes: nextHeroes, idx: -1 };
        placed.positions[idx] = pos;
    }
    nextHeroes[idx] = name;
    return { formation: placed, heroes: nextHeroes, idx };
}

// idx번째 영웅을 뺀다. 자리 번호는 남겨 두고 그 칸은 빈칸이 된다
export function removeHero(heroes, idx) {
    return heroes.map((hero, i) => (i === idx ? null : hero));
}

// idx번째 영웅을 pos 자리로 옮긴다. 다른 번호가 그 자리를 쓰고 있으면 두 번호의 자리를 맞바꾼다
// 영웅 번호(idx)는 그대로라서 그 번호에 붙은 장비 입력이 유지된다
export function moveHero(formation, idx, pos) {
    const moved = readFormation(formation);
    const otherIdx = moved.positions.indexOf(pos);
    if (otherIdx !== -1 && otherIdx !== idx) moved.positions[otherIdx] = moved.positions[idx];
    moved.positions[idx] = pos;
    return moved;
}

// 진형 판: 위 후방(B, 빨강) / 아래 전방(F, 파랑). 그 진형의 자리를 번호 순으로 그리고 영웅이 없는 자리는 빈칸
// 칸이 적은 줄을 (많은 줄 칸 수 - 적은 줄 칸 수) / 2 칸만큼 밀어서 인게임처럼 앞뒷줄이 엇갈리게 한다
// team 을 넘기면 편집 모드: 칸을 누르면 페이지의 clickFormationSlot(team, pos)
// (영웅 선택 → 옮길 칸 누르기로 이동·교체, 빈 칸은 영웅 배치), × 는 removeSlotHero(team, idx), [변경] 은 openSlotModal(team, pos)
// selectedIdx 는 옮기려고 고른 영웅 번호. 없으면 -1
export function renderFormationBoard(formation, heroes, team = '', selectedIdx = -1) {
    const { type, positions } = readFormation(formation);
    const layout = FORMATIONS[type];
    const isEditable = Boolean(team);
    const isMoving = isEditable && selectedIdx !== -1 && Boolean(heroes[selectedIdx]);
    const isFull = heroes.every(Boolean);
    const longest = Math.max(layout.front.length, layout.back.length);
    const slotClick = pos => (isEditable ? ` onclick="clickFormationSlot('${team}',${pos})"` : '');

    const renderSlot = pos => {
        const idx = positions.indexOf(pos);
        const name = idx === -1 ? null : heroes[idx];
        if (!name) {
            const canClick = isEditable && (isMoving || !isFull);
            const label = isMoving ? '이동' : (canClick ? '+' : '');
            const title = isMoving ? `${pos}번 자리로 이동` : `${pos}번 자리에 영웅 배치`;
            return `
            <div class="formation-slot empty${isEditable && !canClick ? ' disabled' : ''}"${canClick ? `${slotClick(pos)} title="${title}"` : ''}>
                <div class="formation-empty">${label}</div>
                <span class="formation-no">${pos}</span>
            </div>`;
        }
        const frame = GRADE_FRAME[gradeByHero[name]];
        const isSelected = isMoving && idx === selectedIdx;
        const title = !isEditable ? `${pos}번 · ${name}`
            : isSelected ? '다시 누르면 선택 해제'
            : isMoving ? `${heroes[selectedIdx]}와 자리 교체`
            : `${name} 선택 (옮길 칸을 누르면 이동)`;
        return `
        <div class="formation-slot${isSelected ? ' selected' : ''}${isMoving && !isSelected ? ' swap-target' : ''}"${slotClick(pos)} title="${title}">
            <div class="replay-hero-img"${frame ? ` style="--grade:${frame}"` : ''}>
                <img src="${HERO_IMG_PATH}${name}.webp" alt="${name}"
                     onerror="this.parentElement.innerHTML='<div class=\\'replay-hero-fallback\\'>${name}</div>'">
            </div>
            <span class="formation-no">${pos}</span>
            ${isEditable ? `<button type="button" class="formation-remove" title="이 자리에서 빼기" onclick="event.stopPropagation();removeSlotHero('${team}',${idx})">×</button>` : ''}
            ${isSelected ? `<button type="button" class="formation-change" title="다른 영웅으로 바꾸기" onclick="event.stopPropagation();openSlotModal('${team}',${pos})">변경</button>` : ''}
            <span class="replay-hero-name">${name}</span>
        </div>`;
    };
    const renderLane = (lane, tag, lanePositions) => `
        <div class="formation-lane ${lane}" style="--lane-offset:${(longest - lanePositions.length) / 2}">
            <span class="lane-tag">${tag}</span>${lanePositions.map(renderSlot).join('')}
        </div>`;

    return `
    <div class="formation-board${isEditable ? ' editable' : ''}${isMoving ? ' moving' : ''}">
        ${renderLane('back', 'B', layout.back)}
        ${renderLane('front', 'F', layout.front)}
    </div>`;
}

// 등록 화면 진형 편집기: 진형 버튼 4개 + 칸을 눌러 영웅을 놓고 옮기는 진형 판
// 진형 버튼은 페이지의 setFormationType(team, type)를 부른다
export function renderFormationEditor(team, formation, heroes, selectedIdx = -1) {
    const { type } = readFormation(formation);
    const typeButtons = Object.entries(FORMATIONS).map(([key, info]) =>
        `<button type="button" class="formation-type${key === type ? ' active' : ''}" onclick="setFormationType('${team}','${key}')">${info.name}</button>`
    ).join('');
    const placedCount = heroes.filter(Boolean).length;
    const selectedName = selectedIdx !== -1 ? heroes[selectedIdx] : null;
    const guide = selectedName
        ? `<b>${selectedName}</b> 선택됨 · 옮길 칸을 누르세요 (영웅이 있으면 자리 교체)`
        : `빈 칸(+) 배치 · 영웅을 누르면 자리 이동 · ${placedCount}/3명`;

    return `
    <div class="formation-editor-hd">진형 <span${selectedName ? ' class="moving-guide"' : ''}>${guide}</span></div>
    <div class="formation-types">${typeButtons}</div>
    <div class="formation-preview">${renderFormationBoard(formation, heroes, team, selectedIdx)}</div>`;
}

// 리플레이 모양 팀 한 줄. side: 'ally'(파랑) | 'enemy'(빨강), pets 는 없으면 빈 배열
// formation 이 없으면 기본 진형 1·2·3번 자리로 그린다
export function renderReplayRow(side, label, heroes, pets, formation) {
    const { type } = readFormation(formation);
    const petsHtml = pets.filter(Boolean).map(pet =>
        `<img src="${PET_IMG_PATH}${pet}.png" alt="${pet}" title="${pet}" onerror="this.style.display='none'">`
    ).join('<span class="pet-arrow">›</span>');

    return `
    <div class="replay-row ${side}">
        <div class="replay-side">
            <span class="replay-label">${label}</span>
            <span class="replay-formation">${FORMATIONS[type].name}</span>
        </div>
        ${renderFormationBoard(formation, heroes)}
        ${petsHtml ? `<div class="replay-pets">${petsHtml}</div>` : ''}
    </div>`;
}

// 두 팀 줄 사이의 금색 VS
export function renderReplayVs() {
    return `<div class="replay-vs"><img src="${UI_PATH}UI_VS_Gold.png" alt="VS"></div>`;
}

function renderEquipSlot(option) {
    if (isBlank(option)) return '<div class="equip-slot empty">—</div>';
    return `<div class="equip-slot">${statIcon(option)}<span>${option}</span></div>`;
}

// 영웅별 장비 카드: 세트 / 무기1·방어구1 / 무기2·방어구2 + 속공·부옵·메모
export function renderEquipCards(team, equipData) {
    return team.map((name, i) => {
        if (!name) return '';
        const equip = equipData[i] || {};
        const setNo = SET_ICON[equip.set];
        const setHtml = isBlank(equip.set)
            ? '<div class="equip-set empty">세트 미지정</div>'
            : `<div class="equip-set">${setNo ? `<img src="${UI_PATH}ICO_Set_${String(setNo).padStart(2, '0')}.png" alt="">` : ''}${equip.set}</div>`;

        return `
        <div class="equip-card">
            <div class="equip-hd">
                <img src="${HERO_IMG_PATH}${name}.webp" alt="" onerror="this.style.display='none'">
                <b>${name}</b>
                ${equip.speed ? `<span class="equip-speed">${statIcon('속공', 'sm')}속공 ${equip.speed}</span>` : ''}
            </div>
            ${setHtml}
            <div class="equip-slots">
                <div class="equip-col-label">무기</div>
                <div class="equip-col-label">방어구</div>
                ${renderEquipSlot(equip.wpn1)}${renderEquipSlot(equip.arm1)}
                ${renderEquipSlot(equip.wpn2)}${renderEquipSlot(equip.arm2)}
            </div>
            ${equip.sub || equip.memo ? `
            <div class="equip-foot">
                ${equip.sub ? `<div class="equip-sub">✨ 부옵 · ${equip.sub}</div>` : ''}
                ${equip.memo ? `<div class="equip-memo">${equip.memo}</div>` : ''}
            </div>` : ''}
        </div>`;
    }).join('');
}

// 성공률(%)을 공성 등급 배지로. 0 이면 표시하지 않는다
export function renderSuccessBadge(rate) {
    if (!rate) return '';
    const grade = SUCCESS_GRADES.find(([min]) => rate >= min)[1];
    return `<span class="grade-badge" title="성공률 ${rate}% (${grade})"><img src="${UI_PATH}ICO_Grade_${grade}.png" alt="${grade}">${rate}%</span>`;
}

// 방어 우선순위(0~5)를 인게임 별 아이콘으로. 0 이면 표시하지 않는다
export function renderPriorityStars(count) {
    if (!count) return '';
    const stars = [1, 2, 3, 4, 5].map(n => `<img src="${UI_PATH}ICO_Star_${n <= count ? 'On' : 'Off'}.png" alt="">`).join('');
    return `<span class="priority-stars" title="우선순위 ${count}">${stars}</span>`;
}
