// ===========================
// 인증 시스템 (auth.js)
// ===========================

let currentUser = null;

// 사용자 데이터 관리
function getUsers() {
    try {
        const usersData = localStorage.getItem('users');
        if (!usersData) return [];
        const parsed = JSON.parse(usersData);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Error parsing users:', e);
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// 로그인/회원가입 탭 전환
function switchAuthTab(tab) {
    const loginTabBtn = document.getElementById('loginTabBtn');
    const signupTabBtn = document.getElementById('signupTabBtn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (tab === 'login') {
        loginTabBtn.style.background = 'linear-gradient(135deg, #B08AB0, #8B5A86)';
        loginTabBtn.style.color = 'white';
        signupTabBtn.style.background = 'transparent';
        signupTabBtn.style.color = '#666';
        
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        signupTabBtn.style.background = 'linear-gradient(135deg, #98D8C8, #6FC3A8)';
        signupTabBtn.style.color = 'white';
        loginTabBtn.style.background = 'transparent';
        loginTabBtn.style.color = '#666';
        
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

// 로그인 처리
function handleLogin() {
    const nickname = document.getElementById('loginNickname').value.trim();
    const password = document.getElementById('loginPassword').value;
    const autoLoginCheckbox = document.getElementById('autoLogin');
    const autoLogin = autoLoginCheckbox ? autoLoginCheckbox.checked : false;

    if (!nickname || !password) {
        alert('닉네임과 비밀번호를 입력해주세요.');
        return;
    }

    const users = getUsers();
    if (!Array.isArray(users)) {
        alert('사용자 데이터 오류가 발생했습니다.');
        return;
    }
    const user = users.find(u => u.nickname === nickname && u.password === password);

    if (!user) {
        alert('닉네임 또는 비밀번호가 일치하지 않습니다.');
        return;
    }

    // 로그인 성공
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    if (autoLogin) {
        localStorage.setItem('autoLogin', 'true');
    } else {
        localStorage.removeItem('autoLogin');
    }

    document.getElementById('authOverlay').style.display = 'none';
    init(); // 메인 앱 초기화
    updateUIForUser();
    alert(`환영합니다, ${user.nickname}님!`);
}

// 회원가입 처리
function handleRegister() {
    const nickname = document.getElementById('signupNickname').value.trim();
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

    // 유효성 검사
    if (!nickname || nickname.length < 2 || nickname.length > 10) {
        alert('닉네임은 2-10자로 입력해주세요.');
        return;
    }

    if (!password || password.length < 4) {
        alert('비밀번호는 4자 이상 입력해주세요.');
        return;
    }

    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    const users = getUsers();

    // 닉네임 중복 체크
    if (users.find(u => u.nickname === nickname)) {
        alert('이미 사용중인 닉네임입니다.');
        return;
    }

    // 새 사용자 추가 (기본 권한: member)
    const newUser = {
        nickname: nickname,
        password: password,
        role: 'member', // member: 댓글만, admin: 모든 권한
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    alert('회원가입이 완료되었습니다! 관리자 승인 후 로그인해주세요.');
    switchAuthTab('login');

    // 입력 필드 초기화
    document.getElementById('signupNickname').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupPasswordConfirm').value = '';
}

// 로그아웃
function handleLogout() {
    if (!confirm('로그아웃 하시겠습니까?')) return;

    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('autoLogin');
    
    document.getElementById('authOverlay').style.display = 'flex';
    switchAuthTab('login');
}

// UI 업데이트
function updateUIForUser() {
    if (!currentUser) return;

    const header = document.querySelector('header');
    let userInfo = document.getElementById('userInfo');
    
    if (!userInfo) {
        userInfo = document.createElement('div');
        userInfo.id = 'userInfo';
        header.appendChild(userInfo);
    }

    const roleText = currentUser.role === 'admin' ? '👑 관리자' : '👤 멤버';
    const roleColor = currentUser.role === 'admin' ? '#FFB6C1' : '#98D8C8';

    let userHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 15px; flex-wrap: wrap;">
            <div style="text-align: left;">
                <div style="font-size: 1.1em; font-weight: bold; color: white;">${currentUser.nickname}</div>
                <div style="font-size: 0.85em; color: ${roleColor};">${roleText}</div>
            </div>
    `;

    // 관리자일 경우 회원 관리 버튼 추가
    if (currentUser.role === 'admin') {
        userHTML += `
            <button onclick="showUserManagement()" style="padding: 8px 16px; background: rgba(255,182,193,0.3); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer; font-size: 0.9em; transition: all 0.3s;"
                onmouseover="this.style.background='rgba(255,182,193,0.5)'" onmouseout="this.style.background='rgba(255,182,193,0.3)'">
                👥 회원 관리
            </button>
        `;
    }

    userHTML += `
            <button onclick="handleLogout()" style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer; font-size: 0.9em; transition: all 0.3s;"
                onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                로그아웃
            </button>
        </div>
    `;

    userInfo.innerHTML = userHTML;
    updateButtonsVisibility();
    
    // 멤버는 목록 탭으로 자동 이동
    if (currentUser.role === 'member') {
        const currentTab = document.querySelector('.tab-content.active');
        if (currentTab) {
            const tabId = currentTab.id;
            if (tabId === 'attack-tab') {
                switchSubTab('list');
            } else if (tabId === 'defense-tab') {
                switchDefenseSubTab('def-list');
            }
        }
    }
}

// 권한에 따른 버튼 표시/숨김
function updateButtonsVisibility() {
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    // 등록 버튼은 관리자만
    const addButtons = document.querySelectorAll('[data-admin-only]');
    addButtons.forEach(btn => {
        btn.style.display = isAdmin ? '' : 'none';
    });

    // 수정/삭제 버튼도 관리자만
    const editButtons = document.querySelectorAll('.edit-btn, .delete-btn');
    editButtons.forEach(btn => {
        btn.style.display = isAdmin ? '' : 'none';
    });
}

// 회원 관리 모달
function showUserManagement() {
    const users = getUsers();
    
    let html = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="closeUserManagement()">
            <div style="background: white; border-radius: 20px; padding: 30px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <h2 style="margin: 0 0 20px 0; color: #B08AB0;">👥 회원 관리</h2>
                <div style="max-height: 400px; overflow-y: auto;">
    `;

    users.forEach(user => {
        const isCurrentUser = user.nickname === currentUser.nickname;
        html += `
            <div style="padding: 15px; border: 2px solid #f0f0f0; border-radius: 10px; margin-bottom: 10px; ${isCurrentUser ? 'background: #f9f9f9;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 150px;">
                        <div style="font-weight: bold; font-size: 1.1em; color: #333; margin-bottom: 5px;">
                            ${user.nickname} ${isCurrentUser ? '(나)' : ''}
                        </div>
                        <div style="font-size: 0.9em; color: #666;">
                            가입일: ${new Date(user.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <select id="role-${user.nickname}" style="padding: 8px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.9em;" ${isCurrentUser ? 'disabled' : ''}>
                            <option value="member" ${user.role === 'member' ? 'selected' : ''}>👤 멤버</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>👑 관리자</option>
                        </select>
                        ${!isCurrentUser ? `
                            <button onclick="updateUserRole('${user.nickname}')" style="padding: 8px 12px; background: #98D8C8; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9em;">
                                변경
                            </button>
                            <button onclick="deleteUser('${user.nickname}')" style="padding: 8px 12px; background: #ff6b6b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9em;">
                                삭제
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    html += `
                </div>
                <button onclick="closeUserManagement()" style="width: 100%; padding: 12px; margin-top: 20px; background: #B08AB0; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1em;">
                    닫기
                </button>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'userManagementModal';
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

function closeUserManagement() {
    const modal = document.getElementById('userManagementModal');
    if (modal) modal.remove();
}

function updateUserRole(nickname) {
    const newRole = document.getElementById(`role-${nickname}`).value;
    const users = getUsers();
    const user = users.find(u => u.nickname === nickname);
    
    if (!user) return;
    
    user.role = newRole;
    saveUsers(users);
    
    alert(`${nickname}님의 권한이 ${newRole === 'admin' ? '관리자' : '멤버'}로 변경되었습니다.`);
    closeUserManagement();
    showUserManagement();
}

function deleteUser(nickname) {
    if (!confirm(`${nickname}님을 삭제하시겠습니까?`)) return;
    
    let users = getUsers();
    users = users.filter(u => u.nickname !== nickname);
    saveUsers(users);
    
    alert(`${nickname}님이 삭제되었습니다.`);
    closeUserManagement();
    showUserManagement();
}

// 자동 로그인 체크
function checkAutoLogin() {
    const autoLogin = localStorage.getItem('autoLogin');
    const savedUser = localStorage.getItem('currentUser');

    if (autoLogin === 'true' && savedUser) {
        currentUser = JSON.parse(savedUser);
        init();
        updateUIForUser();
    } else {
        const overlay = document.getElementById('authOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }
}

// 페이지 로드 시 자동 로그인 체크
window.addEventListener('DOMContentLoaded', checkAutoLogin);
