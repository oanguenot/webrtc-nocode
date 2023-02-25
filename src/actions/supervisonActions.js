import { clearData, loadData, saveData } from "../modules/storage";

export const SUPERVISOR_ACTIONS = {
  GET_DEVICES_SUCCESS: "GET_DEVICES_SUCCESS",
  GET_DEVICES_FAILED: "GET_DEVICES_FAILED",
  RESET_DEVICES_SUCCESS: "RESET_DEVICES_SUCCESS",
};

const DEVICES = "devices";

export const resetDevices = async (dispatch) => {
  clearData("devices");
  dispatch({
    type: SUPERVISOR_ACTIONS.RESET_DEVICES_SUCCESS,
    payload: {},
  });
};

export const getListOfDevices = async (dispatch) => {
  try {
    // Try to load devices from storage first
    const storedDevices = loadData(DEVICES, true);
    if (storedDevices) {
      dispatch({
        type: SUPERVISOR_ACTIONS.GET_DEVICES_SUCCESS,
        payload: { devices: storedDevices },
      });
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    const devices = await navigator.mediaDevices.enumerateDevices();

    // Save devices found to storage
    saveData(DEVICES, devices, true);

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
