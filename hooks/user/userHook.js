'use client'
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";

const useUser = () => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userRefresh, setUserRefresh] = useState(1);

  // Track if we've already tried to fetch (prevent multiple calls)
  const hasFetched = useRef(false);

  useEffect(() => {
    // Re-run on mount and whenever userRefresh changes (e.g. after login/logout)
    let cancelled = false;

    const initUser = async () => {
      setUserLoading(true);

      // Read the token from cookie first, then fall back to localStorage
      const tokenFromCookie = Cookies.get("flp_token");
      const tokenFromStorage =
        typeof window !== "undefined" ? localStorage.getItem("flp_token") : null;
      const token = tokenFromCookie || tokenFromStorage;

      // No token → not logged in
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setUserLoading(false);
          hasFetched.current = true;
        }
        return;
      }

      try {
        // Verify the token and fetch the current user
        const res = await fetch("/api/auth/getUser", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!cancelled) {
          if (res.ok && data.status === "success" && data.user?.email) {
            setUser(data.user);
          } else {
            // Token is invalid/expired → clear it
            setUser(null);
            Cookies.remove("flp_token");
            if (typeof window !== "undefined") localStorage.removeItem("flp_token");
          }
        }
      } catch (err) {
        console.error("Error initializing user:", err);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) {
          setUserLoading(false);
          hasFetched.current = true;
        }
      }
    };

    initUser();

    return () => {
      cancelled = true;
    };
  }, [userRefresh]);

  return {
    user,
    setUser,
    userLoading,
    setUserLoading,
    userRefresh,
    setUserRefresh,
  };
};

export default useUser;
