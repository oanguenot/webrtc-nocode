import { OBJECT_ACTIONS } from "../actions/objectActions";
import { SUPERVISOR_ACTIONS } from "../actions/supervisonActions";

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
};

const getObjectFromId = (objectId, objects) => {
  return objects.find((object) => object.id === objectId);
};

const updateValueInObject = (objectId, name, value, label, objects) => {
  const index = objects.findIndex((object) => object.id === objectId);
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
        const encodes = filterObjectsWithNode(
          "action.encode",
          state.objects
        ).forEach((obj) => {
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
      }
      return {
        ...state,
        lastAdded: object,
        objects: [...state.objects, object],
      };
    }
    case OBJECT_ACTIONS.SELECT_OBJECT_SUCCESS: {
      const objectId = action.payload.objectId;
      const object = state.objects.find((object) => object.id === objectId);
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

      // Update related object (step --> goto)
      const object = objects.find((object) => object.id === objectId);
      if (object.getInfoValueFor("node") === "step") {
        const relatedGoto = filterObjectsWithNode("goto", objects);
        relatedGoto.forEach((obj) =>
          obj.updateStep(object.getInfoValueFor("uuid"), value)
        );
      }

      return {
        ...state,
        lastAdded: null,
        objects,
      };
    }
    case OBJECT_ACTIONS.CREATE_CONNECTION_ATTEMPT: {
      const fromNode = getObjectFromId(action.payload.fromId, state.objects);
      const toObject = getObjectFromId(action.payload.toId, state.objects);

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

      // Add link to recipient node
      return {
        ...state,
        connection: null,
        objects: updateLinkInObject(toObject.id, fromNode.id, state.objects),
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
    default:
      return state;
  }
};

export { appReducer, initialAppState };
