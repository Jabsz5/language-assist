import "../styles/LLMASR.css";
import { useState } from "react";

import LLMASRmain from "../components/ASRresponse";
import LLMresponse from "../components/LLMresponse";


export default function LLMASR() {

  const [transcript, setTranscript] = useState("");

  return (
    <div className="llmasr-page">

      <main>

        <header>
          <h1>LLM + ASR</h1>
        </header>

        {/* ASR Recorder */}
        <LLMASRmain setTranscript={setTranscript} />

        {/* LLM Tutor */}
        <LLMresponse transcript={transcript} />

      </main>

    </div>
  );
}