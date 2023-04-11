import { Fragment, useContext, useEffect, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import CoffeeChatContent from "@portal/CoffeeChatContent";
import Congrats from "@portal/Congrats";
import NetworkingNightContent from "@portal/NetworkingNightContent";
import GroupInterviewContent from "@portal/GroupInterviewContent";
import IndivInterviewContent from "@portal/IndivInterviewContent";
import Application from "@portal/Application";
import Steps from "@portal/Steps";
import Logo from "@images/Logo.png";
import Dropped from "@portal/Dropped";
import { FirebaseContext } from "@framework/FirebaseContext";
import { ref, child, get } from "firebase/database";

var smallNav:any = {
  'rush':{ name: "Rush Process", href: "#"},
};

var fullNav:any = {
  'rush':{ name: "Rush Process", href: "#"},
  'application':{ name: "View Application", href: "#"},
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function PortalContainer(props: { user: any }) {
  const firebase = useContext(FirebaseContext).firebase;
  const database = useContext(FirebaseContext).database;
  const [userDBEntry, setUserDBEntry]: [ProfileType, any] = useState(null);
  const [userStage, setUserStage]: [number, any] = useState(-1);
  const [activeNav, setActiveNav]:[string, any] = useState("rush");
  const [nav, setNav] = useState(smallNav);
  const [dropped, setDropped] = useState(false);
  useEffect(() => {
    if (props.user) {
      get(child(ref(database), "rush_users/" + props.user.uid)).then(
        (snapshot) => {
          const dbEntry = snapshot.val();
          if(dbEntry?.dropped) {
            setDropped(true);
          }
          setUserDBEntry(dbEntry);
          if (!dbEntry) {
            console.log("Error shouldn't happen...");
            window.location.href = "/login";
          } else if (!dbEntry.completed_application) {
            setUserStage(0);
          } else if (dbEntry.completed_application && !dbEntry.stage) {
            setUserStage(1);
            setNav(fullNav);
          } else {
            setUserStage(dbEntry.stage);
            setNav(fullNav);
          }
        }
      );
    }
  }, [props.user]);
  return (
    <>
      <div className="min-h-full">
        {userStage!=5 && <Disclosure as="nav" className="border-b border-gray-200 bg-white">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                  <div className="flex">
                    <div className="flex flex-shrink-0 items-center pt-2">
                      <a href="https://www.ktpnu.com">
                        <img
                          className="block h-8 w-auto lg:hidden"
                          src={Logo}
                          alt="KTP Northwestern"
                        />
                        <img
                          className="hidden h-8 w-auto lg:block"
                          src={Logo}
                          alt="KTP Northwestern"
                        />
                      </a>
                    </div>
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                      {Object.keys(nav).map((navKey:string) => {const item = nav[navKey]; return (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={() => setActiveNav(navKey)}
                          className={classNames(
                            activeNav===navKey
                              ? "border-indigo-500 text-gray-900"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                            "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                          )}
                          aria-current={activeNav===navKey ? "page" : undefined}
                        >
                          {item.name}
                        </a>
                      )})}
                    </div>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-8 w-8 rounded-full object-cover"
                            src={
                              userDBEntry?.PfpURL ||
                              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt1ceyneFkZchgkrwN7dZxWNl_C5Dctvc5BzNh_rEzPQ&s"
                            }
                            alt=""
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item key="signout">
                            <button
                              onClick={() =>
                                firebase
                                  .auth()
                                  .signOut()
                                  .then(() => (window.location.href = "/"))
                              }
                              className={
                                "block px-4 py-2 text-sm text-gray-700"
                              }
                            >
                              Sign Out
                            </button>
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                  <div className="-mr-2 flex items-center sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="space-y-1 pt-2 pb-3">
                  {Object.keys(nav).map((navKey) => {const item = nav[navKey]; return (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      onClick={() => setActiveNav(navKey)}
                      className={classNames(
                        activeNav===navKey
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                        "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                      )}
                      aria-current={activeNav===navKey ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  )})}
                </div>
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={
                          userDBEntry?.PfpURL ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt1ceyneFkZchgkrwN7dZxWNl_C5Dctvc5BzNh_rEzPQ&s"
                        }
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {userDBEntry?.fullName || ""}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {userDBEntry?.email || ""}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Disclosure.Button
                      key="signout"
                      as="a"
                      href="#"
                      onClick={() =>
                        firebase.auth().signOut().then(() => {
                          window.location.href = "/";
                        })
                      }
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Sign Out
                    </Disclosure.Button>
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>}

        <div className="py-10 bg-gray-100">
          <header>
            <div className="hidden mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Rush Portal
              </h1>
            </div>
          </header>
          {!dropped && activeNav==="rush" && (
            <main>
              {userStage == -1 && (
                <div className="flex justify-center"><div className="sm:px-6 lg:px-8 h-screen">
                  <h1 className="text-2xl font-bold">Loading...</h1>
                </div></div>
              )}
              <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                {userStage != -1 && userStage!=5 && <Steps stage={userStage} />}
              </div>
              {userStage === 0 && <Application user={props.user} userEntry={userDBEntry} readonly={false}/>}
              {userStage === 1 && <NetworkingNightContent />}
              {userStage === 2 && <CoffeeChatContent userDBEntry={userDBEntry}/>}
              {userStage === 3 && <GroupInterviewContent userDBEntry={userDBEntry}/>}
              {userStage === 4 && <IndivInterviewContent userDBEntry={userDBEntry} />}
              {userStage == 5 && <Congrats/>}
            </main>
          )}
          {!dropped && activeNav==="application" && (
            <Application user={props.user} userEntry={userDBEntry} readonly={true}/>
          )}
        </div>
        {dropped && (<Dropped />)}
      </div>
    </>
  );
}
