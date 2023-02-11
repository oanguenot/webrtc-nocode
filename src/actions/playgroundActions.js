import {execute} from "../modules/playground";

export const PLAYGROUND_ACTIONS = {
  PLAYGROUND_RUN_IN_PROGRESS: "PLAYGROUND_RUN_IN_PROGRESS",
  PLAYGROUND_RUN_SUCCESS: "PLAYGROUND_RUN_SUCCESS",
  PLAYGROUND_RUN_FAILED: "PLAYGROUND_RUN_FAILED"
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
