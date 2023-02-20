import { OBJECT_ACTIONS } from "../actions/objectActions";
import { SUPERVISOR_ACTIONS } from "../actions/supervisonActions";
import { getNodeById, getNodeIndexById } from "../modules/helper";
import {
  PLAYGROUND_ACTIONS,
  saveModelToStorage,
} from "../actions/playgroundActions";
import { DEBUG_ACTIONS } from "../actions/DebugActions";

export const STATE = {
  NOT_INITIALIZED: "NOT_INITIALIZED",
  READY: "READY",
};

const initialAppState = {
  objects: [],
  lastAdded: null,
  selected: null,
  link: null,
  devices: [],
  state: STATE.NOT_INITIALIZED,
  debug: [],
};

const updateValueInObject = (objectId, name, value, label, objects) => {
  const index = getNodeIndexById(objectId, objects);
  const updatedObjects = [...objects];
  updatedObjects[index].updateValueFor(name, value, label);
  return updatedObjects;
};

const filterObjectsWithNode = (value, objects) => {
  return objects.filter((obj) => obj.getInfoValueFor("node") === value);
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
      const node = object.getInfoValueFor("node");
      if (node.includes("rtc.track")) {
        object.addDevices(state.devices);
        filterObjectsWithNode("action.encode", state.objects).forEach((obj) => {
          obj.addNewOptionToSelect(object.id, object.id, "track");
        });
      } else if (node.includes("step")) {
        filterObjectsWithNode("goto", state.objects).forEach((obj) => {
          obj.addNewOptionToSelect(
            object.id,
            object.getPropertyValueFor("name"),
            "next"
          );
        });
      } else if (node.includes("goto")) {
        const steps = filterObjectsWithNode("step", state.objects).map(
          (obj) => ({
            value: obj.id,
            label: obj.getPropertyValueFor("name"),
          })
        );
        object.addMultipleOptionsToSelect(steps, "next");
      } else if (node.includes("action.encode")) {
        const tracks = filterObjectsWithNode("rtc.track", state.objects).map(
          (obj) => ({
            value: obj.id,
            label: obj.id,
          })
        );
        object.addMultipleOptionsToSelect(tracks, "track");
      } else if (node.includes("rtc.peer")) {
        // Add peer to all ready
        filterObjectsWithNode("event.ready", state.objects).forEach((obj) => {
          obj.addNewOptionToSelect(object.id, object.id, "peer");
        });

        // Add peer to all call
        filterObjectsWithNode("action.call", state.objects).forEach((obj) => {
          obj.addNewOptionToSelect(object.id, object.id, "peer");
        });

        filterObjectsWithNode("event.ice", state.objects).forEach((obj) => {
          obj.addNewOptionToSelect(object.id, object.id, "peer");
        });
      } else if (node.includes("event.ready")) {
        const peers = filterObjectsWithNode("rtc.peer", state.objects).map(
          (obj) => ({
            value: obj.id,
            label: obj.getPropertyValueFor("name"),
          })
        );
        object.addMultipleOptionsToSelect(peers, "peer");
      } else if (node.includes("event.ice")) {
        const peers = filterObjectsWithNode("rtc.peer", state.objects).map(
          (obj) => ({
            value: obj.id,
            label: obj.getPropertyValueFor("name"),
          })
        );
        object.addMultipleOptionsToSelect(peers, "peer");
      } else if (node.includes("action.call")) {
        const peers = filterObjectsWithNode("rtc.peer", state.objects).map(
          (obj) => ({
            value: obj.id,
            label: obj.getPropertyValueFor("name"),
          })
        );
        object.addMultipleOptionsToSelect(peers, "peer");
      }

      const newObjects = [...state.objects, object];
      saveModelToStorage(newObjects);

      return {
        ...state,
        lastAdded: object,
        objects: newObjects,
      };
    }
    case OBJECT_ACTIONS.REMOVE_OBJECT_SUCCESS: {
      if (state.selected) {
        const newObjects = state.objects.filter(
          (object) => object.id !== state.selected.id
        );
        saveModelToStorage(newObjects);
        return {
          ...state,
          objects: newObjects,
        };
      }
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

      // Update all goto nodes when step name changed
      const object = getNodeById(objectId, objects);
      if (object.getInfoValueFor("node") === "step") {
        const relatedGoto = filterObjectsWithNode("goto", objects);
        relatedGoto.forEach((obj) =>
          obj.updateLabelInSelect(object.id, value, "step")
        );
      }

      if (object.getInfoValueFor("node") === "rtc.peer") {
        // Update all ready nodes when peer name changed
        const relatedReady = filterObjectsWithNode("event.ready", objects);
        relatedReady.forEach((obj) =>
          obj.updateLabelInSelect(object.id, value, "peer")
        );

        // Update all callP2P nodes when peer name changed
        const relatedP2P = filterObjectsWithNode("action.p2p", objects);
        relatedP2P.forEach((obj) =>
          obj.updateLabelInSelect(object.id, value, "peer")
        );
      }

      saveModelToStorage(objects);

      return {
        ...state,
        lastAdded: null,
        objects,
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
      saveModelToStorage(action.payload.objects);
      return {
        ...state,
        objects: action.payload.objects,
        lastAdded: null,
        selected: null,
        link: null,
      };
    }
    case DEBUG_ACTIONS.ADD_TRACE: {
      const log = action.payload;
      return {
        ...state,
        debug: [...state.debug, log],
      };
    }
    default:
      return state;
  }
};

export { appReducer, initialAppState };
