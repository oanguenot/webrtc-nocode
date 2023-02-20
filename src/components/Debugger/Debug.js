import { useContext } from "react";
import AppContext from "../../contexts/appContext";
import EmptyState from "@atlaskit/empty-state";

import "./Debug.css";

function Debug({ dispatch }) {
  const appState = useContext(AppContext);

  return (
    <div className="debug-area">
      <div id="frames"></div>
      {!appState.debug.length && (
        <EmptyState
          header="No Debug!"
          description="Run the playground to have results"
        />
      )}
      {!!appState.debug.length && (
        <div>
          <ul>
            {appState.debug.map((log, key) => (
              <li key={key}>
                {log.timestamp} {log.tag} {log.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Debug;
