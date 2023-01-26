import { OBJECT_ACTIONS } from "../actions/objectActions";

const initialAppState = {
  objects: [],
  lastAdded: null,
  selected: null,
  link: null,
};

const getObjectFromId = (objectId, objects) => {
  return objects.find((object) => object.id === objectId);
};

const updateValueInObject = (objectId, name, value, objects) => {
  const index = objects.findIndex((object) => object.id === objectId);
  const updatedObjects = [...objects];
  updatedObjects[index].updateValueFor(name, value);
  return updatedObjects;
};

const updateLinkInObject = (objectId, fromId, objects) => {
  const index = objects.findIndex((object) => object.id === objectId);
  const updatedObjects = [...objects];
  updatedObjects[index].addInputLink(fromId);
  return updatedObjects;
};

const appReducer = (state = initialAppState, action) => {
  if (!action) {
    console.error(`[reduc]:: no action}`);
    return;
  }
  console.log(`[reduc]:: ${action.type}`);
  switch (action.type) {
    case OBJECT_ACTIONS.ADD_OBJECT_SUCCESS:
      return {
        ...state,
        lastAdded: action.payload.object,
        objects: [...state.objects, action.payload.object],
      };
    case OBJECT_ACTIONS.SELECT_OBJECT_SUCCESS:
      const objectId = action.payload.objectId;
      const object = state.objects.find((object) => object.id === objectId);
      return {
        ...state,
        lastAdded: null,
        selected: object,
      };

    case OBJECT_ACTIONS.UNSELECT_OBJECT_SUCCESS:
      return {
        ...state,
        selected: null,
        lastAdded: null,
      };
    case OBJECT_ACTIONS.UPDATE_OBJECT_SUCCESS: {
      const objectId = action.payload.objectId;
      const name = action.payload.name;
      const value = action.payload.value;
      return {
        ...state,
        lastAdded: null,
        objects: updateValueInObject(objectId, name, value, state.objects),
      };
    }
    case OBJECT_ACTIONS.CREATE_CONNECTION_ATTEMPT: {
      const fromNode = getObjectFromId(action.payload.fromId, state.objects);
      const toObject = getObjectFromId(action.payload.toId, state.objects);

      if (
        !fromNode ||
        !toObject ||
        (toObject && fromNode && !toObject.acceptConnection(fromNode.node))
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
    default:
      break;
  }
};

export { appReducer, initialAppState };
