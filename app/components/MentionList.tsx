// /app/components/MentionList.tsx

"use client";

import "tippy.js/dist/tippy.css";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

interface MentionItem {
  _id: string;
  name: string;
  image?: string;
}

interface MentionListProps {
  items: MentionItem[];
  command: (item: { id: string; label: string }) => void;
}

const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item._id, label: item.name });
    }
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex(
          (prev) => (prev + props.items.length - 1) % props.items.length
        );
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % props.items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (!props.items.length) {
    return (
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          padding: "8px 12px",
          fontSize: "13px",
          color: "#9ca3af",
        }}
      >
        No members found
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        overflow: "hidden",
        minWidth: "180px",
        maxWidth: "260px",
      }}
    >
      {props.items.map((item, index) => (
        <button
          key={item._id}
          type="button"
          onClick={() => selectItem(index)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            padding: "8px 12px",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            fontSize: "14px",
            fontWeight: index === selectedIndex ? 600 : 400,
            backgroundColor:
              index === selectedIndex
                ? "var(--color-ijf-primary, #1a2236)"
                : "transparent",
            color:
              index === selectedIndex
                ? "var(--color-ijf-accent, #e4b95b)"
                : "#374151",
            transition: "background-color 0.1s",
          }}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor:
                  index === selectedIndex ? "#e4b95b33" : "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                color: index === selectedIndex ? "#e4b95b" : "#6b7280",
                flexShrink: 0,
              }}
            >
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.name}
          </span>
        </button>
      ))}
    </div>
  );
});

MentionList.displayName = "MentionList";
export default MentionList;