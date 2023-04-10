import { OBJECT_ACTIONS } from "../actions/objectActions";
import { SUPERVISOR_ACTIONS } from "../actions/supervisonActions";
import {
  filterNodesByName,
  findTargetsFromSources,
  getNodeById,
  getNodeIndexById,
} from "../modules/helper";
import {
  PLAYGROUND_ACTIONS,
  saveModelToStorage,
} from "../actions/playgroundActions";
import { DEBUG_ACTIONS } from "../actions/DebugActions";
import { checkNodesProblems } from "../modules/problems";
import { KEYS } from "../modules/model";

export const STATE = {
  NOT_INITIALIZED: "NOT_INITIALIZED",
  READY: "READY",
};

export const PLAY_STATE = {
  IDLE: "IDLE",
  RUNNING: "RUNNING",
  ENDED: "ENDED",
  FAILED: "FAILED",
};

const initialAppState = {
  objects: [],
  lastAdded: null,
  selected: null,
  link: null,
  devices: [],
  state: STATE.READY,
  debug: [],
  events: [],
  groups: [],
  subGroups: [],
  playState: PLAY_STATE.IDLE,
  nbTasks: 0,
  tasksDone: 0,
  loadedCheckDevices: false,
  problems: [],
};

const updateValueInObject = (objectId, name, value, label, objects) => {
  const index = getNodeIndexById(objectId, objects);
  const updatedObjects = [...objects];
  updatedObjects[index].updateValueFor(name, value, label);
  return updatedObjects;
};

const updateLinkInObject = (objectId, fromId, objects) => {
  const recipientIndex = objects.findIndex((object) => object.id === objectId);
  const initiatorIndex = objects.findIndex((object) => object.id === fromId);

  const updatedObjects = [...objects];
  updatedObjects[recipientIndex].addInputLink(fromId);
  updatedObjects[initiatorIndex].addOutputLink(objectId);
  return updatedObjects;
};

const removeLinkInObject = (objectId, fromId, objects) => {
  const recipientIndex = objects.findIndex((object) => object.id === objectId);
  const initiatorIndex = objects.findIndex((object) => object.id === fromId);
  const updatedObjects = [...objects];
  updatedObjects[recipientIndex].removeInputLink(fromId);
  updatedObjects[initiatorIndex].removeOutputLink(objectId);
  return updatedObjects;
};

const appReducer = (state = initialAppState, action) => {
  if (!action) {
    console.error(`[reduc]:: no action}`);
    return;
  }
  console.log(`[reduc]:: ${action.type}`);
  switch (action.type) {
    case OBJECT_ACTIONS.ADD_OBJECT_SUCCESS: {
      const object = action.payload.object;
      const nodeInfo = object.getInfoValueFor(KEYS.NODE);

      // Manage all target nodes
      const targets = findTargetsFromSources(
        nodeInfo,
        state.objects,
        object.kind
      );
      if (!!targets.length) {
        targets.forEach(({ node, source }) => {
          const splitTarget = source.split("@");
          const label = splitTarget[0].split(":")[0];
          const prop = splitTarget[0].split(":")[1];
          node.addNewOptionToSelect(
            object.id,
            object.getPropertyValueFor(label),
            prop
          );
        });
      }

      // Manage all source nodes
      if (!!object.sources.length) {
        object.sources.forEach((source) => {
          const splitSource = source.split("@");
          const label = splitSource[0].split(":")[0];
          const prop = splitSource[0].split(":")[1];
          const nodeName = splitSource[1];

          // Find all source nodes and get a reference label/prop
          const sources = filterNodesByName(
            nodeName,
            state.objects,
            object.kind
          ).map((obj) => ({
            value: obj.id,
            label: obj.getPropertyValueFor(label),
          }));
          object.addMultipleOptionsToSelect(sources, prop);
        });
      }

      const newObjects = [...state.objects, object];
      saveModelToStorage(newObjects);
      const problems = checkNodesProblems(newObjects);

      return {
        ...state,
        lastAdded: object,
        objects: newObjects,
        problems,
      };
    }
    case OBJECT_ACTIONS.REMOVE_OBJECT_SUCCESS: {
      if (state.selected) {
        // Remove selected from all targets
        const nodeInfo = state.selected.getInfoValueFor(KEYS.NODE);
        const targets = findTargetsFromSources(
          nodeInfo,
          state.objects,
          state.selected.kind
        );
        if (!!targets.length) {
          targets.forEach(({ node, source }) => {
            const splitTarget = source.split("@");
            const prop = splitTarget[0].split(":")[1];
            node.removeOptionFromSelect(state.selected.id, prop);
          });
        }

        const newObjects = state.objects.filter(
          (object) => object.id !== state.selected.id
        );

        saveModelToStorage(newObjects);
        const problems = checkNodesProblems(newObjects);
        return {
          ...state,
          objects: newObjects,
          problems,
        };
      }
      break;
    }
    case OBJECT_ACTIONS.SELECT_OBJECT_SUCCESS: {
      const objectId = action.payload.objectId;
      const object = getNodeById(objectId, state.objects);
      return {
        ...state,
        lastAdded: null,
        selected: object,
      };
    }
    case OBJECT_ACTIONS.UNSELECT_OBJECT_SUCCESS: {
      return {
        ...state,
        selected: null,
        lastAdded: null,
      };
    }
    case OBJECT_ACTIONS.UPDATE_OBJECT_SUCCESS: {
      const objectId = action.payload.objectId;
      const name = action.payload.name;
      const value = action.payload.value;
      const label = action.payload.label;

      // Update property for object
      const objects = updateValueInObject(
        objectId,
        name,
        value,
        label,
        state.objects
      );

      const object = getNodeById(objectId, objects);
      const nodeInfo = object.getInfoValueFor(KEYS.NODE);

      // Manage all target nodes
      const targets = findTargetsFromSources(
        nodeInfo,
        state.objects,
        object.kind
      );
      if (!!targets.length && name === KEYS.NAME) {
        targets.forEach(({ node, source }) => {
          const splitTarget = source.split("@");
          const prop = splitTarget[0].split(":")[1];
          node.updateLabelInSelect(object.id, value, prop);
        });
      }

      saveModelToStorage(objects);
      const problems = checkNodesProblems(objects);

      return {
        ...state,
        lastAdded: null,
        objects,
        problems,
      };
    }
    case OBJECT_ACTIONS.CREATE_CONNECTION_ATTEMPT: {
      const fromNode = getNodeById(action.payload.fromId, state.objects);
      const toObject = getNodeById(action.payload.toId, state.objects);

      // Don't create the connection twice
      if (
        fromNode.linksOutput.includes(action.payload.toId) &&
        toObject.linksInput.includes(action.payload.fromId)
      ) {
        return state;
      }

      if (
        !fromNode ||
        !toObject ||
        (toObject &&
          fromNode &&
          !toObject.acceptInputConnection(fromNode.node)) ||
        (toObject &&
          fromNode &&
          !fromNode.acceptOutputConnection(toObject.node))
      ) {
        // link is not correct - remove it
        return {
          ...state,
          link: { action: "delete", connection: action.payload.connection },
        };
      }

      const newObjects = updateLinkInObject(
        toObject.id,
        fromNode.id,
        state.objects
      );
      saveModelToStorage(newObjects);

      // Add link to recipient node
      return {
        ...state,
        connection: null,
        objects: newObjects,
      };
    }
    case OBJECT_ACTIONS.REMOVE_CONNECTION_SUCCESS: {
      const fromNode = getNodeById(action.payload.fromId, state.objects);
      const toObject = getNodeById(action.payload.toId, state.objects);

      const newObjects = removeLinkInObject(
        toObject.id,
        fromNode.id,
        state.objects
      );
      saveModelToStorage(newObjects);
      return {
        ...state,
        objects: newObjects,
      };
    }
    case OBJECT_ACTIONS.CREATE_CONNECTION_REMOVED: {
      return {
        ...state,
        link: null,
      };
    }
    case SUPERVISOR_ACTIONS.GET_DEVICES_FAILED:
    case SUPERVISOR_ACTIONS.GET_DEVICES_SUCCESS: {
      return {
        ...state,
        devices: action.payload.devices,
        state: STATE.READY,
      };
    }
    case SUPERVISOR_ACTIONS.RESET_DEVICES_SUCCESS: {
      return {
        ...state,
        devices: [],
      };
    }
    case PLAYGROUND_ACTIONS.PLAYGROUND_LOAD_SUCCESS: {
      const objects = action.payload.objects;
      saveModelToStorage(objects);
      const problems = checkNodesProblems(objects);
      return {
        ...state,
        objects: objects,
        loadedCheckDevices: true,
        lastAdded: null,
        selected: null,
        link: null,
        problems,
      };
    }
    case PLAYGROUND_ACTIONS.PLAYGROUND_RUN_SUCCESS:
      return {
        ...state,
        playState: PLAY_STATE.ENDED,
      };
    case PLAYGROUND_ACTIONS.PLAYGROUND_RUN_FAILED:
      return {
        ...state,
        playState: PLAY_STATE.FAILED,
      };
    case PLAYGROUND_ACTIONS.PLAYGROUND_DEVICES_CHECKED_SUCCESS:
      return {
        ...state,
        loadedCheckDevices: false,
      };
    case PLAYGROUND_ACTIONS.PLAYGROUND_DEVICES_CHECKED_FAILED:
      return {
        ...state,
        loadedCheckDevices: false,
      };
    case PLAYGROUND_ACTIONS.PLAYGROUND_RESET_SUCCESS:
      return {
        ...state,
        objects: [],
        lastAdded: null,
        selected: null,
        link: null,
        debug: [],
        nbTasks: 0,
        tasksDone: 0,
        problems: [],
      };
    case DEBUG_ACTIONS.ADD_TRACE: {
      const log = action.payload;
      return {
        ...state,
        debug: [...state.debug, log],
      };
    }
    case DEBUG_ACTIONS.SET_TASK_NUMBER: {
      return {
        ...state,
        nbTasks: action.payload.number,
        tasksDone: 0,
      };
    }
    case DEBUG_ACTIONS.INCREMENT_TASK_DONE: {
      let playState = state.playState;
      if (playState === PLAY_STATE.IDLE) {
        playState = PLAY_STATE.RUNNING;
      }
      return {
        ...state,
        tasksDone: state.tasksDone + 1,
        playState,
      };
    }
    default:
      return state;
  }
};

export { appReducer, initialAppState };
