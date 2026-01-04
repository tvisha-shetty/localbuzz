import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "firebase/auth";
import { auth } from "../firebase";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const res = await signInWithPopup(auth, provider);
    alert(`Logged in as ${res.user.email}`);
  };

  return (
    <div>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />

      <button onClick={() => signInWithEmailAndPassword(auth, email, password)}>
        Login
      </button>

      <button onClick={() => createUserWithEmailAndPassword(auth, email, password)}>
        Signup
      </button>

      <button onClick={googleLogin}>Google</button>
      <button onClick={() => signOut(auth)}>Logout</button>
    </div>
  );
}

export default Auth;
