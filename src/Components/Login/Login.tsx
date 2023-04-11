import { useContext, useEffect } from "react";
import DamienPic from "@images/damien.jpg";
import Logo from "@images/Logo.png";
import { FirebaseContext } from "@framework/FirebaseContext";
import Swal from "sweetalert2";

export default function Login() {
  const firebase = useContext(FirebaseContext).firebase;
  const provider = useContext(FirebaseContext).provider;

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user: any) => {
      if (user) {
        window.location.href = "/";
      } else {
        console.log("DEBUG: signed out");
      }
    });
  }, []);

  return (
    <div className="flex min-h-full">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <img className="h-12 w-auto" src={Logo} alt="Kappa Theta Pi" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Welcome to Kappa Theta Pi!
            </h2>
            <p className="mt-2 text-sm text-gray-600 font-medium">
              Northwestern's premiere co-ed technological fraternity
            </p>
          </div>

          <div className="mt-8">
            <div>
              <div className="relative mt-6">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    If you're ready to apply
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div>
                <button
                  onClick={() => {
                    firebase
                      .auth()
                      .signInWithPopup(provider)
                      .then(() => {
                        if(window.location.href.includes("delibs")) {
                          window.location.href = "/delibs";
                        } else {
                          window.location.href = "/";
                        }
                      })
                      .catch(() => {
                        firebase
                          .auth()
                          .signOut()
                          .then(() => {
                            Swal.fire({
                              title:
                                "Use a Northwestern gmail account to sign up",
                            }).then(() => {
                              window.location.reload();
                            });
                          });
                      });
                  }}
                  className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-screen w-full object-cover"
          src={DamienPic}
          alt=""
        />
      </div>
    </div>
  );
}
