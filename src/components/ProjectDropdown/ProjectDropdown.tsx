import { Select } from "antd";
import { Project } from "../../context/AppContext";
import { defaultListSort } from "../../utils/helpers";

type ProjectDropdownProps = {
  projects: Project[];
  onChange: (value: string[]) => void;
  value: string[];
  isRequired?: boolean;
  isMultiple?: boolean;
  style?: React.CSSProperties;
};

type ProjectSelectorItem = {
  name: string;
  id: string;
};

export default function ProjectDropdown({
  projects,
  onChange,
  value,
  isRequired = false,
  isMultiple = false,
  style,
}: ProjectDropdownProps) {
  const selectorItems = (projects || [])
    .map((project: Project) => {
      return {
        name: project.customer
          ? `${project.customer} / ${project.name}`
          : project.name,
        id: project.id,
      };
    })
    .sort((a: ProjectSelectorItem, b: ProjectSelectorItem) =>
      a.name.localeCompare(b.name)
    );

  return (
    <Select
      placeholder="All"
      options={selectorItems}
      value={value}
      fieldNames={{ label: "name", value: "id" }}
      filterSort={defaultListSort}
      mode={isMultiple ? "multiple" : undefined}
      allowClear={!isRequired}
      prefix="Projects"
      style={style}
      onChange={onChange}
    />
  );
}
