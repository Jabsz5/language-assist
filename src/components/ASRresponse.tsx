import { useState, useRef } from "react";
import volumeImg from "../assets/volume.png";

type Props = {
  setTranscript: (text: string) => void;
};

export default function ASRresponse({ setTranscript }: Props) {

  const [asrText, setAsrText] = useState("Click and speak Russian");
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = sendAudioToServer;

      recorder.start();

      setRecording(true);
      setAsrText("Listening...");

    } catch (err) {
      console.error(err);
      setAsrText("Microphone access denied.");
    }

  };

  const stopRecording = () => {

    if (!recording) return;

    setRecording(false);

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

  };

  const sendAudioToServer = async () => {

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {

      setAsrText("Transcribing...");

      const res = await fetch("http://localhost:5001/asr", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.success) {

        const transcript = data.text;

        setAsrText(transcript);

        // send transcript to parent page
        setTranscript(transcript);

      } else {
        setAsrText("ASR failed.");
      }

    } catch (error) {

      console.error(error);
      setAsrText("ASR connection error.");

    }

  };

  return (

    <section className="asr-section">

      {/* Start recording */}
      <img
        src={volumeImg}
        alt="Start ASR"
        className="volume-image clickable"
        onClick={startRecording}
      />

      {/* Stop recording */}
      {recording && (
        <button onClick={stopRecording}>
          Stop Recording
        </button>
      )}

      {/* Transcript */}
      <div className="asr-output">
        {asrText}
      </div>

    </section>

  );
}