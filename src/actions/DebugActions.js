export const DEBUG_ACTIONS = {
  ADD_TRACE: "ADD_TRACE",
  ADD_GROUP_TO_TIMELINE: "ADD_GROUP_TO_TIMELINE",
  ADD_EVENT_TO_TIMELINE: "ADD_EVENT_TO_TIMELINE",
  ADD_PERIOD_TO_TIMELINE: "ADD_PERIOD_TO_TIMELINE",
  RESET_TIMELINE: "RESET_TIMELINE",
  SET_TASK_NUMBER: "SET_TASK_NUMBER",
  INCREMENT_TASK_DONE: "INCREMENT_TASK_DONE",
};

export const addGroupToTimeline = (name, id, dispatch) => {
  dispatch({
    type: DEBUG_ACTIONS.ADD_GROUP_TO_TIMELINE,
    payload: { name, id },
  });
};

export const addEventToTimeline = (name, start, groupId, dispatch) => {
  dispatch({
    type: DEBUG_ACTIONS.ADD_EVENT_TO_TIMELINE,
    payload: { name, start, groupId },
  });
};

export const addPeriodToTimeline = (content, start, end, group, dispatch) => {
  dispatch({
    type: DEBUG_ACTIONS.ADD_PERIOD_TO_TIMELINE,
    payload: { content, start, end, group },
  });
};

export const resetTimeline = (dispatch) => {
  dispatch({
    type: DEBUG_ACTIONS.RESET_TIMELINE,
    payload: {},
  });
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

export const setTaskNumber = (number, dispatch) => {
  dispatch({
    type: DEBUG_ACTIONS.SET_TASK_NUMBER,
    payload: { number },
  });
};

export const incrementTaskDone = (dispatch) => {
  dispatch({
    type: DEBUG_ACTIONS.INCREMENT_TASK_DONE,
    payload: {},
  });
};
