// ===========================
// Firebase 인증 시스템 (auth.js)
// ===========================

let currentUser = null;

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
async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('이메일과 비밀번호를 입력해주세요.');
        return;
    }

    try {
        const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(window.auth, email, password);
        const user = userCredential.user;

        // Firestore에서 사용자 정보 가져오기
        const userDocRef = window.firestore.doc(window.db, 'users', user.uid);
        const userDoc = await window.firestore.getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // 승인 대기 중인 사용자 차단
            if (userData.role === 'pending') {
                alert('아직 관리자 승인이 완료되지 않았습니다. 승인 후 로그인 가능합니다.');
                await window.firebaseAuth.signOut(window.auth);
                return;
            }
            
            currentUser = {
                uid: user.uid,
                email: user.email,
                ...userData
            };

            document.getElementById('authOverlay').style.display = 'none';
            init(); // 메인 앱 초기화
            updateUIForUser();
            alert(`환영합니다, ${currentUser.nickname}님!`);
        } else {
            alert('사용자 정보를 찾을 수 없습니다.');
            await window.firebaseAuth.signOut(window.auth);
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        if (error.code === 'auth/invalid-credential') {
            alert('이메일 또는 비밀번호가 일치하지 않습니다.');
        } else if (error.code === 'auth/user-not-found') {
            alert('존재하지 않는 계정입니다.');
        } else if (error.code === 'auth/wrong-password') {
            alert('비밀번호가 일치하지 않습니다.');
        } else {
            alert('로그인 중 오류가 발생했습니다: ' + error.message);
        }
    }
}

// 회원가입 처리
async function handleRegister() {
    const email = document.getElementById('signupEmail').value.trim();
    const nickname = document.getElementById('signupNickname').value.trim();
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

    // 유효성 검사
    if (!email || !email.includes('@')) {
        alert('올바른 이메일 주소를 입력해주세요.');
        return;
    }

    if (!nickname || nickname.length < 2 || nickname.length > 10) {
        alert('닉네임은 2-10자로 입력해주세요.');
        return;
    }

    if (!password || password.length < 6) {
        alert('비밀번호는 6자 이상 입력해주세요.');
        return;
    }

    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    try {
        // Firebase Authentication에 사용자 생성
        const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(window.auth, email, password);
        const user = userCredential.user;

        // Firestore에 사용자 정보 저장
        await window.firestore.setDoc(window.firestore.doc(window.db, 'users', user.uid), {
            email: email,
            nickname: nickname,
            role: 'pending', // 승인 대기 상태
            createdAt: new Date().toISOString()
        });

        alert('회원가입이 완료되었습니다! 관리자 승인 후 로그인 가능합니다.');
        switchAuthTab('login');

        // 입력 필드 초기화
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupNickname').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('signupPasswordConfirm').value = '';

    } catch (error) {
        console.error('회원가입 오류:', error);
        if (error.code === 'auth/email-already-in-use') {
            alert('이미 사용 중인 이메일입니다.');
        } else if (error.code === 'auth/invalid-email') {
            alert('올바르지 않은 이메일 형식입니다.');
        } else if (error.code === 'auth/weak-password') {
            alert('비밀번호가 너무 약합니다. 6자 이상 입력해주세요.');
        } else {
            alert('회원가입 중 오류가 발생했습니다: ' + error.message);
        }
    }
}

// 로그아웃
async function handleLogout() {
    if (!confirm('로그아웃 하시겠습니까?')) return;

    try {
        await window.firebaseAuth.signOut(window.auth);
        currentUser = null;
        document.getElementById('authOverlay').style.display = 'flex';
        switchAuthTab('login');
    } catch (error) {
        console.error('로그아웃 오류:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
    }
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
async function showUserManagement() {
    try {
        // Firestore에서 모든 사용자 가져오기
        const usersSnapshot = await window.firestore.getDocs(window.firestore.collection(window.db, 'users'));
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push({ uid: doc.id, ...doc.data() });
        });

        let html = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="closeUserManagement()">
                <div style="background: white; border-radius: 20px; padding: 30px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;" onclick="event.stopPropagation()">
                    <h2 style="margin: 0 0 20px 0; color: #B08AB0;">👥 회원 관리</h2>
                    <div style="max-height: 400px; overflow-y: auto;">
        `;

        users.forEach(user => {
            const isCurrentUser = user.uid === currentUser.uid;
            html += `
                <div style="padding: 15px; border: 2px solid #f0f0f0; border-radius: 10px; margin-bottom: 10px; ${isCurrentUser ? 'background: #f9f9f9;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 150px;">
                            <div style="font-weight: bold; font-size: 1.1em; color: #333; margin-bottom: 5px;">
                                ${user.nickname} ${isCurrentUser ? '(나)' : ''}
                            </div>
                            <div style="font-size: 0.85em; color: #999;">${user.email}</div>
                            <div style="font-size: 0.9em; color: #666;">
                                가입일: ${new Date(user.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px; align-items: center;">
                            <select id="role-${user.uid}" style="padding: 8px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.9em;" ${isCurrentUser ? 'disabled' : ''}>
                                <option value="pending" ${user.role === 'pending' ? 'selected' : ''}>⏳ 승인대기</option>
                                <option value="member" ${user.role === 'member' ? 'selected' : ''}>👤 멤버</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>👑 관리자</option>
                            </select>
                            ${!isCurrentUser ? `
                                <button onclick="updateUserRole('${user.uid}')" style="padding: 8px 12px; background: #98D8C8; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9em;">
                                    변경
                                </button>
                                <button onclick="deleteUser('${user.uid}', '${user.nickname}')" style="padding: 8px 12px; background: #ff6b6b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9em;">
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

    } catch (error) {
        console.error('회원 목록 로드 오류:', error);
        alert('회원 목록을 불러오는데 실패했습니다.');
    }
}

function closeUserManagement() {
    const modal = document.getElementById('userManagementModal');
    if (modal) modal.remove();
}

async function updateUserRole(uid) {
    const newRole = document.getElementById(`role-${uid}`).value;
    
    try {
        const userDocRef = window.firestore.doc(window.db, 'users', uid);
        await window.firestore.updateDoc(userDocRef, {
            role: newRole
        });
        
        const roleText = newRole === 'admin' ? '관리자' : (newRole === 'member' ? '멤버' : '승인대기');
        alert(`권한이 ${roleText}로 변경되었습니다.`);
        closeUserManagement();
        showUserManagement();
    } catch (error) {
        console.error('권한 변경 오류:', error);
        alert('권한 변경에 실패했습니다.');
    }
}

async function deleteUser(uid, nickname) {
    if (!confirm(`${nickname}님을 삭제하시겠습니까?`)) return;
    
    try {
        await window.firestore.deleteDoc(window.firestore.doc(window.db, 'users', uid));
        
        alert(`${nickname}님이 삭제되었습니다.`);
        closeUserManagement();
        showUserManagement();
    } catch (error) {
        console.error('사용자 삭제 오류:', error);
        alert('사용자 삭제에 실패했습니다.');
    }
}

// 인증 상태 관찰
window.addEventListener('DOMContentLoaded', () => {
    window.firebaseAuth.onAuthStateChanged(window.auth, async (user) => {
        if (user) {
            // 로그인 상태
            const userDocRef = window.firestore.doc(window.db, 'users', user.uid);
            const userDoc = await window.firestore.getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // 승인 대기 중인 사용자는 로그인 불가
                if (userData.role === 'pending') {
                    await window.firebaseAuth.signOut(window.auth);
                    currentUser = null;
                    document.getElementById('authOverlay').style.display = 'flex';
                    return;
                }
                
                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    ...userData
                };
                document.getElementById('authOverlay').style.display = 'none';
                init();
                updateUIForUser();
            }
        } else {
            // 로그아웃 상태
            currentUser = null;
            document.getElementById('authOverlay').style.display = 'flex';
        }
    });
});