import { MenuGroup, Section } from "@atlaskit/menu";
import MenuItem from "./MenuItem";
import "./MenuItems.css";

function MenuItems({ items, onDrag }) {
  const basics = items.filter((item) => item.section === "basic");
  const builtIn = items.filter((item) => item.section === "builtin");
  const external = items.filter((item) => item.section === "external");

  return (
    <MenuGroup>
      {[
        { list: basics, label: "Basic Nodes" },
        { list: builtIn, label: "Built-in Nodes" },
        {
          list: external,
          label: "External Nodes",
        },
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
