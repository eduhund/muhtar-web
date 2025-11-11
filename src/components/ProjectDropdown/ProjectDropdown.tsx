import { Button, Select, Tooltip, Typography } from "antd";
import { Project } from "../../context/AppContext";

type ProjectDropdownProps = {
  projects: Project[];
  onChange: (value: string[]) => void;
  value: any;
  placeholder?: string;
  isRequired?: boolean;
  isMultiple?: boolean;
  isLoading?: boolean;
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

const { Paragraph } = Typography;

function getLabelText(label: React.ReactNode) {
  if (
    typeof label === "object" &&
    label !== null &&
    "props" in label &&
    (label as React.ReactElement).props?.children
  ) {
    return (label as React.ReactElement).props.children;
  }
  return label;
}

export default function ProjectDropdown({
  projects,
  onChange,
  value,
  placeholder,
  isRequired = false,
  isMultiple = false,
  isLoading = false,
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
    .map((customer) => {
      const groupOptions = groupedOptions[customer];
      return {
        label: (
          <span
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Paragraph style={{ margin: 0 }} strong>
              {customer}
            </Paragraph>
            {isMultiple && (
              <Button
                type="link"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  const groupIds = groupOptions.map((opt) => opt.value);
                  const selected = Array.isArray(value) ? value : [];
                  const allSelected = groupIds.every((id) =>
                    selected.includes(id)
                  );
                  let newValue;
                  if (allSelected) {
                    newValue = selected.filter((id) => !groupIds.includes(id));
                  } else {
                    newValue = Array.from(new Set([...selected, ...groupIds]));
                  }
                  onChange(newValue);
                }}
              >
                {(() => {
                  const groupIds = groupOptions.map((opt) => opt.value);
                  const selected = Array.isArray(value) ? value : [];
                  const allSelected = groupIds.every((id) =>
                    selected.includes(id)
                  );
                  return allSelected ? "Clear" : "Select all";
                })()}
              </Button>
            )}
          </span>
        ),
        title: customer,
        options: groupOptions,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((group: GroupedOption) => {
      return {
        ...group,
        options: group.options.sort((a: GroupOptions, b: GroupOptions) => {
          const aText = getLabelText(a.label);
          const bText = getLabelText(b.label);
          if (aText === bText) {
            return a.value.localeCompare(b.value);
          }
          return String(aText).localeCompare(String(bText));
        }),
      };
    });

  const handleChange = (selected: string[]) => {
    let newValue = selected;
    if (Array.isArray(selected)) {
      selected.forEach((val) => {
        if (val.startsWith("__all__")) {
          const groupName = val.replace("__all__", "");
          const groupIds =
            groupedOptions[groupName]?.map((opt) => opt.value) || [];
          newValue = [
            ...selected.filter((v) => v !== val),
            ...groupIds.filter((id) => !selected.includes(id)),
          ];
        }
      });
    }
    onChange(newValue);
  };

  return (
    <Select
      placeholder={placeholder || "Select..."}
      options={options}
      value={value}
      mode={isMultiple ? "multiple" : undefined}
      allowClear={!isRequired}
      prefix={isMultiple ? "Projects" : "Project"}
      loading={isLoading}
      showSearch={true}
      filterOption={(input, option) =>
        getLabelText(option?.label).toLowerCase().includes(input.toLowerCase())
      }
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
      onChange={handleChange}
    />
  );
}
