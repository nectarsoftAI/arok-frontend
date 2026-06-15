import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { RecordingScreen } from "./components/screens/RecordingScreen";
import { MeetingListScreen } from "./components/screens/MeetingListScreen";
import { MeetingDetailScreen } from "./components/screens/MeetingDetailScreen";
import { InsightsScreen } from "./components/screens/InsightsScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: RecordingScreen },
      { path: "meetings", Component: MeetingListScreen },
      { path: "meetings/:id", Component: MeetingDetailScreen },
      { path: "insights", Component: InsightsScreen },
    ],
  },
]);
