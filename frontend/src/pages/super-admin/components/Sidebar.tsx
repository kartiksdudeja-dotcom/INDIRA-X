import {
  FaHome,
  FaUserShield,
  FaUserGraduate,
  FaBook,
  FaSignOutAlt,
} from "react-icons/fa";

type SectionKey = "dashboard" | "admins" | "students" | "subjects";

type SidebarProps = {
  activeKey: SectionKey;
  onSelect: (key: SectionKey) => void;
};

const menu = [
  { icon: <FaHome />, text: "Dashboard", key: "dashboard" },
  { icon: <FaUserShield />, text: "Admins", key: "admins" },
  { icon: <FaUserGraduate />, text: "Students", key: "students" },
  { icon: <FaBook />, text: "Subjects", key: "subjects" },
];

export default function Sidebar({
  activeKey,
  onSelect,
}: SidebarProps) {
  return (
    <div
      style={{
        width: 260,
        height: "100vh",
        background: "#0f172a",
        color: "#fff",
        padding: 20,
      }}
    >
      <h2>AttendX</h2>

      {menu.map((item) => (
        <div
          key={item.key}
          onClick={() => onSelect(item.key as SectionKey)}
          style={{
            display: "flex",
            gap: 15,
            alignItems: "center",
            padding: 15,
            marginTop: 10,
            cursor: "pointer",
            borderRadius: 10,
            background:
              activeKey === item.key ? "#2563eb" : "transparent",
          }}
        >
          {item.icon}
          {item.text}
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          bottom: 30,
          display: "flex",
          gap: 15,
        }}
      >
        <FaSignOutAlt />
        Logout
      </div>
    </div>
  );
}