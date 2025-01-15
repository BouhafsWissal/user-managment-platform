import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, RouterProvider, Route, RootRoute } from '@tanstack/router';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import CreateCourse from './pages/CreateCourse';

const queryClient = new QueryClient();

const rootRoute = new RootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Outlet />
    </QueryClientProvider>
  ),
});

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const registerRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});

const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const creatorDashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/creator/dashboard',
  component: CreatorDashboard,
});

const createCourseRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/creator/courses/new',
  component: CreateCourse,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  dashboardRoute,
  creatorDashboardRoute,
  createCourseRoute,
]);

const router = new Router({ routeTree });

function App() {
  return <RouterProvider router={router} />;
}

export default App;