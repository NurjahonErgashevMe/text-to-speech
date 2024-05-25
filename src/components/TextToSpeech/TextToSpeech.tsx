import {
  useState,
  useEffect,
  FC,
  ChangeEvent,
  LegacyRef,
  useRef,
} from "react";
import * as Selection from "selection-popover";
import useTextSelection from "../../hooks/useTextSelection";
import Button from "../Button/Button";
import styles from "./styles.module.css";

import StartIcon from "../../../public/icons/start.svg?react";
import StopIcon from "../../../public/icons/stop.svg?react";
import PauseIcon from "../../../public/icons/pause.svg?react";

type Props = {
  text: string;
};

const TextToSpeech: FC<Props> = ({ text }) => {
  const { range, ref } = useTextSelection();
  const textWrapperRef = useRef<HTMLDivElement>();
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null
  );
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [pitch, setPitch] = useState<number>(1);
  const [rate, setRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [playing, setPlaying] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);

  console.log(currentWordIndex, "state");

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(
      range ? range.toString() : ""
    );
    setUtterance(u);

    // Add an event listener to the speechSynthesis object to listen for the voiceschanged event
    synth.addEventListener("voiceschanged", () => {
      const voices: SpeechSynthesisVoice[] = synth.getVoices();
      setVoice(voices?.[0]);
    });

    return () => {
      synth.cancel();
      synth.removeEventListener("voiceschanged", () => {
        setVoice(null);
      });
    };
  }, [range, text]);

  const handlePlay = () => {
    setPlaying(true);

    const synth = window.speechSynthesis;

    if (isPaused) {
      synth.resume();
    } else {
      utterance!.voice = voice;
      utterance!.pitch = pitch;
      utterance!.rate = rate;
      utterance!.volume = volume;
      synth.speak(utterance!);
    }

    const words = range?.toString().split(/[\s\n]+/);
    let index = currentWordIndex === null ? 0 : currentWordIndex;

    utterance!.onboundary = (event) => {
      // eslint-disable-next-line no-control-regex
      const unprintableChars = /[\u0000-\u001F\u007F-\u009F\u2028\u2029\u200B-\u200D\uFEFF]/;

      console.log(words?.filter((i) => unprintableChars.test(i)));
      if (event.name === "word" && !unprintableChars.test(words![index])) {
        setCurrentWordIndex(() => index);
        console.log(words![index]);
        index++;
        console.log(index);
      } else {
        // console.log(event.name);
      }
    };

    utterance!.onend = () => {
      setPlaying(false);
      setCurrentWordIndex(null);
      console.log("end");
    };

    setIsPaused(false);
  };

  const handlePause = () => {
    setPlaying(false);

    const synth = window.speechSynthesis;
    setIsPaused(true);
    synth.pause();
  };

  const handleStop = () => {
    setPlaying(false);
    setCurrentWordIndex(null);

    const synth = window.speechSynthesis;
    setIsPaused(false);
    synth.cancel();
  };

  const handleVoiceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const voices = window.speechSynthesis.getVoices();
    const finded = voices.find((v) => v.name === event.target.value);

    setVoice(finded!);
  };

  const handlePitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPitch(parseFloat(event.target.value));
  };

  const handleRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRate(parseFloat(event.target.value));
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(event.target.value));
  };

  // function onboundaryHandler(event : ChangeEvent<HTMLDivElement>) {
  //   if (!textWrapperRef.current) {
  //     return;
  //   }

  //   const elem = textWrapperRef.current;

  //   const value = elem.textContent ?? "";
  //   const index = event.char;
  //   const word = getWordAt(value, index);
  //   const anchorPosition = getWordStart(value, index);
  //   const activePosition = anchorPosition + word.length;

  //   if (elem.setSelectionRange) {
  //     elem.setSelectionRange(anchorPosition, activePosition);
  //   } else {
  //     // const range = elem.createTextRange();
  //     // range.collapse(true);
  //     // range.moveEnd("character", activePosition);
  //     // range.moveStart("character", anchorPosition);
  //     // range.select();
  //   }
  // }

  // // Get the word of a string given the string and index
  // function getWordAt(str: string, pos: number) {
  //   // Perform type conversions.
  //   str = String(str);
  //   pos = Number(pos) >>> 0;

  //   // Search for the word's beginning and end.
  //   const left = str.slice(0, pos + 1).search(/\S+$/),
  //     right = str.slice(pos).search(/\s/);

  //   // The last word in the string is a special case.
  //   if (right < 0) {
  //     return str.slice(left);
  //   }

  //   // Return the word, using the located bounds to extract it from the string.
  //   return str.slice(left, right + pos);
  // }

  // // Get the position of the beginning of the word
  // function getWordStart(str: string, pos: number) {
  //   str = String(str);
  //   pos = Number(pos) >>> 0;

  //   const start = str.slice(0, pos + 1).search(/\S+$/);
  //   return start;
  // }

  return (
    <div>
      <label>
        Voice:
        <select value={voice?.name} onChange={handleVoiceChange}>
          {window.speechSynthesis.getVoices().map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name}
            </option>
          ))}
        </select>
      </label>

      <br />

      <label>
        Pitch:
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={pitch}
          onChange={handlePitchChange}
        />
      </label>

      <br />

      <label>
        Speed:
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={handleRateChange}
        />
      </label>
      <br />
      <label>
        Volume:
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
        />
      </label>

      <br />

      <br />
      <Selection.Root
        onOpenChange={(open) => {
          if (!open) {
            setPlaying(false);
            setIsPaused(false);
          }
        }}
      >
        <Selection.Trigger ref={ref as LegacyRef<HTMLDivElement>}>
          <div
            className={styles.textWrapper}
            ref={textWrapperRef as LegacyRef<HTMLDivElement>}
          >
            {text.split(/[\s\n]+/).map((item, index) => {
              const activeWord = index === currentWordIndex;
              return (
                <span key={index} className={activeWord ? styles.active : ""}>
                  {item}{" "}
                </span>
              );
            })}
          </div>
        </Selection.Trigger>
        <Selection.Portal>
          <Selection.Content className={styles.tooltip}>
            {playing ? (
              <Button onClick={handlePause}>
                <PauseIcon width={20} height={20} />
              </Button>
            ) : (
              <Button onClick={handlePlay}>
                <StartIcon width={20} height={20} />
              </Button>
            )}

            <Button onClick={handleStop}>
              <StopIcon width={20} height={20} />
            </Button>
            <span className={styles.arrow}>
              <svg
                width="10"
                height="5"
                viewBox="0 0 30 10"
                preserveAspectRatio="none"
                fill="#fff"
              >
                <polygon points="0,0 30,0 15,10"></polygon>
              </svg>
            </span>
          </Selection.Content>
        </Selection.Portal>
      </Selection.Root>
    </div>
  );
};

export default TextToSpeech;
