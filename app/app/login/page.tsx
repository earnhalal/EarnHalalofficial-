'use client';
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const login = () => {
    alert("Login successful! Dashboard coming soon.");
  };

  return (
    <div style={{textAlign:"center", marginTop:"100px"}}>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:10, margin:5, width:"300px"}} /><br/>
      <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} style={{padding:10, margin:5, width:"300px"}} /><br/>
      <button onClick={login} style={{background:"#28a745", color:"white", padding:12, border:"none", margin:10}}>Login</button>
    </div>
  );
}
