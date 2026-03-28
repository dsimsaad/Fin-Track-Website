import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const authBtn = document.getElementById("auth-btn");
  if (!authBtn) return;
  onAuthStateChanged(auth, user => {
    if (user) {
      authBtn.textContent = "Log out";
      if (typeof loadFromLocalStorage === "function") {
          loadFromLocalStorage(user.uid);
          renderAll(); 
      }
    } else {
      currentUserId = null;
      authBtn.textContent = "Sign In";
    }
});
});
