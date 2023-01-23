export const OBJECT_ACTIONS = {
  ADD_OBJECT_SUCCESS: "ADD_OBJECT_SUCCESS",
  SELECT_OBJECT_SUCCESS: "SELECT_OBJECT_SUCCESS",
  UNSELECT_OBJECT_SUCCESS: "UNSELECT_OBJECT_SUCCESS",
};

export const addObject = async (object, dispatch) => {
  console.log(`[action] :: add object ${object.id} of type ${object.type}`);

  dispatch({
    type: OBJECT_ACTIONS.ADD_OBJECT_SUCCESS,
    payload: { object },
  });
};

export const select = async (objectId, dispatch) => {
  console.log(`[action] :: select object ${objectId}`);
  dispatch({
    type: OBJECT_ACTIONS.SELECT_OBJECT_SUCCESS,
    payload: { objectId },
  });
};

export const clearSelection = async (dispatch) => {
  console.log(`[action] :: clear selection`);
  dispatch({
    type: OBJECT_ACTIONS.UNSELECT_OBJECT_SUCCESS,
    payload: {},
  });
};
