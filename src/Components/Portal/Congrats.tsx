import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import ReactAudioPlayer from "react-audio-player";
import { useState } from "react";
import Swal from "sweetalert2";
import "animate.css";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Congrats() {
  const { width, height } = useWindowSize();
  const [start, startAudio] = useState(false);
  const [envelopeInvisible, setEnvelopeInvisible] = useState(false);
  return (
    <>
      <div
        className={classNames(
          envelopeInvisible ? "opacity-0" : "",
          "flex w-screen h-screen justify-center items-center ease-in-out duration-1000 transitions-all"
        )}
      >
        <div
          onClick={() => {
            document.getElementById("wrapper").classList.add("started");
            startAudio(true);
            setTimeout(() => {
              setEnvelopeInvisible(true);
            }, 8000);
            setTimeout(() => {
              Swal.fire({
                title: "Bid Decision",
                html: "On behalf of KTP Exec, it is with great pleasure to extend our warmest congratulations to you for being offered a bid to join Kappa Theta Pi. We were impressed by your commitment, enthusiasm, and values during the rush process, and we are thrilled to have you join our organization.\
<br><br> \
                As a member of Kappa Theta Pi, you will have the opportunity to grow as a person and a leader, build lifelong friendships, and make a positive impact on the community. We believe that you will make an excellent addition to our organization and we look forward to seeing you thrive as a KTP member.\
                <br><br>\
                Once again, congratulations on your bid acceptance, and we cannot wait to officially welcome you into our organization!",
                confirmButtonText: "I'm ready, I accept the bid!",
                cancelButtonText: "No, I need time",
                showCancelButton: true,
                allowEnterKey:false,
                allowEscapeKey:false,
                allowOutsideClick:false,
                showClass: {
                  popup: "animate__animated animate__fadeIn",
                },
                hideClass: {
                  popup: "animate__animated animate__fadeOut",
                },
              }).then((res) => {
                if (res.isConfirmed) {
                  Swal.fire({
                    icon: "success",
                    title: "Welcome to KTP!",
                    text: "To confirm your bid, create an account on the member portal. You will be emailed instructions within the next 24 hours.",
                      showConfirmButton: false,
                  }).then(() => {
                    window.location.href = "https://ktpnu.com/signup";
                  });
                } else {
                  Swal.fire({
                    title: "We understand",
                    html: "We know that this is a big decision, and we are happy to give you time to think about it.<br><br>Please reach out to us if you have any questions or concerns. Let us know by 2pm on Saturday with your decision at rush@ktpnu.com.<br><br>We hope you'll join us for our next pledge class, and if not, thank you for joining us for winter rush 2024! We hope you enjoyed it as much as we did.",
                    confirmButtonText: "I'll let you know soon!",
                  }).then(() => {
                    window.location.href = "https://ktpnu.com";
                  });
                }
              });
            }, 9500);
          }}
          id="wrapper"
          className="wrapper"
        >
          <div className="lid one"></div>
          <div className="lid two"></div>
          <div className="envelope" id="envelope"></div>
          <div className="letter">
            <p>Welcome to KTP!</p>
          </div>
        </div>
      </div>
      {start && (
        <>
          <ReactAudioPlayer
            src="https://rushktp.s3.us-east-2.amazonaws.com/dancingqueen.mp3#t=00:00:02"
            autoPlay
          />
          <Confetti
            width={width}
            height={height}
            recycle={true}
            numberOfPieces={250}
          />
        </>
      )}
    </>
  );
}
