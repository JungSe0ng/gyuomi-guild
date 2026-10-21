// ──────────────────────────────────────────
// 길드전·방어·공성전 공략 공통 화면 조각
// guildwar.html, defense.html, siege.html, expedition.html 이 import 해서 쓴다
// (리플레이 팀 줄, 진형 판·편집기, 장비 2x2 카드·상세 카드, 성공률 등급 배지, 우선순위 별,
//  공성전·원정대의 스킬 순서와 영웅 세팅)
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

// 진형 정보가 없는 예전 공략은 기본 진형 앞 번호 자리로 본다 (3명이면 1·2·3번, 5명이면 1~5번)
function defaultFormation(size) {
    return { type: 'basic', positions: Array.from({ length: size }, (_, i) => i + 1) };
}

// 팀 인원 → 진형 자리 수. 길드전·방어는 3명, 공성전은 5명 (팀 배열이 3칸보다 짧은 예전 공략도 3)
function teamSize(heroes) {
    return heroes.length > 3 ? heroes.length : 3;
}

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

// 장비 옵션 이름 → 어두운 칸 안의 스탯 아이콘. 아이콘이 없는 옵션이면 빈 문자열
export function statIcon(option, sizeClass = '') {
    const key = STAT_ICON[option.replace('(%)', '').trim()];
    if (!key) return '';
    return `<span class="opt-icon ${sizeClass}"><img src="${UI_PATH}ICO_Stat_${key}.png" alt=""></span>`;
}

// 저장된 진형({type, positions})을 읽는다. 없거나 형식이 맞지 않으면 기본 진형 1~size번 자리
// positions[i] 는 팀의 i번째 영웅이 서는 자리 번호(1~5). size 는 팀 인원 (길드전·방어 3, 공성전 5)
export function readFormation(formation, size = 3) {
    const isValid = formation && FORMATIONS[formation.type]
        && Array.isArray(formation.positions) && formation.positions.length === size;
    const source = isValid ? formation : defaultFormation(size);
    return { type: source.type, positions: source.positions.map(Number) };
}

// pos 자리에 영웅을 놓는다. 그 자리를 가진 번호가 있으면 그 번호의 영웅을 바꾸고, 없으면 빈 번호에 자리와 함께 넣는다
// 돌려주는 idx 는 영웅이 들어간 번호(0~팀 인원-1). 팀이 다 차서 놓을 수 없으면 -1
export function placeHero(formation, heroes, pos, name) {
    const placed = readFormation(formation, teamSize(heroes));
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
// 영웅 번호(idx)는 그대로라서 그 번호에 붙은 장비 입력이 유지된다. size 는 팀 인원 (공성전은 5)
export function moveHero(formation, idx, pos, size = 3) {
    const moved = readFormation(formation, size);
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
    const { type, positions } = readFormation(formation, teamSize(heroes));
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
    const { type } = readFormation(formation, teamSize(heroes));
    const typeButtons = Object.entries(FORMATIONS).map(([key, info]) =>
        `<button type="button" class="formation-type${key === type ? ' active' : ''}" onclick="setFormationType('${team}','${key}')">${info.name}</button>`
    ).join('');
    const placedCount = heroes.filter(Boolean).length;
    const selectedName = selectedIdx !== -1 ? heroes[selectedIdx] : null;
    const guide = selectedName
        ? `<b>${selectedName}</b> 선택됨 · 옮길 칸을 누르세요 (영웅이 있으면 자리 교체)`
        : `빈 칸(+) 배치 · 영웅을 누르면 자리 이동 · ${placedCount}/${teamSize(heroes)}명`;

    return `
    <div class="formation-editor-hd">진형 <span${selectedName ? ' class="moving-guide"' : ''}>${guide}</span></div>
    <div class="formation-types">${typeButtons}</div>
    <div class="formation-preview">${renderFormationBoard(formation, heroes, team, selectedIdx)}</div>`;
}

// 리플레이 모양 팀 한 줄. side: 'ally'(파랑) | 'enemy'(빨강), pets 는 없으면 빈 배열
// formation 이 없으면 기본 진형 1·2·3번 자리로 그린다
export function renderReplayRow(side, label, heroes, pets, formation) {
    const { type } = readFormation(formation, teamSize(heroes));
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

// 세트 칸: 세트 아이콘 + 이름. 세트가 없으면 emptyLabel
function renderEquipSet(set, emptyLabel) {
    if (isBlank(set)) return `<div class="equip-set empty">${emptyLabel}</div>`;
    const setNo = SET_ICON[set];
    return `<div class="equip-set">${setNo ? `<img src="${UI_PATH}ICO_Set_${String(setNo).padStart(2, '0')}.png" alt="">` : ''}${set}</div>`;
}

// 무기 | 방어구 2x2: 무기1·방어구1 / 무기2·방어구2
function renderEquipSlots(equip) {
    return `
            <div class="equip-slots">
                <div class="equip-col-label">무기</div>
                <div class="equip-col-label">방어구</div>
                ${renderEquipSlot(equip.wpn1)}${renderEquipSlot(equip.arm1)}
                ${renderEquipSlot(equip.wpn2)}${renderEquipSlot(equip.arm2)}
            </div>`;
}

// 영웅별 장비 카드: 세트 / 무기1·방어구1 / 무기2·방어구2 + 속공·부옵·메모
export function renderEquipCards(team, equipData) {
    return team.map((name, i) => {
        if (!name) return '';
        const equip = equipData[i] || {};

        return `
        <div class="equip-card">
            <div class="equip-hd">
                <img src="${HERO_IMG_PATH}${name}.webp" alt="" onerror="this.style.display='none'">
                <b>${name}</b>
                ${equip.speed ? `<span class="equip-speed">${statIcon('속공', 'sm')}속공 ${equip.speed}</span>` : ''}
            </div>
            ${renderEquipSet(equip.set, '세트 미지정')}
            ${renderEquipSlots(equip)}
            ${equip.sub || equip.memo ? `
            <div class="equip-foot">
                ${equip.sub ? `<div class="equip-sub">✨ 부옵 · ${equip.sub}</div>` : ''}
                ${equip.memo ? `<div class="equip-memo">${equip.memo}</div>` : ''}
            </div>` : ''}
        </div>`;
    }).join('');
}

// 영웅 한 명 장비 상세 카드 (공성전 영웅 세팅): 등급 테두리 초상화 · 이름 · 태그 · 세트 / 무기·방어구 2x2 / 메모
// tags 는 이름 아래에 붙일 HTML (자리 배지 등). 속공·속공 순위는 equip 에서 읽어 태그 뒤에 붙인다
export function renderEquipDetail(name, equip, tags = '') {
    const frame = GRADE_FRAME[gradeByHero[name]];
    const speed = equip.speed
        ? `<span class="equip-speed">${statIcon('속공', 'sm')}속공 ${equip.speed}${equip.speedRank ? `<em>${equip.speedRank}순위</em>` : ''}</span>`
        : '';

    return `
    <div class="equip-card equip-detail">
        <div class="equip-detail-hd">
            <div class="replay-hero-img"${frame ? ` style="--grade:${frame}"` : ''}>
                <img src="${HERO_IMG_PATH}${name}.webp" alt="${name}"
                     onerror="this.parentElement.innerHTML='<div class=\\'replay-hero-fallback\\'>${name}</div>'">
            </div>
            <div class="equip-detail-who">
                <b>${name}</b>
                <div class="equip-detail-tags">${tags}${speed}</div>
            </div>
            ${renderEquipSet(equip.set, '세트 무관')}
        </div>
        ${renderEquipSlots(equip)}
        ${equip.memo ? `<div class="equip-foot"><div class="equip-memo">${equip.memo}</div></div>` : ''}
    </div>`;
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

// ──────────────────────────────────────────
// 스킬 순서 (공성전 · 강림 원정대 공통)
// order 는 스킬 {round, hero, num} 과 메모 {round, at, note} 가 라운드 순서대로 섞인 목록
// 턴: 라운드 첫 스킬은 턴이 늘지 않고, 같은 라운드의 다음 스킬부터 TURN_STEP 씩 는다. 턴은 라운드를 넘어 이어진다
// 전투는 TURN_LIMIT 턴까지. 메모는 턴 계산에 들어가지 않는다. 턴은 저장하지 않고 순서로 계산한다
// 등록 화면에서 칩을 누르면 페이지의 selectChip(idx) · removeChip(idx), 라운드 줄을 누르면 setRound(round)
// ──────────────────────────────────────────
export const TURN_STEP = 4;
export const TURN_LIMIT = 70;

// 스킬 번호 → 인게임 스킬 칸 위치 (초상화 옆 세로: 각성기 / 위 = 스킬2 / 아래 = 스킬1)
export const SKILL_WORD = { 1: '아래', 2: '위', 3: '각성' };
const SKILL_LABEL = { 1: '▼ 아래', 2: '▲ 위', 3: '★ 각성' };

export function isSkillNote(entry) {
    return entry.note !== undefined;
}

// order → 라운드별 [{round, startTurn, entries:[{..., idx, turn, isRoundStart}]}]. idx 는 order 안의 번호
export function buildSkillRounds(order, rounds) {
    let turn = 0;
    return rounds.map(round => {
        const startTurn = turn;
        let skillCount = 0;
        const entries = order
            .map((entry, idx) => ({ ...entry, idx }))
            .filter(entry => entry.round === round)
            .map(entry => {
                if (isSkillNote(entry)) return entry;
                if (skillCount > 0) turn += TURN_STEP;
                skillCount += 1;
                return { ...entry, turn, isRoundStart: skillCount === 1 };
            });
        return { round, startTurn, entries };
    });
}

// 마지막 스킬의 턴 (턴은 순서대로 늘기만 하므로 마지막 스킬이 가장 크다)
export function lastSkillTurn(order, rounds) {
    const skills = buildSkillRounds(order, rounds).flatMap(lane => lane.entries).filter(entry => !isSkillNote(entry));
    return skills.length ? skills[skills.length - 1].turn : 0;
}

// 스킬 칩: 턴 배지 + 스킬 아이콘(영웅 얼굴) + 이름 + 위/아래. 이미지가 없는 영웅은 아이콘 자리에 이름 두 글자
function renderSkillChip(skill, isEditable, selectedIdx) {
    const cls = ['skill-chip'];
    if (skill.isRoundStart) cls.push('round-start');
    if (isEditable) cls.push('editable');
    if (isEditable && skill.idx === selectedIdx) cls.push('selected');
    const title = `${skill.round}라 · ${skill.turn}턴 · ${skill.hero} ${SKILL_WORD[skill.num]}${skill.isRoundStart ? ' (라운드 첫 스킬 · 턴 추가 없음)' : ''}`;
    return `
    <div class="${cls.join(' ')}" title="${title}"${isEditable ? ` onclick="event.stopPropagation();selectChip(${skill.idx})"` : ''}>
        <span class="skill-chip-turn">${skill.turn}턴</span>
        <div class="skill-chip-icon" data-name="${skill.hero.slice(0, 2)}">
            <img class="skill-img" src="${HERO_IMG_PATH}${skill.hero}${skill.num}.webp" alt="${skill.hero} ${SKILL_WORD[skill.num]}" onerror="this.style.visibility='hidden'">
            <img class="face" src="${HERO_IMG_PATH}${skill.hero}.webp" alt="" onerror="this.style.display='none'">
        </div>
        <span class="skill-chip-who">${skill.hero}</span>
        <span class="skill-chip-which">${SKILL_LABEL[skill.num]}</span>
        ${isEditable ? `<button type="button" class="skill-chip-remove" title="빼기" onclick="event.stopPropagation();removeChip(${skill.idx})">×</button>` : ''}
    </div>`;
}

// 스킬 사이 메모 칩 (예: 38턴 아일린이 파괴신 빔 맞고 죽어야 함)
function renderNoteChip(note, isEditable, selectedIdx) {
    return `
    <div class="note-chip${isEditable ? ' editable' : ''}${isEditable && note.idx === selectedIdx ? ' selected' : ''}"${isEditable ? ` onclick="event.stopPropagation();selectChip(${note.idx})"` : ''}>
        ${note.at ? `<b>⚠️ ${note.at}</b>` : ''}
        <span>${note.note}</span>
        ${isEditable ? `<button type="button" class="skill-chip-remove" title="빼기" onclick="event.stopPropagation();removeChip(${note.idx})">×</button>` : ''}
    </div>`;
}

// 등록 화면에서 다음 스킬이 들어갈 자리. 70턴을 넘어서 더 넣을 수 없으면 회색
export function renderGhostChip(canAdd) {
    return canAdd
        ? '<div class="skill-chip-ghost" title="다음 스킬이 들어갈 자리">＋</div>'
        : `<div class="skill-chip-ghost full" title="${TURN_LIMIT}턴을 넘어서 더 넣을 수 없어요">${TURN_LIMIT}턴<br>끝</div>`;
}

// 라운드마다 한 줄
// edit 이 없으면 공략 카드용: 스킬이 있는 라운드만 그린다
// edit = {currentRound, selectedIdx, ghost} 면 등록 화면용: 모든 라운드 + 고른 라운드 강조 + 다음 스킬이 들어갈 자리(ghost)
// roundSub(round) 를 주면 라운드 태그에 한 줄을 더 붙인다 (원정대 '1팀')
export function renderSkillLanes(order, rounds, { edit = null, roundSub = null } = {}) {
    const isEditable = Boolean(edit);
    const selectedIdx = isEditable ? edit.selectedIdx : -1;
    const lanes = buildSkillRounds(order, rounds)
        .filter(lane => isEditable || lane.entries.length)
        .map(({ round, startTurn, entries }) => {
            const isCurrent = isEditable && round === edit.currentRound;
            let chips = entries.map(entry =>
                (isSkillNote(entry) ? renderNoteChip(entry, isEditable, selectedIdx) : renderSkillChip(entry, isEditable, selectedIdx))
                + (isEditable && entry.idx === selectedIdx ? edit.ghost : '')
            ).join('');
            if (isCurrent && selectedIdx === -1) chips += edit.ghost;
            if (!chips) chips = '<span class="round-empty">—</span>';
            return `
            <div class="round-lane${isCurrent ? ' current' : ''}"${isEditable ? ` onclick="setRound(${round})"` : ''}>
                <div class="round-tag"><b>${round}라</b>${roundSub ? `<span class="round-sub">${roundSub(round)}</span>` : ''}<span>${startTurn}턴~</span></div>
                <div class="round-chips">${chips}</div>
            </div>`;
        }).join('');
    return `<div class="skill-timeline${isEditable ? ' editable' : ''}">${lanes}</div>`;
}

// 텍스트로 보기: 복사되는 글과 같은 내용을 라운드별 줄로
export function renderSkillText(order, rounds, { roundSub = null } = {}) {
    const lines = buildSkillRounds(order, rounds)
        .filter(lane => lane.entries.length)
        .map(lane => `
        <div class="skill-text-line">
            <b class="skill-text-round">${lane.round}라${roundSub ? ` · ${roundSub(lane.round)}` : ''}</b>
            <span>${lane.entries.map(entry => isSkillNote(entry)
                ? `<span class="skill-text-note">⚠️ ${entry.at ? `[${entry.at}] ` : ''}${entry.note}</span>`
                : `<span class="skill-text-item">${entry.hero} ${SKILL_WORD[entry.num]}<em>(${entry.turn}턴)</em></span>`
            ).join('<span class="skill-text-sep">-</span>')}</span>
        </div>`)
        .join('');
    return `<div class="skill-text-view">${lines}</div>`;
}

// 턴 배지 설명 + 마지막 스킬 턴. hasBadges 가 false 면(텍스트로 보기) 마지막 턴만
export function renderTurnLegend(order, rounds, hasBadges = true) {
    return `
    <div class="turn-legend">
        ${hasBadges ? `
        <span><i class="start">0턴</i>라운드 첫 스킬 — 턴이 늘지 않아요</span>
        <span><i class="next">+4턴</i>같은 라운드의 다음 스킬부터 4턴씩</span>` : ''}
        <span class="turn-total">마지막 <b>${lastSkillTurn(order, rounds)}턴</b> / 최대 ${TURN_LIMIT}턴</span>
    </div>`;
}

// 카톡 공유용 텍스트: [1라] 레이첼 아래(0턴) - ... / 메모는 ⚠️[38턴] 내용
export function skillOrderText(order, rounds) {
    return buildSkillRounds(order, rounds)
        .filter(lane => lane.entries.length)
        .map(lane => `[${lane.round}라] ` + lane.entries.map(entry => isSkillNote(entry)
            ? `⚠️${entry.at ? `[${entry.at}] ` : ''}${entry.note}`
            : `${entry.hero} ${SKILL_WORD[entry.num]}(${entry.turn}턴)`
        ).join(' - '))
        .join('\n');
}

// ──────────────────────────────────────────
// 영웅 세팅 (공성전 · 강림 원정대 공통): 왼쪽 속공 순서 목록(누르면 선택) + 오른쪽 고른 영웅 장비 상세
// ──────────────────────────────────────────
// idx번째 영웅이 전열('front')인지 후열('back')인지. size 는 팀 인원
export function laneOf(formation, idx, size) {
    const { type, positions } = readFormation(formation, size);
    return FORMATIONS[type].front.includes(positions[idx]) ? 'front' : 'back';
}

// 전열/후열 배지. withPos 면 자리 번호까지
export function renderLaneChip(formation, idx, size, withPos = false) {
    const lane = laneOf(formation, idx, size);
    const pos = readFormation(formation, size).positions[idx];
    return `<span class="lane-chip ${lane}">${lane === 'front' ? '전열' : '후열'}${withPos ? ` · ${pos}번` : ''}</span>`;
}

// 속공 순위 배지 글자: 숫자가 있으면 'N순위', '상관X' 같은 글자는 그대로
function rankLabel(rank) {
    if (!rank) return '—';
    return /\d/.test(rank) ? `${rank}<span class="rank-unit">순위</span>` : rank;
}

// 속공 순위 → 같은 순위면 속공 높은 순. 순위가 없으면 맨 뒤
function heroSettingOrder(heroes, equipData) {
    return heroes
        .map((name, idx) => ({ idx, name, speed: equipData[idx]?.speed || '', rank: equipData[idx]?.speedRank || '' }))
        .filter(item => item.name)
        .sort((a, b) => (parseInt(a.rank) || 99) - (parseInt(b.rank) || 99) || (parseInt(b.speed) || 0) - (parseInt(a.speed) || 0));
}

// pickedIdx 가 팀에 없으면 속공 순서 맨 위 영웅을 보여준다
// pickCall(idx) 는 영웅을 눌렀을 때 실행할 코드 문자열 (예: idx => `pickHero('공략id',${idx})`)
export function renderHeroSetting(heroes, formation, equipData, pickedIdx, pickCall) {
    const size = teamSize(heroes);
    const order = heroSettingOrder(heroes, equipData);
    const shownIdx = order.some(item => item.idx === pickedIdx) ? pickedIdx : order[0].idx;
    const picks = order.map((item, i) => {
        const isNewRank = i > 0 && order[i - 1].rank !== item.rank;
        return `
        <button type="button" class="hero-pick${item.idx === shownIdx ? ' active' : ''}${isNewRank ? ' new-rank' : ''}" onclick="${pickCall(item.idx)}" title="${item.name} 장비 보기">
            <span class="speed-rank">${rankLabel(item.rank)}</span>
            <span class="hero-pick-face" data-name="${item.name.slice(0, 2)}"><img src="${HERO_IMG_PATH}${item.name}.webp" alt="${item.name}" onerror="this.style.visibility='hidden'"></span>
            <span class="hero-pick-name">${item.name}</span>
            ${renderLaneChip(formation, item.idx, size)}
            <span class="hero-pick-speed">${item.speed ? `${statIcon('속공', 'sm')}${item.speed}` : ''}</span>
        </button>`;
    }).join('');

    return `
    <div class="hero-setting">
        <div class="hero-pick-list">${picks}</div>
        ${renderEquipDetail(heroes[shownIdx], equipData[shownIdx] || {}, renderLaneChip(formation, shownIdx, size, true))}
    </div>`;
}
