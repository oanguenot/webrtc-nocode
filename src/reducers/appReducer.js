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
        selected: object,
      };
    case OBJECT_ACTIONS.UNSELECT_OBJECT_SUCCESS:
      return {
        ...state,
        selected: null,
      };
    default:
      break;
  }
};

export { appReducer, initialAppState };
