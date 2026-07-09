import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { NewMeetingScreen } from "./components/screens/NewMeetingScreen";
import { MeetingListScreen } from "./components/screens/MeetingListScreen";
import { MeetingDetailScreen } from "./components/screens/MeetingDetailScreen";
import { InsightsScreen } from "./components/screens/InsightsScreen";
import { LoginScreen } from "./components/screens/LoginScreen";
import { SignupScreen } from "./components/screens/SignupScreen";
import { ResetPasswordScreen } from "./components/screens/ResetPasswordScreen";
import { GroupMeetingRoomScreen } from "./components/screens/GroupMeetingRoomScreen";
import { LiveMeetingScreen } from "./components/screens/LiveMeetingScreen";
import { UploadMeetingScreen } from "./components/screens/UploadMeetingScreen";
import { PrivateRoute } from "./routes/PrivateRoute";

export const router = createBrowserRouter([
  // 인증 불필요 — 독립 화면 (Layout 바깥)
  { path: "/login", Component: LoginScreen },
  { path: "/signup", Component: SignupScreen },
  { path: "/reset-password", Component: ResetPasswordScreen },

  // 인증 필요 — PrivateRoute → Layout → 각 화면
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, Component: NewMeetingScreen },
          { path: "meetings", Component: MeetingListScreen },
          { path: "meetings/:id", Component: MeetingDetailScreen },
          { path: "insights", Component: InsightsScreen },
          { path: "recording/live", Component: LiveMeetingScreen },
          { path: "recording/upload", Component: UploadMeetingScreen },
          { path: "group-meeting/room/:roomId", Component: GroupMeetingRoomScreen },
        ],
      },
    ],
  },
]);
