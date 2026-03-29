import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const authBtn = document.getElementById("auth-btn");
  if (!authBtn) return;
  onAuthStateChanged(auth, user => {
    if (user) {
      authBtn.textContent = "Log out";
      authBtn.href = "#"; 
      authBtn.onclick = e => {
        e.preventDefault();
        signOut(auth).then(() => {
          window.location.href = "../html/signin.html";
        });
      };
    } else {
      authBtn.textContent = "Sign In";
      authBtn.href = "../html/signin.html";
      authBtn.onclick = null;
    }
  });
});
