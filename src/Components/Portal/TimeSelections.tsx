import { FirebaseContext } from "@framework/FirebaseContext";
import { useContext } from "react";
import Swal from "sweetalert2";
export default function TimeSelections(props: {
  times: { time: string; location: string; i: number; j: number }[];
  userDBEntry: ProfileType;
  selectMethod: string;
}) {
  const firebase = useContext(FirebaseContext).firebase;
  return (
    <div className="flex justify-center">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mt-8 flow-root">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-10 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Time
                      </th>
                      <th
                        scope="col"
                        className="px-10 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Location
                      </th>
                      <th
                        scope="col"
                        className="px-10 py-3.5 text-left text-sm font-semibold text-gray-900"
                      ></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {props.times.map((time) => (
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-10 text-sm font-medium text-gray-900 sm:pl-6">
                          {time.time}
                        </td>
                        <td className="whitespace-nowrap px-10 py-4 text-sm text-gray-500">
                          {time.location}
                        </td>
                        <td className="whitespace-nowrap px-10 py-4 text-sm text-gray-500">
                          <button
                            type="button"
                            onClick={() => {
                              const coffeeOptions:any = {
                                icon: "info",
                                title:
                                  "Are you sure you want to select this time slot?",
                                text: "You will not be able to change this time slot after you select it. Enter your phone number to confirm your selection.",
                                input: "text",
                                showCancelButton: true,
                              };
                              const groupOptions:any = {
                                icon: "info",
                                title:
                                  "Are you sure you want to select this time slot?",
                                text: "You will not be able to change this time slot after you select it.",
                                showCancelButton: true,
                              };
                              Swal.fire(props.selectMethod==="group_interviews" ? groupOptions : coffeeOptions).then((res) => {
                                if (res.isConfirmed) {
                                  Swal.fire({
                                    icon: "info",
                                    text: "Please wait while your timeslot is reserved...",
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                    allowEnterKey: false,
                                  });
                                  Swal.showLoading();
                                  if (props.selectMethod === "coffee_chats") {
                                    if(res.value.length==0) {
                                      Swal.close();
                                      return;
                                    }
                                    firebase
                                      .functions()
                                      .httpsCallable("reserveCCTime")({
                                        i: time.i,
                                        j: time.j,
                                        name: props.userDBEntry.fullName,
                                        phone: res.value,
                                      })
                                      .then((res: any) => {
                                        if (res.data) {
                                          window.location.reload();
                                        } else {
                                          Swal.fire({
                                            icon: "error",
                                            text: "This time slot is no longer available. Please refresh the page and try again.",
                                          }).then(() => {
                                            window.location.reload();
                                          });
                                        }
                                      });
                                  } else if(props.selectMethod==="group_interviews") {
                                    firebase
                                      .functions()
                                      .httpsCallable("reserveGITime")({
                                        i: time.i,
                                        name: props.userDBEntry.fullName,
                                      })
                                      .then((res: any) => {
                                        if (res.data) {
                                          window.location.reload();
                                        } else {
                                          Swal.fire({
                                            icon: "error",
                                            text: "This time slot is no longer available. Please refresh the page and try again.",
                                          }).then(() => {
                                            window.location.reload();
                                          });
                                        }
                                      });
                                  } else {
                                    if(res.value.length==0) {
                                      Swal.close();
                                      return;
                                    }
                                    firebase
                                      .functions()
                                      .httpsCallable("reserveIndivTime")({
                                        i: time.i,
                                        j: time.j,
                                        name: props.userDBEntry.fullName,
                                        phone: res.value,
                                      })
                                      .then((res: any) => {
                                        if (res.data) {
                                          window.location.reload();
                                        } else {
                                          Swal.fire({
                                            icon: "error",
                                            text: "This time slot is no longer available. Please refresh the page and try again.",
                                          }).then(() => {
                                            window.location.reload();
                                          });
                                        }
                                      });
                                  }
                                }
                              });
                            }}
                            className="block rounded-md bg-indigo-600 py-2 px-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          >
                            Select Time
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
