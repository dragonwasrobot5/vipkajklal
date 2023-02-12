//右侧阅读选项面板
import React from "react";
import "./textToSpeech.css";
import { TextToSpeechProps, TextToSpeechState } from "./interface";
import { Trans } from "react-i18next";
import OtherUtil from "../../utils/otherUtil";

class TextToSpeech extends React.Component<
  TextToSpeechProps,
  TextToSpeechState
> {
  constructor(props: TextToSpeechProps) {
    super(props);
    this.state = {
      isSupported: false,
      isAudioOn: false,
      voices: [],
    };
  }
  componentDidMount() {
    if ("speechSynthesis" in window) {
      this.setState({ isSupported: true });
    }
    if (this.state.isAudioOn) {
      window.speechSynthesis && window.speechSynthesis.cancel();
      this.setState({ isAudioOn: false });
    }
  }
  handleChangeAudio = () => {
    if (this.state.isAudioOn) {
      window.speechSynthesis.cancel();
      this.setState({ isAudioOn: false });
    } else {
      const setSpeech = () => {
        return new Promise(function (resolve, reject) {
          let synth = window.speechSynthesis;
          let id;

          id = setInterval(() => {
            if (synth.getVoices().length !== 0) {
              resolve(synth.getVoices());
              clearInterval(id);
            }
          }, 10);
        });
      };

      let s = setSpeech();
      s.then((voices) => {
        this.setState({ voices }, () => {
          this.setState({ isAudioOn: true }, () => {
            this.handleAudio();

            document
              .querySelector("#text-speech-speed")!
              .children[
                ["0.5", "0.75", "1", "1.25", "1.5", "2"].indexOf(
                  OtherUtil.getReaderConfig("voiceSpeed") || "1"
                )
              ].setAttribute("selected", "selected");
            console.log(document.querySelector("#text-speech-voice"));
            document
              .querySelector("#text-speech-voice")!
              .children[OtherUtil.getReaderConfig("voiceIndex")].setAttribute(
                "selected",
                "selected"
              );
          });
        });
      });
    }
  };
  handleAudio = () => {
    const currentLocation = this.props.currentEpub.rendition.currentLocation();
    const cfibase = currentLocation.start.cfi
      .replace(/!.*/, "")
      .replace("epubcfi(", "");
    const cfistart = currentLocation.start.cfi
      .replace(/.*!/, "")
      .replace(/\)/, "");
    const cfiend = currentLocation.end.cfi.replace(/.*!/, "").replace(/\)/, "");
    const cfiRange = `epubcfi(${cfibase}!,${cfistart},${cfiend})`;
    this.props.currentEpub.getRange(cfiRange).then((range: any) => {
      let text = range.toString();
      text = text
        .replace(/\s\s/g, "")
        .replace(/\r/g, "")
        .replace(/\n/g, "")
        .replace(/\t/g, "")
        .replace(/\f/g, "");
      this.handleSpeech(
        text,
        OtherUtil.getReaderConfig("voiceIndex") || 0,
        OtherUtil.getReaderConfig("voiceSpeed") || 1
      );
    });
  };
  handleSpeech = (text: string, voiceIndex: number, speed: number) => {
    var msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.voice = window.speechSynthesis.getVoices()[voiceIndex];
    msg.rate = speed;
    window.speechSynthesis.speak(msg);
    msg.onend = (event) => {
      console.log(
        "Utterance has finished being spoken after " +
          event.elapsedTime +
          " milliseconds."
      );
      if (!(this.state.isAudioOn && this.props.isReading)) {
        return;
      }
      this.props.currentEpub.rendition.next().then(() => {
        this.handleAudio();
      });
    };
  };

  render() {
    return (
      <>
        {this.state.isSupported ? (
          <>
            <div className="single-control-switch-container">
              <span className="single-control-switch-title">
                <Trans>Turn on audio</Trans>
              </span>

              <span
                className="single-control-switch"
                onClick={() => {
                  if (this.props.locations) {
                    this.handleChangeAudio();
                  } else {
                    this.props.handleMessage("Audio is not ready yet");
                    this.props.handleMessageBox(true);
                  }
                }}
                style={
                  this.props.locations
                    ? this.state.isAudioOn
                      ? { background: "rgba(46, 170, 220)" }
                      : {}
                    : { opacity: 0.5 }
                }
              >
                <span
                  className="single-control-button"
                  style={
                    this.state.isAudioOn
                      ? {
                          transform: "translateX(20px)",
                          transition: "transform 0.5s ease",
                        }
                      : {
                          transform: "translateX(0px)",
                          transition: "transform 0.5s ease",
                        }
                  }
                ></span>
              </span>
            </div>
            {this.state.isAudioOn && this.state.voices.length > 0 && (
              <div
                className="setting-dialog-new-title"
                style={{
                  marginLeft: "20px",
                  width: "88%",
                  marginTop: "20px",
                }}
              >
                <Trans>Voice</Trans>
                <select
                  name=""
                  className="lang-setting-dropdown"
                  id="text-speech-voice"
                  onChange={(event) => {
                    OtherUtil.setReaderConfig("voiceIndex", event.target.value);
                    window.speechSynthesis.cancel();
                  }}
                >
                  {this.state.voices.map((item, index) => {
                    return (
                      <option value={index} className="lang-setting-option">
                        {item.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            {this.state.isAudioOn && (
              <div
                className="setting-dialog-new-title"
                style={{ marginLeft: "20px", width: "88%" }}
              >
                <Trans>Speed</Trans>
                <select
                  name=""
                  id="text-speech-speed"
                  className="lang-setting-dropdown"
                  onChange={(event) => {
                    OtherUtil.setReaderConfig("voiceSpeed", event.target.value);
                    window.speechSynthesis.cancel();
                  }}
                >
                  <option value={0.5} className="lang-setting-option">
                    0.5
                  </option>
                  <option value={0.75} className="lang-setting-option">
                    0.75
                  </option>
                  <option value={1} className="lang-setting-option">
                    1
                  </option>
                  <option value={1.25} className="lang-setting-option">
                    1.25
                  </option>
                  <option value={1.5} className="lang-setting-option">
                    1.5
                  </option>
                  <option value={2} className="lang-setting-option">
                    2
                  </option>
                </select>
              </div>
            )}
          </>
        ) : null}
      </>
    );
  }
}

export default TextToSpeech;
