import { FirebaseContext } from "@framework/FirebaseContext";
import { useContext, useState } from "react";
import Swal from "sweetalert2";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface TimeType {
  time: string;
  location: string;
  date: string;
  interviewer_id: number;
  i: number;
  j: number;
}

export default function CCTimeSelections(props: {
  times: TimeType[];
  userDBEntry: ProfileType;
  selectMethod: string;
}) {
  function handleSecondClick(time: TimeType) {
    const coffeeOptions: any = {
      icon: "info",
      title: "Are you sure you want to select these time slots?",
      width: 600,
      html: "Time 1: " + selectedTime.time.time + " at " +
        selectedTime.time.location + " on " + selectedTime.time.date +
        "<br>Time 2: " + time.time + " at " + time.location + " on " +
        time.date +
        "<br><br>You will not be able to change these time slots after you confirm. Enter your phone number to confirm your selection.",
      input: "text",
      showCancelButton: true,
    };
    Swal.fire(
      coffeeOptions,
    ).then((res) => {
      if (res.isConfirmed) {
        Swal.fire({
          icon: "info",
          text: "Please wait while your timeslot is reserved...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
        });
        Swal.showLoading();
        if (res.value.length == 0) {
          Swal.close();
          return;
        }
        firebase
          .functions()
          .httpsCallable("reserveCCTime")({
            i1: selectedTime.time.i,
            j1: selectedTime.time.j,
            i2: time.i,
            j2: time.j,
            name: props.userDBEntry.fullName,
            phone: res.value,
          })
          .then((res: any) => {
            if (res.data) {
              window.location.reload();
            } else {
              Swal.fire({
                icon: "error",
                text:
                  "This time slot is no longer available. Please refresh the page and try again.",
              }).then(() => {
                window.location.reload();
              });
            }
          });
      }
    });
  }

  function buttonBG(time: TimeType, selectedTime: { time?: TimeType }) {
    if (selectedTime.time && time === selectedTime.time) {
      return "px-[22px] bg-green-600";
    }
    if (selectedTime.time!=null) {
      if (
        selectedTime.time.interviewer_id === time.interviewer_id
      ) {
        return "bg-gray-600 pointer-events-none";
      }
    }
    return "bg-indigo-600 hover:bg-indigo-500";
  }

  function buttonText(time: TimeType, selectedTime: { time?: TimeType }) {
    if (selectedTime.time!=null && time === selectedTime.time) {
      return "Selected";
    }
    if (selectedTime.time!=null) {
      if (time.interviewer_id == selectedTime.time.interviewer_id) {
        return "Unavailable";
      }
    }
    return "Select Time";
  }

  //@ts-ignore
  const [selectedTime, setSelectedTime]: [
    {
      time?: TimeType;
    },
    any,
  ] = useState({});

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
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-10 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                      </th>
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
                          {time.date}
                        </td>
                        <td className="whitespace-nowrap px-10 py-4 text-sm text-gray-500">
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedTime.time!=null) {
                                if (
                                  selectedTime.time === time
                                ) {
                                  // un selecting
                                  setSelectedTime({});
                                } else {
                                  handleSecondClick(time);
                                }
                              } else {
                                setSelectedTime({
                                  time: time,
                                });
                              }
                            }}
                            className={classNames(
                              "block rounded-md  py-2 px-3 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                              buttonBG(time, selectedTime),
                            )}
                          >
                            {buttonText(time, selectedTime)}
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
