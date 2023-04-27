export const configuration = {
  refreshEvery: 750, // Optional. Refresh every 3 seconds
  startAfter: 10, // Optional. Start collecting stats after 5 seconds
  verbose: false, // Optional. Display verbose logs or not.
};

export const addCustomEvent = (
  win,
  name,
  category,
  message,
  at,
  ssrc,
  data,
  ended
) => {
  if (win && win.metrics) {
    const probe = win.metrics.probes[0];
    probe.addCustomEvent(name, category, message, at, ssrc, data, ended);
  }
};

export const addCustomEventWithObject = ({
  win,
  name,
  category,
  message,
  timestamp,
  ssrc,
  data,
  ended,
}) => {
  if (win && win.metrics) {
    const probe = win.metrics.probes[0];
    probe.addCustomEvent(
      name,
      category,
      message,
      new Date(timestamp),
      ssrc,
      data,
      ended
    );
  }
};
