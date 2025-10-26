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

export default function ProjectDropdown({
  projects,
  onChange,
  value,
  isRequired = false,
  isMultiple = false,
  style,
}: ProjectDropdownProps) {
  const groupedOptions = projects.reduce((groups: any, item: any) => {
    const { id, name, customer } = item;
    if (customer === null || customer === undefined || customer === "") {
      item.customer = "Single projects";
    }
    if (!groups[customer]) {
      groups[customer] = [];
    }
    groups[customer].push({ value: id, label: <span>{name}</span> });
    return groups;
  }, {});

  const options = Object.keys(groupedOptions)
    .map((customer) => ({
      label: <span>{customer}</span>,
      title: customer,
      options: groupedOptions[customer],
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((group: any) => {
      return {
        ...group,
        options: group.options.sort((a, b) =>
          a.label.props.children.localeCompare(b.label.props.children)
        ),
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
