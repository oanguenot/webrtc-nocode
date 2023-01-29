import { useState, useContext, useEffect, useRef } from "react";
import AppContext from "../../contexts/appContext";
import { getListOfDevices } from "../../actions/supervisonActions";

function Supervisor({ dispatch }) {
  const appState = useContext(AppContext);

  useEffect(() => {}, []);

  const domElt = useRef(null);
  const createUserIFrame = () => {};

  const deleteUserIFrame = () => {};

  return <div ref={domElt} />;
}

export default Supervisor;
