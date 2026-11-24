import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute, GuestRoute } from "@/components/ProtectedRoute";

const state = vi.hoisted(() => ({ user: null as null | { id: string }, loading: false, isRecovery: false }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => state }));
afterEach(() => { cleanup(); state.user = null; state.loading = false; state.isRecovery = false; });
function mount(path: string, guest = false) {
  render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route element={guest ? <GuestRoute /> : <ProtectedRoute />}><Route path={guest ? "/login" : "/dashboard"} element={<div>Allowed view</div>} /></Route>
    <Route path={guest ? "/dashboard" : "/login"} element={<div>Redirect target</div>} />
    <Route path="/reset-password" element={<div>Recovery target</div>} />
  </Routes></MemoryRouter>);
}
describe("session route rules", () => {
  it("blocks unauthenticated dashboard visits", () => { mount("/dashboard"); expect(screen.getByText("Redirect target")).toBeInTheDocument(); });
  it("allows signed-in dashboard visits", () => { state.user = { id: "test-user" }; mount("/dashboard"); expect(screen.getByText("Allowed view")).toBeInTheDocument(); });
  it("waits while session resolves", () => { state.loading = true; mount("/dashboard"); expect(screen.getByRole("status")).toBeInTheDocument(); expect(screen.queryByText("Allowed view")).not.toBeInTheDocument(); });
  it("redirects signed-in users away from login", () => { state.user = { id: "test-user" }; mount("/login", true); expect(screen.getByText("Redirect target")).toBeInTheDocument(); });
  it("keeps password recovery on its public reset page", () => { state.user = { id: "test-user" }; state.isRecovery = true; mount("/dashboard"); expect(screen.getByText("Recovery target")).toBeInTheDocument(); });
});
