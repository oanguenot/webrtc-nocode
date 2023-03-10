export const NODES = {
  PEER: "rtc.peer",
  TRACK: "rtc.track",
  TURN: "rtc.turn",
  ENCODE: "action.encode",
  ADJUST: "action.adjust",
  CALL: "action.call",
  ANALYZE: "action.analyze", // for WebRTCMetrics
  WATCH: "rtc.watchrtc", // for WatchRTC
  WAIT: "action.wait",
  EVENTS: "event.*",
  ACTIONS: "action.*",
  READY: "event.ready",
  ICE: "event.ice",
  END: "action.end",
};

export const KIND = {
  AUDIO: "audio",
  VIDEO: "video",
};

export const KEYS = {
  NODE: "node",
  KIND: "kind",
  INFO: "info",
  FROM: "from",
  NAME: "name",
  NETWORK: "network",
  ACTIVE: "active",
  PREFERENCE: "preference",
  MAX_BITRATE: "maxBitrate",
  MAX_FRAMERATE: "maxFramerate",
  TRACK: "track",
  DELAY: "delay",
  PEER: "peer",
  ICESTATE: "iceState",
};

export const KEY_TYPE = {
  TEXT: "text",
  ENUM: "enum",
};
