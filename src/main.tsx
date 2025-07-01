import { TooltipProvider } from "./providers/TooltipProvider.tsx";
import App from "./App";
import "./index.css";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";

async function enableMocking() {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const { worker } = await import("./lib/mocks/browser.ts");
  return worker.start();
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  );
});
