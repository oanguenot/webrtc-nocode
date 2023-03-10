export const OBJECT_ACTIONS = {
  ADD_OBJECT_SUCCESS: "ADD_OBJECT_SUCCESS",
  REMOVE_OBJECT_SUCCESS: "REMOVE_OBJECT_SUCCESS",
  SELECT_OBJECT_SUCCESS: "SELECT_OBJECT_SUCCESS",
  UNSELECT_OBJECT_SUCCESS: "UNSELECT_OBJECT_SUCCESS",
  UPDATE_OBJECT_SUCCESS: "UPDATE_OBJECT_SUCCESS",
  CREATE_CONNECTION_ATTEMPT: "CREATE_CONNECTION_ATTEMPT",
  CREATE_CONNECTION_REMOVED: "CREATE_CONNECTION_REMOVED",
  REMOVE_CONNECTION_SUCCESS: "REMOVE_CONNECTION_SUCCESS",
};

export const addObject = async (object, dispatch) => {
  console.log(`[action] :: add object ${object.id} of type ${object.node}`);

  dispatch({
    type: OBJECT_ACTIONS.ADD_OBJECT_SUCCESS,
    payload: { object },
  });
};

export const removeObject = async (objectId, dispatch) => {
  console.log(`[action] :: remove object ${objectId}`);

  dispatch({
    type: OBJECT_ACTIONS.REMOVE_OBJECT_SUCCESS,
    payload: { },
  });
}

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

export const updateProperty = async (
  objectId,
  name,
  value,
  label,
  dispatch
) => {
  console.log(
    `[action] :: update value for prop ${name} in object ${objectId}`
  );

  dispatch({
    type: OBJECT_ACTIONS.UPDATE_OBJECT_SUCCESS,
    payload: { objectId, name, value, label },
  });
};

export const createConnection = async (fromId, toId, connection, dispatch) => {
  console.log(`[action] :: create connection from ${fromId} to ${toId}`);

  dispatch({
    type: OBJECT_ACTIONS.CREATE_CONNECTION_ATTEMPT,
    payload: { fromId, toId, connection },
  });
};

export const removeConnection = async (fromId, toId, connection, dispatch) => {
  console.log(`[action] :: remove connection from ${fromId} to ${toId}`);
  dispatch({
    type: OBJECT_ACTIONS.REMOVE_CONNECTION_SUCCESS,
    payload: { fromId, toId, connection },
  });
}

export const createConnectionRemoved = async (dispatch) => {
  dispatch({
    type: OBJECT_ACTIONS.CREATE_CONNECTION_REMOVED,
    payload: {},
  });
};
