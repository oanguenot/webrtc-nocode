function MenuItem(props) {
  console.log("PROPS", props);
  const onDrag = (event) => {
    props.onDrag(event);
  };

  return (
    <div
      key={props.key}
      className="drag-drawflow"
      draggable="true"
      onDragStart={(event) => onDrag(event)}
      data-node={props.name}
    >
      <i className={`fas fa-${props.icon}`}></i>
      <span> {props.description}</span>
    </div>
  );
}

export default MenuItem;
