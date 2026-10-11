// ──────────────────────────────────────────
// 길드전·방어 공략 공통 화면 조각
// guildwar.html, defense.html 이 import 해서 쓴다
// (리플레이 팀 줄, 장비 2x2 카드, 성공률 등급 배지, 우선순위 별)
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

// 리플레이 모양 팀 한 줄. side: 'ally'(파랑) | 'enemy'(빨강), pets 는 없으면 빈 배열
export function renderReplayRow(side, label, heroes, pets) {
    const heroesHtml = heroes.filter(Boolean).map(name => {
        const frame = GRADE_FRAME[gradeByHero[name]];
        return `
        <div class="replay-hero">
            <div class="replay-hero-img"${frame ? ` style="--grade:${frame}"` : ''}>
                <img src="${HERO_IMG_PATH}${name}.webp" alt="${name}"
                     onerror="this.parentElement.innerHTML='<div class=\\'replay-hero-fallback\\'>${name}</div>'">
            </div>
            <span class="replay-hero-name">${name}</span>
        </div>`;
    }).join('');
    const petsHtml = pets.filter(Boolean).map(pet =>
        `<img src="${PET_IMG_PATH}${pet}.png" alt="${pet}" title="${pet}" onerror="this.style.display='none'">`
    ).join('<span class="pet-arrow">›</span>');

    return `
    <div class="replay-row ${side}">
        <span class="replay-label">${label}</span>
        <div class="replay-heroes">${heroesHtml}</div>
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
