"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loginRequest, getUser, logoutRequest, registerRequest } from "@/lib/auth";

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Fetch current user
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/login";
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data,

    login: loginMutation.mutateAsync,
    loginLoading: loginMutation.isPending,

    register: registerMutation.mutateAsync,
    registerLoading: registerMutation.isPending,

    logout: logoutMutation.mutate,
  };
};
