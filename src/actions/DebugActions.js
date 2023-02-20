export const DEBUG_ACTIONS = {
  ADD_TRACE: "ADD_TRACE",
};

export const addLog = (tag, level, message, object, dispatch) => {
  const fctLevel = {
    log: console.log,
    warning: console.warn,
    error: console.error,
  };

  const timestamp = new Date().toJSON();

  if (level in fctLevel) {
    fctLevel[level](`${timestamp} | ${tag} - ${message}`, object);
  }

  dispatch({
    type: DEBUG_ACTIONS.ADD_TRACE,
    payload: { timestamp, tag, level, message, object },
  });
};
