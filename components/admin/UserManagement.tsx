"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { cn, formatDate } from "@/lib/utils";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeToAllUsers,
  setUserSuspended,
  setUserRole,
  type ManagedUser,
} from "@/lib/firestore-admin";
import { USER_ROLES } from "@/lib/constants";
import { VENDORS } from "@/lib/data/sample";
import type { UserRole } from "@/types";

const ROLE_PILL: Record<UserRole, string> = {
  admin: "bg-surface-variant text-on-surface-variant",
  vendor: "bg-secondary-container text-on-secondary-container",
  customer: "bg-primary-fixed text-on-primary-fixed-variant",
};

export function UserManagement({ mode }: { mode: "users" | "vendors" }) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToAllUsers((list) => {
      setUsers(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const rows =
    mode === "vendors" ? users.filter((u) => u.role === "vendor") : users;

  async function changeRole(uid: string, role: UserRole) {
    try {
      await setUserRole(uid, role);
      toast.success(`Role updated to ${role}`);
    } catch {
      toast.error("Could not update role — admin access required.");
    }
  }
  async function toggleSuspend(u: ManagedUser) {
    try {
      await setUserSuspended(u.uid, !u.isSuspended);
      toast.success(u.isSuspended ? "Account reinstated" : "Account suspended");
    } catch {
      toast.error("Could not update account.");
    }
  }

  const showDemo = !loading && rows.length === 0;

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th className="px-6 py-3 font-semibold">{mode === "vendors" ? "Vendor" : "User"}</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Joined</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-body-md">
              {loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                    Loading {mode}…
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((u) => (
                  <tr key={u.uid} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-6 py-4">
                      <div className="text-label-md font-medium text-on-surface">
                        {u.displayName || "—"}
                      </div>
                      <div className="text-label-sm text-on-surface-variant">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        aria-label={`Role for ${u.email}`}
                        value={u.role}
                        onChange={(e) => changeRole(u.uid, e.target.value as UserRole)}
                        className="rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1 text-label-md capitalize text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {USER_ROLES.map((r) => (
                          <option key={r} value={r} className="capitalize">
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {u.createdAt ? formatDate(u.createdAt) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded px-2 py-0.5 text-label-sm font-bold uppercase tracking-wide",
                          u.isSuspended
                            ? "bg-error-container text-on-error-container"
                            : "bg-success-container text-on-success-container",
                        )}
                      >
                        {u.isSuspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSuspend(u)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-label-md transition-colors",
                          u.isSuspended
                            ? "border-outline-variant text-on-surface hover:bg-surface-container-low"
                            : "border-error/40 text-error hover:bg-error-container/30",
                        )}
                      >
                        <Icon name={u.isSuspended ? "check_circle" : "block"} size={16} />
                        {u.isSuspended ? "Reinstate" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))}

              {/* Demo fallback rows for the Vendors tab when nothing is live. */}
              {showDemo &&
                mode === "vendors" &&
                VENDORS.map((v) => (
                  <tr key={v.id} className="text-on-surface-variant">
                    <td className="px-6 py-4">
                      <div className="text-label-md font-medium text-on-surface">{v.name}</div>
                      <div className="text-label-sm">{v.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex rounded px-2 py-0.5 text-label-sm font-bold uppercase tracking-wide", ROLE_PILL.vendor)}>
                        vendor
                      </span>
                    </td>
                    <td className="px-6 py-4">—</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded px-2 py-0.5 text-label-sm font-bold uppercase tracking-wide bg-success-container text-on-success-container">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4" />
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDemo && mode === "users" && (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
            <Icon name="group" size={24} />
          </span>
          <p className="mt-3 text-body-md text-on-surface">No user accounts to show yet.</p>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            Registered users appear here. Requires admin access and a configured backend.
          </p>
        </div>
      )}

      {showDemo && mode === "vendors" && (
        <p className="text-center text-label-sm text-on-surface-variant">
          Demo vendors shown — real vendor accounts appear here once users register as vendors.
        </p>
      )}
    </section>
  );
}
