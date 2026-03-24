// /lib/mentionSuggestion.ts
// Shared mention suggestion config — imported by ReplyComposer and NewThreadForm.

import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import MentionList from "@/app/components/MentionList";

export const mentionSuggestion = {
  items: async ({ query }: { query: string }): Promise<any[]> => {
    if (!query || query.trim().length < 1) return [];
    try {
      const res = await fetch(
        `/api/members/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  },

  render: () => {
    let component: ReactRenderer;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) return;

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);
        if (!props.clientRect) return;
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === "Escape") {
          popup[0].hide();
          return true;
        }
        return (component.ref as any)?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};