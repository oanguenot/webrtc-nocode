import { useState, useContext, useEffect, useRef } from "react";
import AppContext from "../../contexts/appContext";

function Supervisor() {
  const appState = useContext(AppContext);

  const domElt = useRef(null);
  const createUserIFrame = () => {};

  const deleteUserIFrame = () => {};

  return <div ref={domElt} />;
}

export default Supervisor;
