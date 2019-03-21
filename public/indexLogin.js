// Initialize Firebase
var config = {
  apiKey: "AIzaSyAtuN1ZO2u_p21R8OC7ZZ4acsEGqvdibqQ",
  authDomain: "quiz-beta-development.firebaseapp.com",
  databaseURL: "https://quiz-beta-development.firebaseio.com",
  projectId: "quiz-beta-development",
  storageBucket: "quiz-beta-development.appspot.com",
  messagingSenderId: "246372372773"
};

firebase.initializeApp(config);
const auth = firebase.auth();

const loginState = document.getElementById("loginState");
const txtEmail = document.getElementById("txtEmail");
const txtPassword = document.getElementById("txtPassword");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const btnContinue = document.getElementById("btnContinue");

txtPassword.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      btnLogin.click();
    }
});

btnLogin.addEventListener("click", e => {
    const email = txtEmail.value;
    const pass = txtPassword.value;

    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(error => {
      loginState.innerText = "Invalid email and password"
      console.log(error.message);
    });
});

btnLogout.addEventListener("click", e => {
  auth.signOut();
});

btnContinue.addEventListener("click", e => {
  if (auth.currentUser) location.href = "quiz.html";
});

firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    loginState.innerText = "Welcome back " + firebaseUser.email + ", please click continue.";
    btnLogin.setAttribute("hidden", "");
    btnLogout.removeAttribute("hidden");
    btnContinue.removeAttribute("hidden");
    txtEmail.value = "";
    txtPassword.value = "";
  } else {
    loginState.innerText = "Please log in with your Chirpy login and password.";
    btnLogin.removeAttribute("hidden");
    btnLogout.setAttribute("hidden", "");
    btnContinue.setAttribute("hidden", "");
  }
});
