import { OBJECT_ACTIONS } from "../actions/objectActions";

const initialAppState = {
  objects: [],
  lastAdded: null,
  selected: null,
};

const appReducer = (state = initialAppState, action) => {
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
        lastAdded: null,
        selected: null,
      };
    case OBJECT_ACTIONS.UPDATE_OBJECT_SUCCESS: {
      const objectId = action.payload.objectId;
      const name = action.payload.name;
      const value = action.payload.value;
      const index = state.objects.findIndex((object) => object.id === objectId);
      const updatedObjects = [...state.objects];
      updatedObjects[index].updateValueFor(name, value);
      console.log("UpdateObjects", updatedObjects);
      return {
        ...state,
        lastAdded: null,
        objects: updatedObjects,
      };
    }
    default:
      break;
  }
};

export { appReducer, initialAppState };
