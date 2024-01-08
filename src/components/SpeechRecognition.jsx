import { useEffect, useState } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";
import ReactAudioPlayer from "react-audio-player";
import axios from "axios";

const SpeechRecognition = () => {
  const [value, setValue] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [data, setData] = useState([]);
  const [surah, setSurah] = useState();
  const [ayahs, setAyahs] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const handleEnded = () => {
    if (currentTrackIndex < ayahs.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  // Funksiyalar
  const onResult = (result) => {
    setValue(result);
  };

  const onError = (event) => {
    if (event.error === "not-allowed") {
      setBlocked(true);
    }
  };

  const onEnd = (e) => {
    // anything
  };

  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult,
    onError,
    onEnd,
  });

  function capitalizeFirstLetter(str) {
    return str.replace(/^\w/, (c) => c.toUpperCase());
  }

  const url = "https://api.alquran.cloud/v1/surah";
  const audioUrl = "https://api.alquran.cloud/v1/surah/";

  const fetchData = async () => {
    const res = await axios.get(url);
    const data = await res.data.data;
    setData(data);
  };

  const getAudioData = async (surah) => {
    setAyahs([]);
    const res = await axios.get(`${audioUrl}${surah.number}/ar.alafasy`);
    const data = await res.data.data;
    setSurah(data);
    setAyahs(data.ayahs);
  };

  useEffect(() => {
    setCurrentTrackIndex(0);
  }, [ayahs]);

  useEffect(() => {
    if (data.length) {
      data.filter((surah) => {
        if (
          capitalizeFirstLetter(value.split(" ")[0]).includes("Kavsar") &&
          surah.englishName.includes("Kawthar")
        ) {
          getAudioData(surah);
        } else if (
          capitalizeFirstLetter(value.split(" ")[0]).includes("Fotiha") &&
          surah.englishName.includes("Faatiha")
        ) {
          getAudioData(surah);
        } else if (
          capitalizeFirstLetter(value.split(" ")[0]).includes("Imron") &&
          surah.englishName.includes("Imraan")
        ) {
          getAudioData(surah);
        } else if (
          surah.englishName.includes(capitalizeFirstLetter(value.split(" ")[0]))
        ) {
          getAudioData(surah);
        }
      });
    }
  }, [data, value]);

  // Eshitish va To'xtatishni boshqarish
  const toggle = listening
    ? () => {
        stop();
        fetchData();
      }
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
      <div>
        <h1>{surah ? surah.englishName : "Loading"}</h1>
        <ReactAudioPlayer
          className="react-audio-player"
          src={ayahs.length ? ayahs[currentTrackIndex].audio : ""}
          controls
          autoPlay
          onEnded={handleEnded}
        />
      </div>
    </>
  );
};

export default SpeechRecognition;
