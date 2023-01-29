import MenuItem from "./MenuItem";

function MenuItems({ items, onDrag }) {
  return (
    <div>
      {items.map((menuItem, key) => {
        return new MenuItem({
          name: menuItem.name,
          description: menuItem.description,
          icon: menuItem.icon,
          onDrag: onDrag,
          key,
        });
      })}
    </div>
  );
}

export default MenuItems;
