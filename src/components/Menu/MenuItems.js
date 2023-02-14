import { MenuGroup, Section } from "@atlaskit/menu";
import MenuItem from "./MenuItem";
import "./MenuItems.css";

function MenuItems({ items, onDrag }) {
  const builtin = items.filter((item) => item.section === "builtin");
  const events = items.filter((item) => item.section === "events");
  const actions = items.filter((item) => item.section === "actions");

  return (
    <MenuGroup>
      {[
        { list: builtin, label: "Built-in Nodes" },
        { list: events, label: "Events" },
        { list: actions, label: "Actions"},
      ].map(({ list, label }, keySection) => (
        <Section key={keySection} title={label}>
          {list.length > 0 &&
            list.map((menuItem, key) => {
              return new MenuItem({
                name: menuItem.name,
                item: menuItem.item,
                description: menuItem.description,
                icon: menuItem.icon,
                onDrag: onDrag,
                key,
              });
            })}
          {list.length === 0 && (
            <span className="no-items">No node in this section</span>
          )}
        </Section>
      ))}
    </MenuGroup>
  );
}

export default MenuItems;