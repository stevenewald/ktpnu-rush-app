import TimeSelections from "@portal/TimeSelections";
import { useEffect, useState, useContext } from "react";
import { FirebaseContext } from "@framework/FirebaseContext";
import Swal from 'sweetalert2';
export default function IndivInterviewContent(props:{userDBEntry:ProfileType}) {
  const firebase = useContext(FirebaseContext).firebase;
  const [times, setTimes]: [{time:string, i:number,j:number,location:string}[], any] = useState([]);
  useEffect(() => {
    if(!props.userDBEntry) return;
    if(props.userDBEntry.selected_indiv_timeslot) return;
    firebase
      .functions()
      .httpsCallable("getIndivTimes")({cs: props.userDBEntry.cs})
      .then((res: any) => {
        setTimes(res.data);
        if(res.data.length==0) {
          Swal.fire({icon:'error',title:'No more available timeslots',text:'Please contact Damien at 847-868-6251 or Alice at 650-645-0769 to let them know. Thank you!'})
        }
      });
  }, [props.userDBEntry]);
  return (
    <div className="min-h-[70vh]">
      <div className="bg-gray-100 py-10 px-6 sm:pt-12 sm:pb-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Congrats, you moved on to individual interviews!
          </h2>
          {!props.userDBEntry?.selected_indiv_timeslot && (
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The individual interviews are the final round in the KTP rush process. Please select a timeslot for your final interview.
            </p>
          )}
          {!props.userDBEntry?.selected_indiv_timeslot &&
            Object.keys(times).length == 0 && (
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Loading available timeslots...
              </p>
            )}
          {props.userDBEntry?.selected_indiv_timeslot && (
            <>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {props.userDBEntry.selected_indiv_timeslot} Please dress business
                casual.
              </p>
            </>
          )}
        </div>
      </div>
      {Object.keys(times).length > 0 &&
        !props.userDBEntry?.selected_indiv_timeslot && (
          <TimeSelections times={times} userDBEntry={props.userDBEntry} selectMethod={"indiv_interviews"}/>
        )}
    </div>
  );
}
