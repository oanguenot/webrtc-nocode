import { useContext } from "react";
import AppContext from "../../contexts/appContext";
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
            <tr key="id">
              <td className="col-label">id</td>
              <td className="col-info">
                <Lozenge appearance="moved">{appState.selected.id}</Lozenge>
              </td>
            </tr>
            {appState.selected.info.map((info, key) => (
              <tr key={key}>
                <td className="col-label">{info.key}</td>
                {info.key === "info" && (
                  <td className="col-info">{info.value}</td>
                )}
                {info.key !== "info" && (
                  <td className="col-value">
                    <Lozenge isBold={info.key === "node"}>{info.value}</Lozenge>
                  </td>
                )}
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
      const name = `${found.getInfoValueFor("node")}.${objectId}`;
      return name;
    }
    return objectId;
  };

  const getLinks = () => {
    return (
      <div className="mt-30">
        <div className="property-title">
          <i className="fas fa-caret-right"></i> Links{" "}
          <Badge appearance="primary">{`${appState.selected.linksInput.length}-${appState.selected.linksOutput.length}`}</Badge>
        </div>
        {(appState.selected.linksInput.length > 0 ||
          appState.selected.linksOutput.length > 0) && (
          <div>
            <table>
              <tbody>
                {appState.selected.linksInput.map((link, index) => (
                  <tr key={index}>
                    <td className="col-label">input</td>
                    <td className="col-value-accept">{getLinkName(link)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table>
              <tbody>
                {appState.selected.linksOutput.map((link, index) => (
                  <tr key={index}>
                    <td className="col-label">output</td>
                    <td className="col-value-accept">{getLinkName(link)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {appState.selected.linksInput.length +
          appState.selected.linksOutput.length ===
          0 && (
          <div className="links">
            <label>No links for this object</label>
          </div>
        )}
        {appState.selected.acceptInput.length > 0 && (
          <table>
            <tbody>
              <tr>
                <td className="col-label-accept">Accept Input:</td>
                <td className="col-value-accept">
                  <TagGroup alignment="start">
                    {appState.selected.acceptInput.map((name, key) => (
                      <Tag color="blueLight" key={key} text={name}></Tag>
                    ))}
                  </TagGroup>
                </td>
              </tr>
            </tbody>
          </table>
        )}
        {appState.selected.acceptOutput.length > 0 && (
          <table>
            <tbody>
              <tr>
                <td className="col-label-accept">Accept Output:</td>
                <td className="col-value-accept">
                  <TagGroup alignment="start">
                    {appState.selected.acceptOutput.map((name, key) => (
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
      {appState.selected && appState.selected.info && getInfo()}
      {appState.selected && appState.selected.properties && getProperties()}
      {appState.selected &&
        appState.selected.linksInput &&
        appState.selected.linksOutput &&
        getLinks()}
    </div>
  );
}

export default Properties;
