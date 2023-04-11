import { Fragment, useContext, useEffect, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { update, get, child, ref } from "firebase/database";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import ApplicantDetails from "@delib/ApplicantDetails";
import {
  CheckCircleIcon,
  NoSymbolIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Logo from "@images/Logo.png";
import { FirebaseContext } from "@framework/FirebaseContext";

const navigation = [
  { name: "Deliberations", href: "#", current: true },
  { name: "Rush Overview", href: "#", current: false },
];
const userNavigation = [{ name: "Sign out", href: "#" }];
const tabs = [
  { name: "All Applicants", href: "#", count: "84", current: true },
  { name: "Under Consideration", href: "#", count: "84", current: false },
  { name: "Flagged for Review", href: "#", count: "62", current: false },
  { name: "Dropped", href: "#", count: "62", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function DelibPortal(props: { user: any }) {
  const firebase = useContext(FirebaseContext).firebase;
  const database = useContext(FirebaseContext).database;
  const swalReact = withReactContent(Swal);
  //@ts-ignore
  const [userGroups, setUserGroups]: [any, any] = useState([{}, {}, {}]); //Under Consideration, flagged for review, dropped
  const [currNav, setCurrNav] = useState("All Applicants");
  const [currSearch, setCurrSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [profPicImg, setProfPicImg] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Windows_10_Default_Profile_Picture.svg/1200px-Windows_10_Default_Profile_Picture.svg.png"
  );
  useEffect(() => {
    if (props.user != null) {
      get(child(ref(database), "rush_users"))
        .then((snapshot: any) => {
          const users = snapshot.val();
          setUsers(users);
          if (props.user.uid && props.user.uid in users) {
            const currUser: ProfileType = users[props.user.uid];
            if (currUser.admin) {
              setIsAdmin(true);
            }
            setProfPicImg(currUser.PfpURL);
          }
        })
        .catch((err) => {
          if (err.toString().includes("ermission")) {
            Swal.fire({
              icon: "error",
              title: "You do not have permission to view this page",
              text: "Contact Steve if you believe this is in error",
            });
          }
        });
    }
  }, [props.user]);

  function setUsers(users: any) {
    var dropped: any = {};
    var flagged: any = {};
    var notDropped: any = {};
    for (const uid in users) {
      const user = users[uid];
      if (!user.fullName) {
        console.log("Skipping user with no name\n");
        continue;
      }
      if (user.dropped) {
        dropped[uid] = user;
      } else if (user.flagged) {
        flagged[uid] = user;
      } else {
        notDropped[uid] = user;
      }
    }
    setUserGroups([notDropped, flagged, dropped]);
  }

  async function publishResults(stage: number) {
    for (const uid in userGroups[0]) {
      const user = userGroups[0][uid];
      user.stage = stage;
      await update(child(ref(database), `rush_users/${uid}`), user);
    }
    console.log("Sending email\n");
    await firebase
      .functions()
      .httpsCallable("publishResults")({})
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Done!",
          text: "Results have been published",
        });
      });
  }

  //removes a given user from the list it's currently in,
  //moves it to the correct list
  function moveGroups(uid: string, user: any, to: string) {
    var notDropped: any = userGroups[0];
    var flagged: any = userGroups[1];
    var dropped: any = userGroups[2];
    if (uid in notDropped) {
      delete notDropped[uid];
    } else if (uid in flagged) {
      delete flagged[uid];
    } else if (uid in dropped) {
      delete dropped[uid];
    }
    if (to === "notDropped") {
      user.dropped = false;
      user.flagged = false;
      notDropped[uid] = user;
    } else if (to === "flagged") {
      user.dropped = false;
      user.flagged = true;
      flagged[uid] = user;
    } else {
      user.dropped = true;
      user.flagged = false;
      dropped[uid] = user;
    }
    setUserGroups([notDropped, flagged, dropped]);
  }

  function filterBySearch(users: { [key: string]: ProfileType }) {
    if (currSearch === "") {
      return users;
    } else {
      var filteredUsers: any = {};
      const searchTerm = currSearch.toLowerCase();
      for (const uid in users) {
        const user = users[uid];
        if (
          user.fullName.toLowerCase().includes(searchTerm) ||
          user.major.toLowerCase().includes(searchTerm) ||
          (user.major.toLowerCase().includes("computer science") &&
            searchTerm === "cs") ||
          (user.major.toLowerCase().includes("cs") &&
            searchTerm === "computer science") ||
          (searchTerm === "male" &&
            !user.gender.toLowerCase().includes("female")) ||
          (searchTerm === "female" &&
            user.gender.toLowerCase().includes("female")) ||
          user.grade.toLowerCase().includes(searchTerm)
        ) {
          filteredUsers[uid] = user;
        }
      }
      return filteredUsers;
    }
  }

  function currCandGroup() {
    return currNav === "All Applicants"
      ? filterBySearch(
          Object.assign(
            {},
            Object.assign({}, userGroups[0], userGroups[1]),
            userGroups[2]
          )
        )
      : currNav === "Under Consideration"
      ? filterBySearch(userGroups[0])
      : currNav === "Flagged for Review"
      ? filterBySearch(userGroups[1])
      : filterBySearch(userGroups[2]);
  }

  function handleGroupChange(e: any) {
    setCurrNav(e.target.value);
  }

  function sortUIDsAlphabetically(user_dict: { [key: string]: ProfileType }) {
    return Object.keys(user_dict).sort((a, b) => {
      const userA: ProfileType = user_dict[a];
      const userB: ProfileType = user_dict[b];
      if (userB.dropped && !userA.dropped) {
        return -1;
      }
      if (userA.dropped && !userB.dropped) {
        return 1;
      }
      if (userA.flagged && !userB.flagged && !userB.dropped) {
        return 1;
      }
      if (userB.flagged && !userA.flagged && !userA.dropped) {
        return -1;
      }
      if (userA.fullName < userB.fullName) {
        return -1;
      }
      if (userA.fullName > userB.fullName) {
        return 1;
      }
      return 0;
    });
  }

  const currGroup = currCandGroup();

  return (
    <>
      <div className="min-h-full">
        {/* Navbar */}
        <Disclosure as="nav" className="bg-gray-50">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between border-b border-gray-200">
                  <div className="flex items-center relative">
                    <div className="flex relative top-1">
                      <img className="h-8 w-auto" src={Logo} alt="KTP NU" />
                    </div>

                    {/* Links section */}
                    <div className="hidden lg:ml-10 lg:block">
                      <div className="flex space-x-4">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-100"
                                : "hover:text-gray-700",
                              "rounded-md px-3 py-2 text-sm font-medium text-gray-900"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
                    {/* Search section */}
                    <div className="w-full max-w-lg lg:max-w-xs">
                      <label htmlFor="search" className="sr-only">
                        Search
                      </label>
                      <div className="relative text-gray-400 focus-within:text-gray-500">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <MagnifyingGlassIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </div>
                        <input
                          id="search"
                          className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                          placeholder="Search Rushees"
                          type="search"
                          name="search"
                          autoCorrect="off"
                          onChange={(e) => {
                            setCurrSearch(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex lg:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-50 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
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

                  {/* Actions section */}
                  <div className="hidden lg:ml-4 lg:block">
                    <div className="flex items-center">
                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3 flex-shrink-0">
                        <div>
                          <Menu.Button className="flex rounded-full bg-gray-50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                            <span className="sr-only">Open user menu</span>
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={profPicImg}
                              alt=""
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <a
                                    onClick={() =>
                                      firebase
                                        .auth()
                                        .signOut()
                                        .then(
                                          () => (window.location.href = "/")
                                        )
                                    }
                                    href={item.href}
                                    className={classNames(
                                      active ? "bg-gray-100" : "",
                                      "block py-2 px-4 text-sm text-gray-700"
                                    )}
                                  >
                                    {item.name}
                                  </a>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="border-b border-gray-200 bg-gray-50 lg:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        item.current ? "bg-gray-100" : "hover:bg-gray-100",
                        "block rounded-md px-3 py-2 font-medium text-gray-900"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="mt-3 space-y-1 px-2">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        onClick={() =>
                          firebase
                            .auth()
                            .signOut()
                            .then(() => (window.location.href = "/"))
                        }
                        className="block rounded-md py-2 px-3 text-base font-medium text-gray-900 hover:bg-gray-100"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Page heading */}
        <header className="bg-gray-50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Deliberations
              </h1>
            </div>
            <div className="mt-5 flex xl:mt-0 xl:ml-4">
              {/*Publish results button */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    if (Object.keys(userGroups[1]).length != 0) {
                      Swal.fire({
                        icon: "error",
                        title: "Not all applicants have been reviewed",
                        text: "Cannot publish results with applicants flagged for review",
                      });
                      return;
                    } else {
                      Swal.fire({
                        icon: "warning",
                        title: "Publishing results",
                        showCancelButton: true,
                        text: 'This will publish the results to all applicants. Applicants "Under Consideration" will be moved to the next round. To confirm, type the current stage of the rush process in the box below.',
                        input: "text",
                        inputPlaceholder: "Networking Night",
                      }).then((res) => {
                        if (!res.isConfirmed) {
                          return;
                        }
                        switch (res.value) {
                          case "Networking Night":
                            publishResults(2);
                            break;
                          case "Coffee Chats":
                            publishResults(3);
                            break;
                          case "Group Interviews":
                            publishResults(4);
                            break;
                          case "Individual Interviews":
                            publishResults(5);
                            break;
                          //else
                          default:
                            Swal.fire({
                              icon: "error",
                              title: "Unrecognized stage",
                              text: "Please enter one of the following: Networking Night, Coffee Chats, Group Interviews, Individual Interviews.",
                            });
                        }
                      });
                    }
                  }}
                  className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <PaperAirplaneIcon
                    className="-ml-0.5 h-5 w-5"
                    aria-hidden="true"
                  />
                  Publish Results to Rushees
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="pt-8 pb-16">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
              {currSearch == "" && (
                <h2 className="text-lg font-medium text-gray-900">
                  Rush Applicants
                </h2>
              )}
              {currSearch != "" && (
                <h2 className="text-lg font-medium text-gray-900">
                  Showing {Object.keys(currGroup).length} results for "
                  {currSearch}"
                </h2>
              )}

              {/* Tabs */}
              <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                  Select a tab
                </label>
                {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                <select
                  id="tabs"
                  name="tabs"
                  className="mt-4 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple-500"
                  defaultValue={tabs.find((tab) => tab.current).name}
                  onChange={handleGroupChange}
                >
                  <option key={"All Applicants"}>All Applicants</option>
                  <option key={"Under Consideration"}>
                    Under Consideration
                  </option>
                  <option key={"Flagged for Review"}>Flagged for Review</option>
                  <option key={"Dropped"}>Dropped</option>
                </select>
              </div>
              <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                  <nav className="mt-2 -mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      key="All Applicants"
                      onClick={() => {
                        setCurrNav("All Applicants");
                      }}
                      className={classNames(
                        currNav === "All Applicants"
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700",
                        "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                      )}
                    >
                      All Applicants
                      {Object.keys(userGroups[0]).length +
                      Object.keys(userGroups[1]).length +
                      Object.keys(userGroups[2]).length ? (
                        <span
                          className={classNames(
                            currNav === "All Applicants"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-gray-100 text-gray-900",
                            "ml-2 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block"
                          )}
                        >
                          {Object.keys(userGroups[0]).length +
                            Object.keys(userGroups[1]).length +
                            Object.keys(userGroups[2]).length}
                        </span>
                      ) : null}
                    </button>
                    <button
                      key="Under Consideration"
                      onClick={() => {
                        setCurrNav("Under Consideration");
                      }}
                      className={classNames(
                        currNav === "Under Consideration"
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-green-500 hover:border-gray-200 hover:text-green-700",
                        "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                      )}
                    >
                      Under Consideration
                      {Object.keys(userGroups[0]).length ? (
                        <span
                          className={classNames(
                            currNav === "Under Consideration"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-gray-100 text-gray-900",
                            "ml-2 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block"
                          )}
                        >
                          {Object.keys(userGroups[0]).length}
                        </span>
                      ) : null}
                    </button>
                    <button
                      key="Flagged for Review"
                      onClick={() => {
                        setCurrNav("Flagged for Review");
                      }}
                      className={classNames(
                        currNav === "Flagged for Review"
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-yellow-500 hover:border-gray-200 hover:text-yellow-700",
                        "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                      )}
                    >
                      Flagged for Review
                      {Object.keys(userGroups[1]).length ? (
                        <span
                          className={classNames(
                            currNav === "Flagged for Review"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-gray-100 text-gray-900",
                            "ml-2 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block"
                          )}
                        >
                          {Object.keys(userGroups[1]).length}
                        </span>
                      ) : null}
                    </button>
                    <button
                      key="Dropped"
                      onClick={() => {
                        setCurrNav("Dropped");
                      }}
                      className={classNames(
                        currNav === "Dropped"
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-red-500 hover:border-gray-200 hover:text-red-700",
                        "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                      )}
                    >
                      Dropped
                      {Object.keys(userGroups[2]).length ? (
                        <span
                          className={classNames(
                            currNav === "Dropped"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-gray-100 text-gray-900",
                            "ml-2 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block"
                          )}
                        >
                          {Object.keys(userGroups[2]).length}
                        </span>
                      ) : null}
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            {/* Stacked list */}
            <ul
              role="list"
              className="mt-5 divide-y divide-gray-200 border-t border-gray-200 sm:mt-0 sm:border-t-0"
            >
              {sortUIDsAlphabetically(currGroup).map((uid) => {
                const candidate = currGroup[uid];
                return (
                  <li key={candidate.email}>
                    <div className="group block cursor-pointer">
                      <div className="flex items-center py-5 px-4 sm:py-6 sm:px-0">
                        <div
                          onClick={() => {
                            const popupWidth =
                              window.screen.width > 640 ? "600px" : "90vw";
                            swalReact.fire({
                              html: <ApplicantDetails isAdmin={isAdmin} user={candidate} uid={uid} database={database} swapTech={() => {currGroup[uid].cs=!currGroup[uid].cs;setUserGroups(userGroups);}} />,
                              width: popupWidth,
                              showConfirmButton: false,
                              showCloseButton: true,
                            });
                          }}
                          className="flex min-w-0 flex-1 items-center"
                        >
                          <div className="flex-shrink-0">
                            <img
                              className="object-cover h-12 w-12 rounded-full group-hover:opacity-75"
                              src={candidate.PfpURL}
                              alt=""
                            />
                          </div>
                          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                            <div>
                              <p className="truncate text-sm font-medium text-purple-600">
                                {candidate.fullName}
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500">
                                <EnvelopeIcon
                                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                  aria-hidden="true"
                                />
                                <span className="truncate">
                                  {candidate.email}
                                </span>
                              </p>
                            </div>
                            <div className="hidden md:block">
                              <div>
                                <p className="text-sm text-gray-900">
                                  {candidate.major + " " + candidate.grade}
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500">
                                  {uid in userGroups[0] && (
                                    <>
                                      <CheckCircleIcon
                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-green-400"
                                        aria-hidden="true"
                                      />
                                      Under consideration
                                    </>
                                  )}
                                  {uid in userGroups[1] && (
                                    <>
                                      <ExclamationTriangleIcon
                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-yellow-400"
                                        aria-hidden="true"
                                      />
                                      Flagged for Review
                                    </>
                                  )}
                                  {uid in userGroups[2] && (
                                    <>
                                      <NoSymbolIcon
                                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-red-400"
                                        aria-hidden="true"
                                      />
                                      Dropped
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              update(
                                child(ref(database), "rush_users/" + uid),
                                { flagged: false, dropped: false }
                              );
                              moveGroups(uid, candidate, "notDropped");
                            }}
                            className={classNames(
                              currNav === "All Applicants" ? "invisible" : "",
                              "mr-2 inline-flex items-center gap-x-1.5 rounded-md bg-green-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            )}
                          >
                            <CheckCircleIcon
                              className="-mx-0.5 h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              update(
                                child(ref(database), "rush_users/" + uid),
                                { flagged: true, dropped: false }
                              );
                              moveGroups(uid, candidate, "flagged");
                            }}
                            className={classNames(
                              currNav === "All Applicants" ? "invisible" : "",
                              "mx-2 inline-flex items-center gap-x-1.5 rounded-md bg-yellow-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            )}
                          >
                            <ExclamationTriangleIcon
                              className="-mr-0.5 h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              update(
                                child(ref(database), "rush_users/" + uid),
                                { flagged: false, dropped: true }
                              );
                              moveGroups(uid, candidate, "dropped");
                            }}
                            className={classNames(
                              currNav === "All Applicants" ? "invisible" : "",
                              "ml-2 inline-flex items-center gap-x-1.5 rounded-md bg-red-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            )}
                          >
                            <NoSymbolIcon
                              className="-mr-0.5 h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}
