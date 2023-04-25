export const NODES = {
  PEER: "rtc.peer",
  TRACK: "rtc.track",
  TURN: "rtc.turn",
  MUNGING: "rtc.munging",
  ENCODE: "action.encode",
  ADJUST: "action.adjust",
  CONSTRAINTS: "action.constraints",
  CALL: "action.call",
  MUTE: "action.mute",
  RESTARTICE: "action.restart",
  ANALYZE: "rtc.analyze", // for WebRTCMetrics
  WATCH: "rtc.watchrtc", // for WatchRTC
  WAIT: "action.wait",
  EVENTS: "event.*",
  ACTIONS: "action.*",
  READY: "event.ready",
  ICE: "event.ice",
  END: "action.end",
  REPLACE: "action.replace",
};

export const KIND = {
  AUDIO: "audio",
  VIDEO: "video",
};

export const KEYS = {
  NODE: "node",
  KIND: "kind",
  INFO: "info",
  CALL: "call",
  FROM: "from",
  NAME: "name",
  NETWORK: "network",
  ACTIVE: "active",
  CONSTRAINTS: "constraints",
  PREFERENCE: "preference",
  MAX_BITRATE: "maxBitrate",
  FRAMERATE: "framerate",
  MAX_FRAMERATE: "maxFramerate",
  RESOLUTION: "resolution",
  CHANNEL_COUNT: "channelCount",
  TRACK: "track",
  DELAY: "delay",
  PEER: "peer",
  CALLER: "caller",
  RECIPIENT: "recipient",
  ICESTATE: "iceState",
  TURN: "turn",
  STUNURL: "stunurl",
  TURNURL: "turnurl",
  TURNTOKEN: "turntoken",
  OPERATION: "operation",
  METHOD: "method",
  INBOUND: "inbound",
  OUTBOUND: "outbound",
  TRANSPORT: "transport",
};

export const KEY_TYPE = {
  TEXT: "text",
  ENUM: "enum",
  SELECT: "select",
  TEXTAREA: "textarea",
};
