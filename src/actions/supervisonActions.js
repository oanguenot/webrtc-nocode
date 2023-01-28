export const SUPERVISOR_ACTIONS = {
  GET_DEVICES_SUCCESS: "GET_DEVICES_SUCCESS",
  GET_DEVICES_FAILED: "GET_DEVICES_FAILED",
};

export const getListOfDevices = async (dispatch) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    const devices = await navigator.mediaDevices.enumerateDevices();

    dispatch({
      type: SUPERVISOR_ACTIONS.GET_DEVICES_SUCCESS,
      payload: { devices },
    });
  } catch (err) {
    console.error(`[actions] can't access to devices ${err.toString()}`);
    dispatch({
      type: SUPERVISOR_ACTIONS.GET_DEVICES_FAILED,
      payload: { devices: [] },
    });
  }
};
