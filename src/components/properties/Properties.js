import { useState, useContext, useEffect } from "react";
import AppContext from "../../contexts/appContext";
import EmptyState from "@atlaskit/empty-state";
import "./Properties.css";
import Property from "./Property";
import Lozenge from "@atlaskit/lozenge";
import Badge from "@atlaskit/badge";
import { SimpleTag as Tag } from "@atlaskit/tag";
import TagGroup from "@atlaskit/tag-group";

function Properties({ dispatch }) {
  const appState = useContext(AppContext);

  const getInfo = () => {
    return (
      <div className="properties">
        <div className="property-title">
          <i className="fas fa-caret-right"></i> Main information
        </div>
        <table>
          <tbody>
            {appState.selected.info.map((info, key) => (
              <tr key={key}>
                <td className="col-label">{info.key}:</td>
                <td className="col-value">
                  <Lozenge isBold={info.key === "node"}>{info.value}</Lozenge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getProperties = () => {
    return (
      <div className="mt-30">
        <div className="property-title">
          <i className="fas fa-caret-right"></i> Properties
        </div>
        <div className="properties-area">
          {appState.selected.properties.map((property, index) => (
            <Property
              key={index}
              property={property}
              objectId={appState.selected.id}
              dispatch={dispatch}
            />
          ))}
        </div>
      </div>
    );
  };

  const getLinkName = (objectId) => {
    const found = appState.objects.find((object) => object.id === objectId);
    if (found) {
      return found.getPropertyValueFor("name");
    }
    return objectId;
  };

  const getLinks = () => {
    return (
      <div className="mt-30">
        <div className="property-title">
          <i className="fas fa-caret-right"></i> Links{" "}
          <Badge appearance="primary">{appState.selected.links.length}</Badge>
        </div>
        {appState.selected.links.length > 0 && (
          <ul className="links">
            {appState.selected.links.map((link, index) => (
              <li key={index}>{getLinkName(link)}</li>
            ))}
          </ul>
        )}
        {appState.selected.links.length === 0 && (
          <div className="links">
            <label>No existing links for this object</label>
          </div>
        )}
        {appState.selected.accept.length > 0 && (
          <table>
            <tbody>
              <tr>
                <td className="col-label-accept">Accept:</td>
                <td className="col-value-accept">
                  <TagGroup alignment="start">
                    {appState.selected.accept.map((name, key) => (
                      <Tag color="blueLight" key={key} text={name}></Tag>
                    ))}
                  </TagGroup>
                </td>
              </tr>
            </tbody>
          </table>
        )}
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

      {appState.selected && appState.selected.links && getLinks()}
    </div>
  );
}

export default Properties;
