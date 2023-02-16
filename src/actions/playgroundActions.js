import {execute, rehydrateDOM, rehydrateModel} from "../modules/playground";
import {clearData, loadData, saveData} from "../modules/storage";

export const PLAYGROUND_ACTIONS = {
  PLAYGROUND_RUN_IN_PROGRESS: "PLAYGROUND_RUN_IN_PROGRESS",
  PLAYGROUND_RUN_SUCCESS: "PLAYGROUND_RUN_SUCCESS",
  PLAYGROUND_RUN_FAILED: "PLAYGROUND_RUN_FAILED",
  PLAYGROUND_LOAD_SUCCESS: "PLAYGROUND_LOAD_SUCCESS",
  PLAYGROUND_WRITE_SUCCESS: "PLAYGROUND_WRITE_SUCCESS",
  PLAYGROUND_READ_SUCCESS: "PLAYGROUND_READ_SUCCESS",
};

export const run = (nodes, dispatch) => {
  dispatch({
    type: PLAYGROUND_ACTIONS.PLAYGROUND_RUN_IN_PROGRESS,
    payload: {},
  });

  execute(nodes).then(() => {
    dispatch({
      type: PLAYGROUND_ACTIONS.PLAYGROUND_RUN_SUCCESS,
      payload: {},
    });
  }).catch((err) => {
    dispatch({
      type: PLAYGROUND_ACTIONS.PLAYGROUND_RUN_FAILED,
      payload: {},
    });
  });
}

export const load = (nodes, dispatch) => {
  const model = rehydrateModel(nodes);
  rehydrateDOM(model);
  dispatch({
    type: PLAYGROUND_ACTIONS.PLAYGROUND_LOAD_SUCCESS,
    payload: {objects: model},
  });
}

export const saveEditorToStorage = (nodes) => {
  saveData("nodes", nodes);
}

export const saveModelToStorage = (objects) => {
  saveData("objects", objects);
}

export const loadPlaygroundFromStorage = () => {
  const nodes = loadData("nodes");
  const objects = loadData("objects");

  return {nodes, objects};
}

export const resetPlaygroundFromStorage = () => {
  clearData("nodes");
  clearData("objects");
}
