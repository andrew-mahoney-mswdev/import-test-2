// Initialize Firebase
var config = {
    apiKey: "AIzaSyAEGKP2WfYOKxD8_PSRhNGD9__eb3T2YA4",
    authDomain: "import-test-2-32c53.firebaseapp.com",
    databaseURL: "https://import-test-2-32c53.firebaseio.com",
    projectId: "import-test-2-32c53",
    storageBucket: "import-test-2-32c53.appspot.com",
    messagingSenderId: "261167122833"
};

firebase.initializeApp(config);
const auth = firebase.auth();

const txtEmail = document.getElementById("txtEmail");
const txtPassword = document.getElementById("txtPassword");
const btnLogin = document.getElementById("btnLogin");
const btnSignUp = document.getElementById("btnSignUp");
const btnLogout = document.getElementById("btnLogout");
const loginStatus = document.getElementById("userEmail");

btnLogin.addEventListener("click", e => {
    const email = txtEmail.value;
    const pass = txtPassword.value;

    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
});

btnSignUp.addEventListener("click", e => {
  const email = txtEmail.value;
  const pass = txtPassword.value;
  
  const promise = auth.createUserWithEmailAndPassword(email, pass);
  promise.catch(e => console.log(e.message));
});

btnLogout.addEventListener("click", e => {
  auth.signOut();
});

firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    loginStatus.innerText = "You are logged in as: " + firebaseUser.email;
  } else {
    loggedInUser = undefined;
    loginStatus.innerText = "You are logged in as: (you are not logged in)";
  }
});

// var firestore = firebase.firestore();

// // const docRef = firestore.doc("myCollection/myDocument");
// const output = document.getElementById("output");
// const data = document.getElementById("data");
// const btnSave = document.getElementById("saveButton");
// const btnLoad = document.getElementById("loadButton");
// const cheatBtn = document.getElementById("cheat");

// btnSave.addEventListener("click", () => {
//   console.log(auth);
//   const docRef = firestore.doc("myCollection/" + auth.currentUser.uid);
//   const txtToSave = data.value;
//   console.log("I am going to save " + txtToSave);
//   docRef.set({
//     myValue: txtToSave
//   }).then(() => {
//     console.log("Success!");
//   }).catch(() => e => {
//     console.log(e);
//   })
// });

// btnLoad.addEventListener("click", () => {
//   const docRef = firestore.doc("myCollection/" + auth.currentUser.uid);
//   docRef.get().then(doc => {
//     if (doc.exists) {
//       const myData = doc.data();
//       output.innerText = "Your value is: " + myData.myValue;
//     }
//   }).catch(e => {
//     console.log(e);
//   });
// });

// cheatBtn.addEventListener("click", () => {
//   const docRef = firestore.doc("myCollection/XNd5iUkUlnak3GKlL2XPfoF2Kj83");
//   docRef.get().then(doc => {
//     if (doc.exists) {
//       const myData = doc.data();
//       output.innerText = "Your value is: " + myData.myValue;
//     }
//   }).catch(e => {
//     console.log(e);
//   });
// });
