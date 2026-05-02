"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loginRequest, getUser, logoutRequest } from "@/lib/auth";
import { isAdmin as isAdminRole } from "@/lib/roles";
import {
  can as canPermission,
  canAny as canAnyPermission,
  type Action,
  type Resource,
} from "@/lib/permissions";
import type { User } from "@/types";

export const USER_QUERY_KEY = ["user"] as const;

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Fetch current user. Returns null when unauthenticated rather than
  // throwing, so consumer components can branch on it cleanly.
  const userQuery = useQuery<User | null>({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      try {
        return await getUser();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (user) => {
      queryClient.setQueryData(USER_QUERY_KEY, user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
  });

  const user = userQuery.data ?? null;

  // Permission helpers bound to the current user.
  const can = useCallback(
    (action: Action | string, resource: Resource | string) =>
      canPermission(user, action, resource),
    [user],
  );
  const canAny = useCallback(
    (perms: ReadonlyArray<readonly [Action | string, Resource | string]>) =>
      canAnyPermission(user, perms),
    [user],
  );

  return {
    user,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!user,

    // Sealed-role identity check. Use this only for UI that's specifically
    // about the Admin badge / sealed-admin invariants. Every other gate
    // should go through `can(action, resource)`.
    isAdmin: isAdminRole(user?.role?.name),
    can,
    canAny,

    login: loginMutation.mutateAsync,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,

    logout: logoutMutation.mutate,
    logoutLoading: logoutMutation.isPending,
  };
};
