import AudioTrack from "../components/objects/builtin/AudioTrack";
import VideoTrack from "../components/objects/builtin/VideoTrack";
import PeerConnection from "../components/objects/builtin/PeerConnection";
import Turn from "../components/objects/builtin/Turn";
import VideoEncodings from "../components/objects/actions/VideoEncodings";
import CallP2P from "../components/objects/actions/CallP2P";
import WebRTCMetrics from "../components/objects/external/WebRTCMetrics";
import Ready from "../components/objects/events/Ready";
import End from "../components/objects/events/End";
import AudioEncodings from "../components/objects/actions/AudioEncodings";
import Waiting from "../components/objects/actions/Waiting";
import ICEConnectionEvent from "../components/objects/events/ICEConnectionEvent";
import WatchRTC from "../components/objects/external/WatchRTC";
import AudioAdjust from "../components/objects/actions/AudioAdjust";
import VideoAdjust from "../components/objects/actions/VideoAdjust";
import RestartIce from "../components/objects/actions/RestartIce";
import SDPMunging from "../components/objects/builtin/SDPMunging";
import AudioMute from "../components/objects/actions/AudioMute";
import VideoConstraints from "../components/objects/actions/VideoConstraints";

const ObjectBuilder = {
  Ready: Ready,
  ICEConnectionEvent: ICEConnectionEvent,
  //"Step":Step,
  //"Goto": Goto,
  Waiting: Waiting,
  PeerConnection: PeerConnection,
  AudioTrack: AudioTrack,
  VideoTrack: VideoTrack,
  Turn: Turn,
  SDPMunging: SDPMunging,
  AudioEncodings: AudioEncodings,
  VideoEncodings: VideoEncodings,
  AudioAdjust: AudioAdjust,
  VideoAdjust: VideoAdjust,
  VideoConstraints: VideoConstraints,
  WatchRTC: WatchRTC,
  WebRTCMetrics: WebRTCMetrics,
  CallP2P: CallP2P,
  RestartIce: RestartIce,
  AudioMute: AudioMute,
  End: End,
};

const convertNodeNameToClass = (name, kind) => {
  const Nodes = {
    "event.ready": Ready,
    "event.ice": ICEConnectionEvent,
    "rtc.peer": PeerConnection,
    "rtc.watchrtc": WatchRTC,
    "rtc.analyze": WebRTCMetrics,
    "rtc.track": kind === "audio" ? AudioTrack : VideoTrack,
    "rtc.turn": Turn,
    "rtc.munging": SDPMunging,
    "action.wait": Waiting,
    "action.encode": kind === "audio" ? AudioEncodings : VideoEncodings,
    "action.adjust": kind === "audio" ? AudioAdjust : VideoAdjust,
    "action.constraints": kind === "audio" ? VideoConstraints : VideoConstraints,
    "action.call": CallP2P,
    "action.restart": RestartIce,
    "action.mute": kind === "audio" ? AudioMute : AudioMute,
    "action.end": End,
  };

  return Nodes[name];
};

export const build = (name, x, y) => {
  let Class = ObjectBuilder[name];
  if (Class) {
    return new Class(x, y);
  }
  console.log(`[builder] can't create object with name ${name}`);
};

export const rehydrateObject = (name, kind, x, y) => {
  let Class = convertNodeNameToClass(name, kind);
  if (Class) {
    return new Class(x, y);
  }
  console.log(`[builder] can't rehydrate object with name ${name}`);
};

export const availableObjects = () => {
  return Object.keys(ObjectBuilder).map(
    (ClassReference) => ObjectBuilder[ClassReference]
  );
};
