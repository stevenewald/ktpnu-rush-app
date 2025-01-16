import TimeSelections from "@portal/TimeSelections";
import { useContext, useEffect, useState } from "react";
import { FirebaseContext } from "@framework/FirebaseContext";
export default function GroupInterviewContent(
  props: { userDBEntry: ProfileType },
) {
  const firebase = useContext(FirebaseContext).firebase;
  const [groupTimes, setGroupTimes]: [
    { time: string; i: number; j: number; location: string }[],
    any,
  ] = useState([]);
  const [socialTimes, setSocialTimes]: [
    { time: string; i: number; j: number; location: string }[],
    any,
  ] = useState([]);
  useEffect(() => {
    if (!props.userDBEntry) return;
    if (!props.userDBEntry.selected_gi_timeslot) {
      // TODO: async?
      firebase
        .functions()
        .httpsCallable("getGITimes")({ type: "group" })
        .then((res: any) => {
          setGroupTimes(res.data);
        });
    }
    if (!props.userDBEntry.selected_social_timeslot) {
      firebase
        .functions()
        .httpsCallable("getGITimes")({ type: "social" })
        .then((res: any) => {
          setSocialTimes(res.data);
        });
    }
  }, [props.userDBEntry]);
  return (
    <div className="min-h-[70vh] flex flex-col items-center">
      <div className="bg-gray-100 py-10 px-6 sm:pt-12 sm:pb-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Congrats, you moved on to social and group interviews!
          </h2>
          {(!props.userDBEntry?.selected_gi_timeslot ||
            !props.userDBEntry?.selected_social_timeslot) && (
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Group interviews for KTP will be in Tech M345, where you'll
              collaborate with other applicants on challenging problems. Please bring a laptop to 
              group interviews. Socials are in Tech F281, offering a chance to meet 
              many members and learn more about the organization. Dress code is 
              business casual for both events.
            </p>
          )}
          {(!props.userDBEntry?.selected_gi_timeslot) &&
            Object.keys(groupTimes).length == 0 && (
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Loading available timeslots...
            </p>
          )}
          {(!props.userDBEntry?.selected_social_timeslot &&
            props.userDBEntry.selected_gi_timeslot) &&
            Object.keys(socialTimes).length == 0 && (
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Loading available timeslots...
            </p>
          )}
          {(props.userDBEntry?.selected_gi_timeslot &&
            props.userDBEntry?.selected_social_timeslot) && (
            <>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {props.userDBEntry.selected_social_timeslot}
                <br></br>
                {props.userDBEntry.selected_gi_timeslot}
                <br></br>
                Please dress business casual.
              </p>
            </>
          )}
        </div>
      </div>
      <div className="flex text-center mt-6">
        {Object.keys(socialTimes).length > 0 &&
          !props.userDBEntry?.selected_social_timeslot && (
          <TimeSelections
            times={socialTimes}
            userDBEntry={props.userDBEntry}
            selectMethod={"social_interviews"}
            name={"Social Interviews (Wednesday)"}
          />
        )}
        {Object.keys(groupTimes).length > 0 &&
          !props.userDBEntry?.selected_gi_timeslot && (
          <TimeSelections
            times={groupTimes}
            userDBEntry={props.userDBEntry}
            selectMethod={"group_interviews"}
            name={"Group Interviews (Thursday)"}
          />
        )}
      </div>
    </div>
  );
}
