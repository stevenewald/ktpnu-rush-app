import {
  PaperClipIcon,
  BriefcaseIcon,
  ComputerDesktopIcon,
  PencilIcon,
} from "@heroicons/react/20/solid";
import { update, child, ref } from "firebase/database";
import Swal from 'sweetalert2';
export default function ApplicantDetails(props: {
  isAdmin:boolean;
  user: ProfileType;
  uid: string;
  database:any;
  swapTech:any;
}) {
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="flex justify-center pt-2 pb-6">
        <img
          src={props.user.PfpURL}
          className="w-1/4 object-cover aspect-square rounded-full"
        ></img>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Full name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {props.user.fullName}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Email Address</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {props.user.email}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Gender</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {props.user.gender}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Grade</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {props.user.grade}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Major</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {props.user.major}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">GPA</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {props.user.gpa}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Hometown</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {props.user.hometown}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Briefly describe your tech interest
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {props.user.techInterest}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Why do you want to join KTP?
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {props.user.whyKTP}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Links</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <ul
                role="list"
                className="divide-y divide-gray-200 rounded-md border border-gray-200"
              >
                <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                  <a className="flex w-0 flex-1 items-center">
                    <PaperClipIcon
                      className="h-5 w-5 flex-shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                    <span className="ml-2 w-0 flex-1 truncate">Resume</span>
                  </a>
                  <div className="ml-4 flex-shrink-0">
                    <a
                      href={props.user.ResumeURL}
                      target="_blank"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View
                    </a>
                  </div>
                </li>
                <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                  <div className="flex w-0 flex-1 items-center">
                    <BriefcaseIcon
                      className="h-5 w-5 flex-shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                    <span className="ml-2 w-0 flex-1 truncate">LinkedIn</span>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a
                      href={"https://linkedin.com/in/" + props.user.linkedinURL}
                      target="_blank"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View
                    </a>
                  </div>
                </li>
              </ul>
            </dd>
          </div>
          {props.isAdmin && !props.user.cs && (
            <button
              type="button"
              onClick={async () => {
                await update(
                  child(ref(props.database), `rush_users/${props.uid}`),
                  {cs:true}
                );
                props.swapTech();
                Swal.close();
              }}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <ComputerDesktopIcon
                className="-ml-0.5 h-5 w-5"
                aria-hidden="true"
              />
              Mark for technical interview
            </button>
          )}
          {props.isAdmin && props.user.cs && (
            <button
              type="button"
              onClick={async () => {
                await update(
                  child(ref(props.database), `rush_users/${props.uid}`),
                  {cs:false}
                );
                props.swapTech();
                Swal.close();
              }}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PencilIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Mark for non-technical interview
            </button>
          )}
        </dl>
      </div>
    </div>
  );
}
