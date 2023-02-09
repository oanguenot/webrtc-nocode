import AudioTrack from "../components/objects/AudioTrack";
import VideoTrack from "../components/objects/VideoTrack";
import PeerConnection from "../components/objects/PeerConnection";
import Turn from "../components/objects/Turn";
import VideoEncodings from "../components/objects/VideoEncodings";
import Sig from "../components/objects/Sig";
import WebRTCMetrics from "../components/objects/WebRTCMetrics";
import Ready from "../components/objects/basic/Ready";
import End from "../components/objects/basic/End";
import Step from "../components/objects/basic/Step";
import Goto from "../components/objects/basic/Goto";
import AudioEncodings from "../components/objects/AudioEncodings";
import Waiting from "../components/objects/basic/Waiting";

const ObjectBuilder = {
  Ready,
  Step,
  Goto,
  Waiting,
  PeerConnection,
  AudioTrack,
  VideoTrack,
  Turn,
  AudioEncodings,
  VideoEncodings,
  WebRTCMetrics,
  Sig,
  End,
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
