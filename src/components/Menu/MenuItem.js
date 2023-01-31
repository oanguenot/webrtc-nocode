import { ButtonItem } from "@atlaskit/menu";

function MenuItem(props) {
  const onDrag = (event) => {
    props.onDrag(event);
  };

  return (
    <ButtonItem
      description={props.description}
      key={props.key}
      draggable="true"
      onDragStart={(event) => onDrag(event)}
      data-node={props.name}
    >
      <i className={`fas fa-${props.icon}`}></i> <span> {props.item}</span>
    </ButtonItem>
  );
}

export default MenuItem;
