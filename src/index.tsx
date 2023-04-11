import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css';
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/functions";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getStorage, connectStorageEmulator } from "firebase/storage";

import {useEffect, useState} from 'react';
import { FirebaseContext } from '@framework/FirebaseContext';
import CheckLogin from "@framework/CheckLogin";
import Footer from "@framework/Footer";

import PortalContainer from "@portal/PortalContainer";
import Login from "@login/Login";
import DelibPortal from "@delib/DelibPortal";

const firebaseConfig = {
  apiKey: "AIzaSyBQDOEtzaF6scLyRpJN9doutxYNaZyuHNc",
  authDomain: "rush.ktpnu.com",
  databaseURL: "https://rush-ktp-default-rtdb.firebaseio.com",
  projectId: "rush-ktp",
  storageBucket: "rush-ktp.appspot.com",
  messagingSenderId: "801440217518",
  appId: "1:801440217518:web:e38305fb52e27b7b66f03f",
  measurementId: "G-YK29FJ5ZLY"
};

const app = firebase.initializeApp(firebaseConfig);
var provider = new firebase.auth.GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
var database: any;
var storage: any;

if (window.location.hostname === "localhost") {
  database = getDatabase();
  storage = getStorage();
  connectDatabaseEmulator(database, "localhost", 9000);
  connectStorageEmulator(storage, "localhost", 9199);
  firebase.functions().useEmulator("localhost", 5001);
  firebase.auth().useEmulator("http://localhost:9099");
  if (!sessionStorage.getItem("givenWarning")) {
    alert(
      "Initializing in emulator mode. If you aren't a developer, contact support@ktpnu.com immediately."
    );
    sessionStorage.setItem("givenWarning", "true");
  }
} else {
  storage = getStorage(app);
  database = getDatabase(app);
}

function RedirectToLogin() {
  useEffect(() => {window.location.href="/"}, []);
  return (<></>);
}
function Full() {
  const [user, setUser] = useState(null);
  return (
    <FirebaseContext.Provider value={{firebase,database,storage,provider}}>
    <Router>
      <Routes>
        <Route path="/" element={<><CheckLogin setUser={setUser} delibs={false}/><PortalContainer user={user}/><Footer /></>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/delibs" element={<><CheckLogin setUser={setUser} delibs={true}/><DelibPortal user={user}/></>} />
        <Route path="/*" element={<RedirectToLogin />} />
      </Routes>
    </Router>
    </FirebaseContext.Provider>
  )
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Full />
);
