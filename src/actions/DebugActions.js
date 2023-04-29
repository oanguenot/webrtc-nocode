import { execute, resetExecute } from "../modules/playground";

export const DEBUG_ACTIONS = {
  ADD_TRACE: "ADD_TRACE",
  SET_TASK_NUMBER: "SET_TASK_NUMBER",
  INCREMENT_TASK_DONE: "INCREMENT_TASK_DONE",
  ADD_POINTS_IN_GRAPH: "ADD_POINTS_IN_GRAPH",
  RESET: "RESET",
  RUN: "RUN",
  TERMINATE: "TERMINATE",
  ADD_API_IN_GRAPH: "ADD_API_IN_GRAPH",
};

export const addLog = (tag, level, message, object) => {
  const fctLevel = {
    log: console.log,
    warning: console.warn,
    error: console.error,
  };

  const timestamp = new Date().toJSON();

  if (level in fctLevel) {
    fctLevel[level](`${timestamp} | ${tag} - ${message}`, object);
  }
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

export const addPointsInGraph = (peerId, passthrough, timestamp, dispatch) => {
  dispatch({
    type: DEBUG_ACTIONS.ADD_POINTS_IN_GRAPH,
    payload: { peerId, passthrough, timestamp },
  });
};

export const run = (nodes, dispatch) => {
  dispatch({
    type: DEBUG_ACTIONS.RUN,
    payload: {},
  });

  execute(nodes, dispatch);
};

export const terminate = (tickets, dispatch) => {
  dispatch({
    type: DEBUG_ACTIONS.TERMINATE,
    payload: { tickets },
  });
};

export const reset = async (dispatch) => {
  resetExecute();
  dispatch({
    type: DEBUG_ACTIONS.RESET,
    payload: {},
  });
};

export const addGraphEvent = async (name, timestamp, dispatch) => {
  dispatch({
    type: DEBUG_ACTIONS.ADD_API_IN_GRAPH,
    payload: { name, timestamp },
  });
};
