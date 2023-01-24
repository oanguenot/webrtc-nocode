import { useState, useContext, useEffect } from "react";
import AppContext from "../../contexts/appContext";
import EmptyState from "@atlaskit/empty-state";
import "./Properties.css";
import Property from "./Property";
import Lozenge from "@atlaskit/lozenge";

function Properties({ dispatch }) {
  const appState = useContext(AppContext);

  const getInfo = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {appState.selected.info.map((info, key) => (
            <tr key={key}>
              <td className="col-label">{info.key}</td>
              <td className="col-value">
                <Lozenge isBold={info.key === "type"}>{info.value}</Lozenge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    //
  };

  const getProperties = () => {
    return (
      <div className="properties">
        {appState.selected.properties.map((property, index) => (
          <Property
            key={index}
            property={property}
            objectId={appState.selected.id}
            dispatch={dispatch}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      {!appState.selected && (
        <EmptyState
          header="No info!"
          description="Click on a node to edit its properties"
        />
      )}
      {appState.selected && appState.selected.info && getInfo()}

      {appState.selected && appState.selected.properties && getProperties()}
    </div>
  );
}

export default Properties;
