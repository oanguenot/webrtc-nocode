import { execute, rehydrateDOM, rehydrateModel } from "../modules/playground";
import { clearData, loadData, saveData } from "../modules/storage";

let ref_fileHandle = null;

export const PLAYGROUND_ACTIONS = {
  PLAYGROUND_RUN_IN_PROGRESS: "PLAYGROUND_RUN_IN_PROGRESS",
  PLAYGROUND_RUN_SUCCESS: "PLAYGROUND_RUN_SUCCESS",
  PLAYGROUND_RUN_FAILED: "PLAYGROUND_RUN_FAILED",
  PLAYGROUND_LOAD_SUCCESS: "PLAYGROUND_LOAD_SUCCESS",
  PLAYGROUND_WRITE_SUCCESS: "PLAYGROUND_WRITE_SUCCESS",
  PLAYGROUND_READ_SUCCESS: "PLAYGROUND_READ_SUCCESS",
};

export const PLAYGROUND_STORAGE_KEYS = {
  NODES: "nodes",
  OBJECTS: "objects",
  POS_X: "pos_x",
  POS_Y: "pos_y",
};

export const run = (nodes, dispatch) => {
  dispatch({
    type: PLAYGROUND_ACTIONS.PLAYGROUND_RUN_IN_PROGRESS,
    payload: {},
  });

  execute(nodes, dispatch)
    .then(() => {
      dispatch({
        type: PLAYGROUND_ACTIONS.PLAYGROUND_RUN_SUCCESS,
        payload: {},
      });
    })
    .catch((err) => {
      dispatch({
        type: PLAYGROUND_ACTIONS.PLAYGROUND_RUN_FAILED,
        payload: {},
      });
    });
};

export const load = (nodes, dispatch) => {
  const model = rehydrateModel(nodes);
  rehydrateDOM(model);
  dispatch({
    type: PLAYGROUND_ACTIONS.PLAYGROUND_LOAD_SUCCESS,
    payload: { objects: model },
  });
};

export const saveEditorToStorage = (nodes) => {
  saveData(PLAYGROUND_STORAGE_KEYS.NODES, nodes);
};

export const savePosition = (x, y) => {
  console.log("x, y", x, y);
  saveData(PLAYGROUND_STORAGE_KEYS.POS_X, x);
  saveData(PLAYGROUND_STORAGE_KEYS.POS_Y, y);
};

export const saveModelToStorage = (objects) => {
  saveData(PLAYGROUND_STORAGE_KEYS.OBJECTS, objects);
};

export const saveToExistingFile = async (exported) => {
  if (!ref_fileHandle) {
    return false;
  }

  try {
    const file = await ref_fileHandle.getFile();
    const blob = new Blob([JSON.stringify(exported)], {
      type: "text/plain;charset=utf-8",
    });
    const writable = await ref_fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (err) {
    console.warn(`[play] can't store to file ${ref_fileHandle.name}`);
    return false;
  }
};

export const importFromFile = async () => {
  const [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  const contents = await file.text();
  const imported = JSON.parse(contents);
  ref_fileHandle = fileHandle;
  return imported;
};

export const exportToFile = async (exported) => {
  const opts = {
    types: [
      {
        description: "Playground WebRTC file",
        accept: { "text/plain": [".webrtc"] },
      },
    ],
  };

  const blob = new Blob([JSON.stringify(exported)], {
    type: "text/plain;charset=utf-8",
  });
  const fileHandle = await window.showSaveFilePicker(opts);
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
  ref_fileHandle = fileHandle;
  return ref_fileHandle.name;
};

export const getFileHandle = () => {
  return ref_fileHandle;
};

export const loadPlaygroundFromStorage = () => {
  const nodes = loadData(PLAYGROUND_STORAGE_KEYS.NODES);
  const objects = loadData(PLAYGROUND_STORAGE_KEYS.OBJECTS);
  const x = loadData(PLAYGROUND_STORAGE_KEYS.POS_X || 0);
  const y = loadData(PLAYGROUND_STORAGE_KEYS.POS_Y || 0);

  return { nodes, objects, x, y };
};

export const resetPlaygroundFromStorage = () => {
  clearData(PLAYGROUND_STORAGE_KEYS.NODES);
  clearData(PLAYGROUND_STORAGE_KEYS.OBJECTS);
};
