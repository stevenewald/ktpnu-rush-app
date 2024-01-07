import CCTimeSelections from "@portal/CCTimeSelections";
import { useContext, useEffect, useState } from "react";
import { FirebaseContext } from "@framework/FirebaseContext";

import Swal from "sweetalert2";
export default function CoffeeChatContent(props: { userDBEntry: ProfileType }) {
  const firebase = useContext(FirebaseContext).firebase;
  const [times, setTimes]: [
    {
      time: string;
      location: string;
      date: string;
      interviewer_id: number;
      i: number;
      j: number;
    }[],
    any,
  ] = useState([]);

  if (window.innerWidth < 660) {
    Swal.fire({
      icon: "warning",
      title: "Please use a non-mobile device to select your coffee chat times.",
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    });
  }

  useEffect(() => {
    if (window.innerWidth < 660) return;
    if (!props.userDBEntry) return;
    if (props.userDBEntry.selected_cc_timeslot) return;
    firebase
      .functions()
      .httpsCallable("getCCTimes")()
      .then((res: any) => {
        setTimes(res.data);
      });
  }, [props.userDBEntry]);
  return (
    <div className="min-h-[70vh]">
      <div className="bg-gray-100 py-10 px-6 sm:pt-12 sm:pb-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Congrats, you moved on to coffee chats!
          </h2>
          {!props.userDBEntry?.selected_cc_timeslot && (
            <div>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                The coffee chats are meant to be a casual and relaxed two-way 20
                min chat for us to get to know you a bit better, and for you to
                get to know us! As such, the dress code is casual.
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Please select two timeslots for your coffee chats below.
              </p>
            </div>
          )}
          {!props.userDBEntry?.selected_cc_timeslot &&
            Object.keys(times).length == 0 && (
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Loading available timeslots...
            </p>
          )}
          {props.userDBEntry?.selected_cc_timeslot && (
            <>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {props.userDBEntry.selected_cc_timeslot}{" "}
                Please dress business casual.
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                If you cannot find your interviewer, reach out via phone. If you
                absolutely must reschedule, text your interviewer as soon as
                possible.
              </p>
            </>
          )}
        </div>
      </div>
      {Object.keys(times).length > 0 &&
        !props.userDBEntry?.selected_cc_timeslot && (
        <CCTimeSelections
          times={times}
          userDBEntry={props.userDBEntry}
          selectMethod={"coffee_chats"}
        />
      )}
    </div>
  );
}
