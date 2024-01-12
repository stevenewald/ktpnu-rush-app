export default function Dropped() {
  return (
    <>
      <div className="bg-gray-100 py-10 px-6 sm:pt-12 sm:pb-6 lg:px-8 h-screen">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Application Update
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Thank you for your interest in KTP and we appreciate your enthusiasm
            and dedication through the rush process. Unfortunately we are unable
            to accept you into the next round of the process, but we wish you
            luck on your endeavors.

            We received record amounts of interest in KTP rush and due to the
            amount of applicants, we are unable to provide feedback for
            applicants dropped after Networking Night. In general, successful
            applicants are often charismatic and well spoken, can speak
            excitedly about their interest in tech, and have been active in the
            Northwestern community. This does not mean that you do not fit the
            criteria, but it does mean that we were not able to see these
            attributes in our initial meeting. We encourage you to work on your
            “elevator pitch” and reapply during the next rush cycle in the
            spring!
          </p>
          <p className="mt-6 text-md leading-8 text-gray-500">
            If you would like feedback on your performance, please fill out{" "}
            <a
              className="mt-6 text-md leading-8 text-gray-600 underline"
              href="https://forms.gle/49EvwqL5qB44Tu7j9"
              target="_blank"
            >
              this form
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
