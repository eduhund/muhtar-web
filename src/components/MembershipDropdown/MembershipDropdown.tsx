import { Select, Tooltip } from "antd";
import { Membership } from "../../context/AppContext";
import { defaultListSort } from "../../utils/helpers";

type MembershipDropdownProps = {
  memberships: Membership[];
  onChange: (value: string[]) => void;
  value: any;
  placeholder?: string;
  isRequired?: boolean;
  isMultiple?: boolean;
  isLoading?: boolean;
  style?: React.CSSProperties;
};

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

export default function MembershipDropdown({
  memberships,
  onChange,
  value,
  placeholder,
  isRequired = false,
  isMultiple = false,
  isLoading = false,
  style,
}: MembershipDropdownProps) {
  const membershipOptions = memberships.map((m) => ({
    label: m.name,
    value: m.id,
  }));
  return (
    <Select
      placeholder={placeholder || "Select..."}
      options={membershipOptions}
      value={value}
      mode={isMultiple ? "multiple" : undefined}
      filterSort={defaultListSort}
      allowClear={!isRequired}
      showSearch={true}
      prefix={isMultiple ? "Memberships" : "Membership"}
      loading={isLoading}
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
      onChange={onChange}
    />
  );
}
