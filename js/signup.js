import {
  auth,
  createUserWithEmailAndPassword
} from "./firebase.js";

document.getElementById("signup-form").addEventListener("submit", e => {
  e.preventDefault();

  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("confirm-password").value;

  if (password !== confirm) {
    alert("Passwords do not match");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "../html/signin.html";
    })
    .catch(err => {
      alert(err.message);
    });
});