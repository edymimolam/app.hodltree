import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export function useIsRouterLoading() {
  const router = useRouter();

  const [isRouterLoading, setIsRouterLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) =>
      url !== router.asPath && setIsRouterLoading(true);
    const handleComplete = (url: string) =>
      url === router.asPath && setIsRouterLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  });

  return isRouterLoading;
}
