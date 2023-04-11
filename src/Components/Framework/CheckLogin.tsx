import { FirebaseContext } from "@framework/FirebaseContext";
import { useContext, useEffect } from "react";
export default function CheckLogin(props:{setUser:any, delibs:boolean}) {
  const firebase = useContext(FirebaseContext).firebase;
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user: any) => {
      if (user) {
        console.log("User is logged in\n");
        props.setUser(user);
      } else {
        //user is signed out, show timer popup and redirect to login
        if(props.delibs) {
          window.location.href = "/login#delibs";
        } else {
          window.location.href = "/login";
        }
      }
    });
  }, []);
  return (<></>);
}
