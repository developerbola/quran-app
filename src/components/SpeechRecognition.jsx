import { useState } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";


const SpeechRecognition = () => {
  const [value, setValue] = useState("");
  const [blocked, setBlocked] = useState(false);

  const onResult = (result) => {
    setValue(result);
  };

  const onError = (event) => {
    if (event.error === "not-allowed") {
      setBlocked(true);
    }
  };

  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult,
    onError,
  });

  const toggle = listening
    ? stop
    : () => {
        setBlocked(false);
        listen({ lang: "uz-UZ" });
      };

  return (
    <>
      <form>
        {supported ? (
          <>
            <p>
              Gapirish: Sura nomi, oyat raqami {"( Baqara surasi 36-oyat )"}
            </p>
            <label htmlFor="transcript">Transcript</label>
            <textarea
              id="transcript"
              name="transcript"
              placeholder="Waiting to take notes ..."
              value={value}
              rows={3}
              disabled
            />
            <button disabled={blocked} type="button" onClick={toggle}>
              {listening ? "To'xtatish" : "Tinglash"}
            </button>
            {blocked && (
              <p style={{ color: "red" }}>
                The microphone is blocked for this site in your browser.
              </p>
            )}
          </>
        ) : (
          <p>
            Kechirasiz sizning brauzeringiz ovozni matnga o'girish xususiyatini
            qo'llab quvvatlamaydi!
          </p>
        )}
      </form>
    </>
  );
};

export default SpeechRecognition;
