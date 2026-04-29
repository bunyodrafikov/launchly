import type { TileDefinition } from "../src/types";

export const tiles: TileDefinition[] = [
  {
    id: "github",
    kind: "bookmark",
    title: "GitHub",
    subtitle: "github.com",
    href: "https://github.com",
    icon: "https://cdn.simpleicons.org/github/181717",
    layout: { horizontal: "wide", vertical: "wide" }
  },
  {
    id: "gmail",
    kind: "bookmark",
    title: "Gmail",
    subtitle: "mail.google.com",
    href: "https://mail.google.com",
    icon: "https://cdn.simpleicons.org/gmail/EA4335",
    layout: { horizontal: "wide", vertical: "wide" }
  },
  {
    id: "notion",
    kind: "bookmark",
    title: "Notion",
    subtitle: "notion.so",
    href: "https://notion.so",
    icon: "https://cdn.simpleicons.org/notion/000000",
    layout: { horizontal: "wide", vertical: "wide" }
  },
  {
    id: "linear",
    kind: "bookmark",
    title: "Linear",
    subtitle: "linear.app",
    href: "https://linear.app",
    icon: "https://cdn.simpleicons.org/linear/5E6AD2",
    layout: { horizontal: "wide", vertical: "wide" }
  },
  {
    id: "figma",
    kind: "bookmark",
    title: "Figma",
    subtitle: "figma.com",
    href: "https://figma.com",
    icon: "https://cdn.simpleicons.org/figma/F24E1E",
    layout: { horizontal: "wide", vertical: "wide" }
  },
  {
    id: "forecast",
    kind: "forecast",
    title: "Forecast",
    layout: { horizontal: "forecast", vertical: "forecast" }
  },
  {
    id: "slack",
    kind: "bookmark",
    title: "Slack",
    subtitle: "app.slack.com",
    href: "https://app.slack.com",
    icon: "https://cdn.simpleicons.org/slack/4A154B",
    layout: { horizontal: "wide", vertical: "small" }
  },
  {
    id: "calendar",
    kind: "calendar",
    title: "Events",
    layout: { horizontal: "calendar", vertical: "calendar" }
  },
  {
    id: "image",
    kind: "image",
    title: "Image",
    layout: { horizontal: "image", vertical: "image" }
  },
];
