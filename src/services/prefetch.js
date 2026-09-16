import api from "./api";

let dashboardPromise = null;

export function prefetchDashboard() {
  dashboardPromise = api.get("/dashboard/overview");
  return dashboardPromise;
}

export function consumeDashboardPrefetch() {
  const pending = dashboardPromise;
  dashboardPromise = null;
  return pending;
}
