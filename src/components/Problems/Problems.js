import { useContext, useEffect, useState } from "react";
import AppContext from "../../contexts/appContext";

import "./Problems.css";

function Problems() {
  const appState = useContext(AppContext);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    setProblems(appState.problems);
  }, [appState.problems]);

  return (
    <div className="problems-area">
      <p>
        <b>Problems {problems.length > 0 ? `(${problems.length})` : ""}</b>
      </p>
      {problems.length > 0 && (
        <ul>
          {problems.map((problem, key) => (
            <li key={key}>{problem}</li>
          ))}
        </ul>
      )}
      {problems.length === 0 && <p>No problem detected. Scenario can be run</p>}
    </div>
  );
}

export default Problems;
