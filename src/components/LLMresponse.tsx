import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  transcript: string;
};

export default function LLMresponse({ transcript }: Props) {

  const [llmText, setLlmText] = useState("");

  useEffect(() => {

    if (!transcript) return;

    const runLLM = async () => {

      try {

        setLlmText("Generating explanation...");

        const res = await fetch("http://localhost:5001/llm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ text: transcript })
        });

        const data = await res.json();
        // what does this look like
        console.log("LLM response:", data);
        if (data.success) {
          setLlmText(data.result);
        } else {
          setLlmText("LLM failed.");
        }

      } catch (err) {
        console.error(err);
        setLlmText("LLM connection error.");
      }

    };

    runLLM();

  }, [transcript]);

  return (
    <section className="llm-response-section">

      <h3>Language Tutor</h3>

      <div className="llm-response">
        <ReactMarkdown>{llmText}</ReactMarkdown>
      </div>

    </section>
  );
}