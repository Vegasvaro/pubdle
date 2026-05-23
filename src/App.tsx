import { Route, Switch } from "wouter";
import { Toaster } from "sonner";
import { AuthProvider } from "./lib/auth";
import Home from "./pages/Home";
import AppPage from "./pages/AppPage";
import FavoritesPage from "./pages/FavoritesPage";
import HistoryPage from "./pages/HistoryPage";
import AboutPage from "./pages/AboutPage";
import PricingPage from "./pages/PricingPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <Toaster theme="dark" position="top-right" richColors />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/app" component={AppPage} />
        <Route path="/favorites" component={FavoritesPage} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/login" component={LoginPage} />
        <Route component={NotFound} />
      </Switch>
    </AuthProvider>
  );
}
