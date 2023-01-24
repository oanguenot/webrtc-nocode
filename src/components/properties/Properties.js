import { useState, useContext, useEffect } from "react";
import AppContext from "../../contexts/appContext";
import EmptyState from "@atlaskit/empty-state";
import "./Properties.css";
import Property from "./Property";

function Properties({ dispatch }) {
  const appState = useContext(AppContext);

  const getInfo = () => {
    return appState.selected.info.map((info, key) => (
      <div key={key}>
        {info.key}: {info.value}
      </div>
    ));
  };

  const getProperties = () => {
    return appState.selected.properties.map((property, index) => (
      <Property
        key={index}
        property={property}
        objectId={appState.selected.id}
        dispatch={dispatch}
      />
    ));
  };

  return (
    <div>
      {!appState.selected && (
        <EmptyState
          header="No info!"
          description="Check your node, something is wrong"
        />
      )}
      {appState.selected && appState.selected.info && getInfo()}

      {appState.selected && appState.selected.properties && getProperties()}
    </div>
  );
}

export default Properties;
