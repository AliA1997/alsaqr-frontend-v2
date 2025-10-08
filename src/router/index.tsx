import { createBrowserRouter, RouteObject } from "react-router-dom";
// import AccessDenied from '../features/AccessDenied';
// import NotFound from '../features/NotFound';
// import ServerError from '../features/ServerError';
// import ValidationError from '../features/ValidationError';

import App from '../App';
import HomePage from "@features/Home";
import MessagesPage from '@features/Messages';
import BookmarksPage from "@features/Bookmarks";
import CommunitiesPage from "@features/Communities";
import ExplorePage from "@features/Explore";
import ListsPage from "@features/Lists";
import NotificationsPage from "@features/Notifications";
import SettingsPage from "@features/Settings";
import StatusPage from '@features/Status';
import UserProfilePage from "@features/User";
import PrivacyPage from "@features/PrivacyPolicy";
import TermsAndConditionsPage from "@features/TermsAndConditions";
// import VerifyAccount from "../features/VerifyAccount";
// import AIAssistant from "../features/AIAssistant";
// import WikiBooksSearchResults from "../features/WikiBooksSearchResults";
// import WikiBookPage from "../features/WikiBookPage";
// import CollaborateDashboard from "../features/CollaborateDashboard";
// import Login from "../features/Login";

export const routes: RouteObject[] = [
  {
    path: "/:lang?", // Optional language parameter
    element: <App />,
    children: [
      //   {
      //     element: <RequireAuth status={ClientStatus.PreTrial} />,
      //     children: [
      //       {
      //         path: "users/changePassword/:id",
      //         element: <ChangePassword isChange={true} />,
      //       },
      //     ],
      //   },
      //   {
      //     element: (
      //       <RequireAuth
      //         status={ClientStatus.Trial}
      //         accessLevel={AccessLevel.Owner}
      //       />
      //     ),
      //     children: [
      //       { path: "staff", element: <AdminPage /> },
      //     ],
      //   },
      //   {
      //     element: (
      //       <RequireAuth
      //         status={ClientStatus.Active | ClientStatus.Subscription}
      //         accessLevel={AccessLevel.Owner}
      //       />
      //     ),
      //     children: [
      //       { path: "subscription/ServiceType", element: <ServiceType /> },
      //       { path: "subscription/Users", element: <AdditionalUsers /> },
      //       { path: "subscription/RenewalOptions", element: <RenewalOptions /> },
      //       { path: "subscription/Cancel", element: <CancelSubscription /> },
      //     ],
      //   },
      //   {
      //     element: (
      //       <RequireAuth
      //         status={ClientStatus.Trial | ClientStatus.Active}
      //         application={Application.RealTimeLaborGuidePro}
      //       />
      //     ),
      //     children: [
      //     ],
      //   },
      //   {
      //     element: (
      //       <RequireAuth
      //         status={ClientStatus.Trial | ClientStatus.Active}
      //         application={Application.RealTimeLaborGuidePro}
      //         accessLevel={AccessLevel.Manager}
      //       />
      //     ),
      //     children: [
      //     ],
      //   },
      //   {
      //     element: (
      //       <RequireAuth
      //         status={ClientStatus.Trial | ClientStatus.Active}
      //         application={Application.AutomotiveExpert}
      //       />
      //     ),
      //     children: [
      //       { path: "inventoryIndex/", element: <InventoryIndex /> },
      //     ],
      //   },
      //   {
      //     element: (
      //       <RequireAuth
      //         status={ClientStatus.Trial | ClientStatus.Active}
      //         application={Application.AutomotiveExpert}
      //         accessLevel={AccessLevel.Manager}
      //       />
      //     ),
      //     children: [
      //     ],
      //   },
      //   {
      //     element: (
      //       <RequireAuth
      //         status={ClientStatus.Active | ClientStatus.Subscription}
      //         accessLevel={AccessLevel.SystemAdministrator}
      //       />
      //     ),
      //     children: []
      //   },
      { index: true, element: <HomePage /> },
      { path: "bookmarks", element: <BookmarksPage /> },
      { path: "communities", element: <CommunitiesPage /> },
      { path: "explore", element: <ExplorePage /> },
      { path: "lists", element: <ListsPage /> },
      { path: "messages", element: <MessagesPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "privacy-policy", element: <PrivacyPage /> },
      { path: "terms-and-conditions", element: <TermsAndConditionsPage /> },
      { path: "status/:status_id", element: <StatusPage /> },
      { path: "users/:name", element: <UserProfilePage /> },
      // { path: "collaborate", element: <Collaborate /> },
      // { path: "login", element: <Login /> },
      // { path: "youraccount", element: <CollaborateDashboard /> },
      // { path: "search", element: <WikiSearchResults /> },
      // { path: "searchBooks", element: <WikiBooksSearchResults /> },
      // { path: "ai-assistant", element: <AIAssistant /> },
      // { path: "wikipages/:pageId", element: <WikiPage /> },
      // { path: "wikibooks/:bookId", element: <WikiBookPage /> },
      // { path: "accessDenied", element: <AccessDenied /> },
      // { path: "verify-account/:userId", element: <VerifyAccount /> },
      // { path: "privacyPolicy", element: <PrivacyPolicy /> },
      // { path: "*", element: <NotFound /> },
      // { path: "server-error", element: <ServerError /> },
      // { path: "validation-error", element: <ServerError /> },
      //   { path: "forgotpassword", element: <ForgotPassword /> },
      //   { path: "account/verifyEmail", element: <ConfirmEmail /> },
      //   {
      //     path: "account/resetpassword/:id/:token",
      //     element: <ChangePassword isChange={false} />,
      //   },
      /**
       * TODO Need to Complete after implementing search functionality
       */
      //   { path: "eula", element: <Eula /> },
      //   { path: "privacy", element: <Privacy /> },
      //   { path: "terms", element: <Terms /> },
      //   { path: "registration", element: <Registration /> },
      //   { path: "login", element: <Navigate replace to="/" /> },
      //   { path: "*", element: <Navigate replace to="/" /> }, // temporary till we get urls fixed not-found
    ],
  },
]

export const router = createBrowserRouter(routes);