import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { RootRoute } from "./routes/RootRoute";
import {
  NewMeetingScreen,
  MeetingListScreen,
  MeetingDetailScreen,
  InsightsScreen,
  LoginScreen,
  SignupScreen,
  ResetPasswordScreen,
  GroupMeetingRoomScreen,
  LiveMeetingScreen,
  UploadMeetingScreen,
} from "./routes/lazyScreens";

export const router = createBrowserRouter([
  // 인증 불필요 — 독립 화면 (Layout 바깥)
  { path: "/login", Component: LoginScreen },
  { path: "/signup", Component: SignupScreen },
  { path: "/reset-password", Component: ResetPasswordScreen },

  // "/" 는 미로그인 시 랜딩(공개), 로그인 시 Layout → 각 화면
  // 그 외 경로는 인증 필요 — RootRoute → Layout → 각 화면
  {
    element: <RootRoute />,
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
