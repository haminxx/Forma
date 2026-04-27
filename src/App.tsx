import { useEffect, useState } from "react";
import { Overlay } from "@/components/Overlay";
import { Settings } from "@/components/Settings";
import { DemoBackdrop } from "@/components/DemoBackdrop";
import { bindIpc } from "@/lib/ipc";
import { isWebDemo } from "@/lib/env";

type Route = "overlay" | "settings";

export default function App() {
  const [route, setRoute] = useState<Route>(() => readRoute());

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (route === "overlay") {
      return bindIpc();
    }
  }, [route]);

  if (route === "settings") {
    return <Settings />;
  }

  if (isWebDemo) {
    return (
      <DemoBackdrop>
        <Overlay />
      </DemoBackdrop>
    );
  }

  return <Overlay />;
}

function readRoute(): Route {
  if (typeof window !== "undefined" && window.location.hash === "#/settings") {
    return "settings";
  }
  return "overlay";
}
