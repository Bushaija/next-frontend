import { RoughNotation } from "react-rough-notation";
import { FC } from "react";

// Types
export interface NavItem {
  id: string;
  label: string;
  step: number;
}

export interface SideBarProps {
  currentStepIndex: number;
  goTo: (index: number) => void;
  items: NavItem[];
  activeColor?: string;
  className?: string;
  navClassName?: string;
}

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  activeColor: string;
}

// Configuration
const defaultNavItems: NavItem[] = [
  { id: "info", label: "Your info", step: 1 },
  { id: "plan", label: "Select plan", step: 2 },
  { id: "addons", label: "Add-ons", step: 3 },
  { id: "summary", label: "Summary", step: 4 },
];

// NavItem Component
const NavItemComponent: FC<NavItemProps> = ({
  item,
  isActive,
  onClick,
  activeColor,
}) => {
  return (
    <li className="flex flex-col items-start font-semibold">
      <span className="hidden text-neutral-900 uppercase text-sm md:flex">
        step {item.step}
      </span>
      <button
        type="button"
        tabIndex={0}
        onClick={onClick}
        aria-current={isActive ? "step" : undefined}
        className={`text-sm md:text-base ${
          isActive ? `text-[${activeColor}]` : "text-neutral-900"
        }`}
      >
        <RoughNotation
          type="underline"
          show={isActive}
          color={activeColor}
        >
          {item.label}
        </RoughNotation>
      </button>
    </li>
  );
};

// Main SideBar Component
const SideBar: FC<SideBarProps> = ({
  currentStepIndex,
  goTo,
  items = defaultNavItems,
  activeColor = "#02bd4d",
  className = "",
  navClassName = "",
}) => {
  return (
    <div className={`absolute -top-20 left-0 w-full md:w-[25%] md:relative md:top-0 md:left-0 ${className}`}>
      <nav 
        className={`py-5 text-neutral-900 bg-zinc-50 h-full rounded-md md:p-5 ${navClassName}`}
        role="navigation"
        aria-label="Registration steps"
      >
        <ul className="flex justify-center gap-4 md:flex-col" role="list">
          {items.map((item, index) => (
            <NavItemComponent
              key={item.id}
              item={item}
              isActive={currentStepIndex === index}
              onClick={() => goTo(index)}
              activeColor={activeColor}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;