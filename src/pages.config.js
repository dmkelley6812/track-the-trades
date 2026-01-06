import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import Journal from './pages/Journal';
import Settings from './pages/Settings';
import Strategies from './pages/Strategies';
import Trades from './pages/Trades';
import Dashboard from './pages/Dashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Analytics": Analytics,
    "Insights": Insights,
    "Journal": Journal,
    "Settings": Settings,
    "Strategies": Strategies,
    "Trades": Trades,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};