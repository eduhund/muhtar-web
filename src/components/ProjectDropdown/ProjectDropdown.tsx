import { Select, Tooltip } from "antd";
import { Project } from "../../context/AppContext";

type ProjectDropdownProps = {
  projects: Project[];
  onChange: (value: string[]) => void;
  value: string[];
  isRequired?: boolean;
  isMultiple?: boolean;
  style?: React.CSSProperties;
};

type ProjectGroups = {
  [customer: string]: { value: string; label: React.ReactNode }[];
};

type GroupOptions = {
  value: string;
  label: React.ReactNode;
};

type GroupedOption = {
  label: React.ReactNode;
  title: string;
  options: GroupOptions[];
};

export default function ProjectDropdown({
  projects,
  onChange,
  value,
  isRequired = false,
  isMultiple = false,
  style,
}: ProjectDropdownProps) {
  const groupedOptions = projects.reduce(
    (groups: ProjectGroups, item: Project) => {
      const { id, name } = item;
      let { customer } = item;
      if (customer === null || customer === undefined || customer === "") {
        customer = "Single projects";
      }
      if (!groups[customer]) {
        groups[customer] = [];
      }
      groups[customer].push({ value: id, label: <span>{name}</span> });
      return groups;
    },
    {}
  );

  const options = Object.keys(groupedOptions)
    .map((customer) => ({
      label: <span>{customer}</span>,
      title: customer,
      options: groupedOptions[customer],
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((group: GroupedOption) => {
      return {
        ...group,
        options: group.options.sort((a: GroupOptions, b: GroupOptions) => {
          const getLabelText = (label: React.ReactNode) => {
            if (
              typeof label === "object" &&
              label !== null &&
              "props" in label &&
              (label as React.ReactElement).props?.children
            ) {
              return (label as React.ReactElement).props.children;
            }
            return label;
          };
          const aText = getLabelText(a.label);
          const bText = getLabelText(b.label);
          if (aText === bText) {
            return a.value.localeCompare(b.value);
          }
          return String(aText).localeCompare(String(bText));
        }),
      };
    });

  return (
    <Select
      placeholder="All"
      options={options}
      value={value}
      mode={isMultiple ? "multiple" : undefined}
      allowClear={!isRequired}
      prefix="Projects"
      maxTagCount={value?.length === 1 ? 1 : "responsive"}
      maxTagPlaceholder={(omittedValues) => (
        <Tooltip
          styles={{ root: { pointerEvents: "none" } }}
          title={omittedValues.map(({ label }) => label).join(", ")}
        >
          <span>Selected: {value.length}</span>
        </Tooltip>
      )}
      style={style}
      onChange={onChange}
    />
  );
}
