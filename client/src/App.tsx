import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StressProvider } from "./contexts/StressContext";
import { playSadSound } from "./hooks/useSadSound";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function GlobalEffects() {
  useEffect(() => {
    // 전역 클릭 → 한숨/비웃음 소리
    const handleClick = () => playSadSound();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <StressProvider>
          <TooltipProvider>
            <GlobalEffects />
            <Toaster />
            <Router />
          </TooltipProvider>
        </StressProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
