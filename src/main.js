document.addEventListener('DOMContentLoaded', () => {

  // 登入 || 註冊的 input hidden
  const inputType = document.getElementById('type');

  // 切換 tab
  const tabTitle = document.querySelectorAll('.tab-title a');
  Array.prototype.forEach.call(tabTitle, tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();

      // 改變 .active
      document.querySelector('.tab-title .active').classList.remove('active');
      e.target.classList.add('active');

      // 改變 input value
      inputType.value = e.target.dataset.value;
    })
  });

  // 註冊
  function createUser(email, password) {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        // 隱藏登入區塊
        document.querySelector('.user-null').classList.add('none');
      })
      .catch(error => {
        changeErrMessage(error.message);
      });
  }

  // 登入
  function signIn(email, password) {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        // 隱藏登入區塊
        document.querySelector('.user-null').classList.add('none');
      })
      .catch(error => {
        changeErrMessage(error.message);
      });
  }

  // 判斷是 登入 || 註冊
  function checkType() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    if(inputType.value === 'signin') {
      signIn(email, password)
    }
    else if(inputType.value === 'create') {
      createUser(email, password)
    }
  }

  // 改變錯誤訊息
  const errorMessage = document.getElementById('error-message');
  function changeErrMessage(message) {
    errorMessage.innerHTML = message;
  }

  // 執行 登入 || 註冊
  const btnSign = document.getElementById('sign-up');
  btnSign.addEventListener('click', checkType)

  const inputPassword = document.getElementById('password');
  inputPassword.addEventListener('keyup', e => {
    if(e.code === 'Enter' || e.code === 'NumpadEnter') checkType();
  });

  // 重新驗證使用者
  function reAuth(checkPassword) {
    return new Promise((resolve, reject) => {
      const user = firebase.auth().currentUser;
      const password = document.getElementById(checkPassword).value;
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
      user.reauthenticateWithCredential(credential).then(() => {
        resolve(user)
      }).catch(error => {
        reject(error.message);
      });
    })
  }

  // 判斷登入狀態
  firebase.auth().onAuthStateChanged(user => {

    // 登入中
    if(user) {
    console.log("user", user)

      // 隱藏登入區塊
      document.querySelector('.user-logged').classList.remove('none');

      changeErrMessage('');



      // 更新 User 資訊
      const displayName = user.displayName;
      const email = user.email;
      const uid = user.uid;
      const emailVerify = user.emailVerified;
      if(displayName) {
        document.getElementById('user-name').innerHTML = `您的名稱：${displayName}`;
      }
      document.getElementById('user-email').innerHTML = `您的帳號：${email}`;
      document.getElementById('user-uid').innerHTML = `您的Uid：${uid}`;
      document.getElementById('user-email-verify').innerHTML = `您的信箱是否驗證：${emailVerify}`;



      // 更新 User 名稱
      function updateUserName(name) {
        user.updateProfile({
          displayName: name
        }).then(() => {
          window.location.reload();
        }).catch(function(error) {
          changeErrMessage(error.message);
        });
      }

      const btnUserName = document.getElementById('editor');
      btnUserName.addEventListener('click', e => {
        document.querySelector('.user-logged').classList.add('none');
        document.querySelector('.user-editor').classList.remove('none');
      });
      
      const btnUserNameSure = document.getElementById('sure-name');
      btnUserNameSure.addEventListener('click', e => {
        const name = document.getElementById('new-name').value;
        updateUserName(name);
      });



      // 修改密碼
      // 參考：https://stackoverflow.com/questions/55271096/firebase-problem-updating-password-after-re-authenticating
      function updatePassword() {
        const newPassword = document.getElementById('new-password').value;

        // 重新驗證使用者，驗證成功才能更新密碼
        reAuth('old-password-change')
          .then(user => {
            user.updatePassword(newPassword).then(() => {
              window.alert('密碼更新完成，請重新登入');
              firebase.auth().signOut().then(() => {
                window.location.reload();
              });
            }).catch(error => {
              changeErrMessage(error.message)
            });
          })
          .catch(error => {
            changeErrMessage(error.message)
          });

      }
      const btnPassword = document.getElementById('changePassword');
      btnPassword.addEventListener('click', e => {
        document.querySelector('.user-logged').classList.add('none');
        document.querySelector('.user-password').classList.remove('none');
      });

      const btnPasswordSure = document.getElementById('sure-password');
      btnPasswordSure.addEventListener('click', () => {
        const password = document.getElementById('new-password').value;
        updatePassword(password)
      })
      


      // 信箱驗證
      const btnVerifyEmail = document.getElementById('verify-email');
      btnVerifyEmail.addEventListener('click', () => {
        // firebase.auth().languageCode = 'zh-TW'; // 發信模版改中文
        user.sendEmailVerification().then(() => {
          // 驗證信發送完成
          window.alert('驗證信已發送到您的信箱，請查收。')
        }).catch(error => {
          // 驗證信發送失敗
          changeErrMessage(error.message);
        });
      });

      // 登出
      const btnLogOut = document.getElementById('logout');
      btnLogOut.addEventListener('click', () => {
        firebase
          .auth()
          .signOut()
          .then(() => {
            window.location.reload();
          }).catch(error => {
            changeErrMessage(error.message)
          });
      })



      // 刪除帳號
      function deleteUser() {
        // 重新驗證使用者，驗證成功才刪除
        reAuth('old-password-delete')
          .then(user => {
            user.delete().then(() => {
              window.alert('您的帳號已成功刪除');
              window.location.reload();
            }).catch(error => {
              changeErrMessage(error.message)
            });
          })
          .catch(error => {
            changeErrMessage(error.message)
          })

      }
      const btnDelete = document.getElementById('delete-user');
      btnDelete.addEventListener('click', e => {
        document.querySelector('.user-logged').classList.add('none');
        document.querySelector('.user-delete').classList.remove('none');
      });
      const btnDeleteSure = document.getElementById('sure-delete');
      btnDeleteSure.addEventListener('click', () => {
        deleteUser();
      })

    }
    // 未登入
    else {

      // 隱藏會員區塊
      document.querySelector('.user-null').classList.remove('none');

      changeErrMessage('');



      // 忘記密碼
      const btnForget = document.getElementById('forgot');
      btnForget.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector('.user-null').classList.add('none');
        document.querySelector('.user-forgot').classList.remove('none');
      });

      const btnUserForgotSure = document.getElementById('sure-forgot');
      btnUserForgotSure.addEventListener('click', e => {
        const emailAddress = document.getElementById('new-forgot').value;
        const auth = firebase.auth();
        firebase.auth().languageCode = 'zh-TW'; // 發信模版改中文
        
        auth.sendPasswordResetEmail(emailAddress).then(() => {
          window.alert('已發送信件至信箱，請按照信件說明重設密碼');
          window.location.reload();
        }).catch(error => {
          changeErrMessage(error.message)
        });
      })

    }

  });

})