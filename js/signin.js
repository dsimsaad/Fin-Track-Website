import {
  auth,
  signInWithEmailAndPassword
} from "./firebase.js";
document.getElementById("signin-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "../html/index.html";
    })
    .catch(err => {
      alert(err.message);
    });
});
