import { useEffect, useState } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";
import ReactAudioPlayer from "react-audio-player";
import axios from "axios";
import { Box, Button, Typography, TextareaAutosize } from "@mui/material";
const SpeechRecognition = () => {
  const [value, setValue] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [data, setData] = useState([]);
  const [surah, setSurah] = useState();
  const [ayahs, setAyahs] = useState([]);
  const [speechEnd, setSpeechEnd] = useState(false);
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

  const onSpeechEnd = () => {
    stop();
    setListening(false);
    fetchData();
    setSpeechEnd(true);
  };

  const { listen, listening, stop, supported, setListening } =
    useSpeechRecognition({
      onResult,
      onError,
      onSpeechEnd,
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
      <Box
        sx={{
          bgcolor: "#ffffff30",
          height: "500px",
          width: "700px",
          borderRadius: "10px",
          backdropFilter: "blur(10px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {supported ? (
          <>
            <Typography>Gapirish: Sura nomi {"( Baqara surasi )"}</Typography>
            <TextareaAutosize
              value={value}
              disabled
              style={{
                resize: "none",
                height: "230px",
                width: "500px",
                borderRadius: "10px",
                background: "#ffffff30",
                border: "1px solid #ffffff30",
                color: "#fff",
                padding: "20px",
                fontSize: "1.3rem",
                textTransform: "capitalize"
              }}
            />
            <Button
              disabled={blocked}
              type="button"
              onClick={toggle}
              variant="outlined"
              sx={{
                color: "#fff",
                p: "10px 20px",
                borderRadius: "20px",
              }}
            >
              {listening ? "To'xtatish" : "Tinglash"}
            </Button>
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
        <Box>
          <Typography mb={"10px"} fontSize={"1.2rem"}>
            {surah ? surah.englishName : "Surah Name"}
          </Typography>
          <ReactAudioPlayer
            className="react-audio-player"
            src={ayahs.length ? ayahs[currentTrackIndex].audio : ""}
            controls
            autoPlay={speechEnd}
            onEnded={handleEnded}
          />
        </Box>
      </Box>
    </>
  );
};

export default SpeechRecognition;
