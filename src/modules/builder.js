import Microphone from "../components/objects/Microphone";
import Camera from "../components/objects/Camera";
import User from "../components/objects/User";
import Turn from "../components/objects/Turn";
import VideoEncodings from "../components/objects/VideoEncodings";
import Sig from "../components/objects/Sig";
import WebRTCMetrics from "../components/objects/WebRTCMetrics";
import Start from "../components/objects/basic/Start";
import End from "../components/objects/basic/End";

const ObjectBuilder = {
  Start,
  User,
  Microphone,
  Camera,
  Turn,
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
