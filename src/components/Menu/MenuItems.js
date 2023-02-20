import { MenuGroup, Section } from "@atlaskit/menu";
import { SideNavigation } from "@atlaskit/side-navigation";
import MenuItem from "./MenuItem";
import "./MenuItems.css";

function MenuItems({ items, onDrag }) {
  const builtin = items.filter((item) => item.section === "builtin");
  const events = items.filter((item) => item.section === "events");
  const actions = items.filter((item) => item.section === "actions");

  return (
    <SideNavigation label="Project navigation" testId="side-navigation">
      <MenuGroup>
        {[
          { list: builtin, label: "RTC" },
          { list: events, label: "Events" },
          { list: actions, label: "Actions" },
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
    </SideNavigation>
  );
}

export default MenuItems;
