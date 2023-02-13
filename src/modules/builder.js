import AudioTrack from "../components/objects/AudioTrack";
import VideoTrack from "../components/objects/VideoTrack";
import PeerConnection from "../components/objects/PeerConnection";
import Turn from "../components/objects/Turn";
import VideoEncodings from "../components/objects/VideoEncodings";
import CallP2P from "../components/objects/CallP2P";
import WebRTCMetrics from "../components/objects/WebRTCMetrics";
import Ready from "../components/objects/basic/Ready";
import End from "../components/objects/basic/End";
import Step from "../components/objects/basic/Step";
import Goto from "../components/objects/basic/Goto";
import AudioEncodings from "../components/objects/AudioEncodings";
import Waiting from "../components/objects/basic/Waiting";

const ObjectBuilder = {
  "Ready": Ready,
  "Step":Step,
  "Goto": Goto,
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

const getClassFromName = (name) => {
  return ObjectBuilder[name];
};
export const build = (name, x, y) => {
  let Class = getClassFromName(name);
  if (Class) {
    return new Class(x, y);
  }
  console.log(`[builder] can't create object with name ${name}`);
};

export const availableObjects = () => {
  return Object.keys(ObjectBuilder).map(
    (ClassReference) => ObjectBuilder[ClassReference]
  );
};
