import { lazy } from "react";

export const NewMeetingScreen = lazy(() =>
  import("../components/screens/NewMeetingScreen").then((m) => ({ default: m.NewMeetingScreen }))
);
export const MeetingListScreen = lazy(() =>
  import("../components/screens/MeetingListScreen").then((m) => ({ default: m.MeetingListScreen }))
);
export const MeetingDetailScreen = lazy(() =>
  import("../components/screens/MeetingDetailScreen").then((m) => ({ default: m.MeetingDetailScreen }))
);
export const InsightsScreen = lazy(() =>
  import("../components/screens/InsightsScreen").then((m) => ({ default: m.InsightsScreen }))
);
export const LoginScreen = lazy(() =>
  import("../components/screens/LoginScreen").then((m) => ({ default: m.LoginScreen }))
);
export const SignupScreen = lazy(() =>
  import("../components/screens/SignupScreen").then((m) => ({ default: m.SignupScreen }))
);
export const ResetPasswordScreen = lazy(() =>
  import("../components/screens/ResetPasswordScreen").then((m) => ({ default: m.ResetPasswordScreen }))
);
export const GroupMeetingRoomScreen = lazy(() =>
  import("../components/screens/GroupMeetingRoomScreen").then((m) => ({ default: m.GroupMeetingRoomScreen }))
);
export const LiveMeetingScreen = lazy(() =>
  import("../components/screens/LiveMeetingScreen").then((m) => ({ default: m.LiveMeetingScreen }))
);
export const UploadMeetingScreen = lazy(() =>
  import("../components/screens/UploadMeetingScreen").then((m) => ({ default: m.UploadMeetingScreen }))
);
