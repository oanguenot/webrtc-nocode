import AudioTrack from "../components/objects/builtin/AudioTrack";
import VideoTrack from "../components/objects/builtin/VideoTrack";
import PeerConnection from "../components/objects/builtin/PeerConnection";
import Turn from "../components/objects/builtin/Turn";
import VideoEncodings from "../components/objects/actions/VideoEncodings";
import CallP2P from "../components/objects/actions/CallP2P";
import WebRTCMetrics from "../components/objects/actions/WebRTCMetrics";
import Ready from "../components/objects/events/Ready";
import End from "../components/objects/events/End";
import Step from "../components/objects/events/Step";
import Goto from "../components/objects/events/Goto";
import AudioEncodings from "../components/objects/actions/AudioEncodings";
import Waiting from "../components/objects/actions/Waiting";

const ObjectBuilder = {
  "Ready": Ready,
  //"Step":Step,
  //"Goto": Goto,
  "Waiting": Waiting,
  "PeerConnection": PeerConnection,
  "AudioTrack": AudioTrack,
  "VideoTrack": VideoTrack,
  "Turn": Turn,
  "AudioEncodings": AudioEncodings,
  "VideoEncodings": VideoEncodings,
  "WebRTCMetrics": WebRTCMetrics,
  "CallP2P": CallP2P,
  "End": End,
};

const RehydrateBuilder = {
  "event.ready": Ready,
  "Waiting": Waiting,
  "rtc.peer": PeerConnection,
  "AudioTrack": AudioTrack,
  "VideoTrack": VideoTrack,
  "Turn": Turn,
  "AudioEncodings": AudioEncodings,
  "VideoEncodings": VideoEncodings,
  "WebRTCMetrics": WebRTCMetrics,
  "action.call": CallP2P,
  "End": End,
}

export const build = (name, x, y) => {
  let Class = ObjectBuilder[name];
  if (Class) {
    return new Class(x, y);
  }
  console.log(`[builder] can't create object with name ${name}`);
};

export const rehydrateObject = (name, x, y) => {
  let Class = RehydrateBuilder[name];
  if(Class) {
    return new Class(x, y);
  }
  console.log(`[builder] can't rehydrate object with name ${name}`);
}

export const availableObjects = () => {
  return Object.keys(ObjectBuilder).map(
    (ClassReference) => ObjectBuilder[ClassReference]
  );
};
