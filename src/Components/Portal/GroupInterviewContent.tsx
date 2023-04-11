import TimeSelections from "@portal/TimeSelections";
import { useEffect, useState, useContext } from "react";
import { FirebaseContext } from "@framework/FirebaseContext";
export default function GroupInterviewContent(props: { userDBEntry: ProfileType }) {
  const firebase = useContext(FirebaseContext).firebase;
  const [times, setTimes]: [{time:string, i:number,j:number,location:string}[], any] = useState([]);
  useEffect(() => {
    if(!props.userDBEntry) return;
    if(props.userDBEntry.selected_gi_timeslot) return;
    firebase
      .functions()
      .httpsCallable("getGITimes")()
      .then((res: any) => {
        setTimes(res.data);
      });
  }, [props.userDBEntry]);
  return (
    <div className="min-h-[70vh]">
      <div className="bg-gray-100 py-10 px-6 sm:pt-12 sm:pb-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Congrats, you moved on to group interviews!
          </h2>
          {!props.userDBEntry?.selected_gi_timeslot && (
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Group interviews will take place in Tech M345. You'll have the
            opportunity to meet many KTP members, learn more about our
            organization, and hopefully move on to the next round. The dress
            code is business casual.
            </p>
          )}
          {!props.userDBEntry?.selected_gi_timeslot &&
            Object.keys(times).length == 0 && (
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Loading available timeslots...
              </p>
            )}
          {props.userDBEntry?.selected_gi_timeslot && (
            <>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {props.userDBEntry.selected_gi_timeslot} Please dress business
                casual.
              </p>
            </>
          )}
        </div>
      </div>
      {Object.keys(times).length > 0 &&
        !props.userDBEntry?.selected_gi_timeslot && (
          <TimeSelections times={times} userDBEntry={props.userDBEntry} selectMethod={"group_interviews"}/>
        )}
    </div>
  );
}
