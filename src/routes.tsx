import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { NewMeetingScreen } from "./components/screens/NewMeetingScreen";
import { MeetingListScreen } from "./components/screens/MeetingListScreen";
import { MeetingDetailScreen } from "./components/screens/MeetingDetailScreen";
import { InsightsScreen } from "./components/screens/InsightsScreen";
import { LoginScreen } from "./components/screens/LoginScreen";
import { SignupScreen } from "./components/screens/SignupScreen";
import { ResetPasswordScreen } from "./components/screens/ResetPasswordScreen";

export const router = createBrowserRouter([
  { path: "/login", Component: LoginScreen },
  { path: "/signup", Component: SignupScreen },
  { path: "/reset-password", Component: ResetPasswordScreen },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: NewMeetingScreen },
      { path: "meetings", Component: MeetingListScreen },
      { path: "meetings/:id", Component: MeetingDetailScreen },
      { path: "insights", Component: InsightsScreen },
    ],
  },
]);
