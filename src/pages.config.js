import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Settings from './pages/Settings';
import Trades from './pages/Trades';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Analytics": Analytics,
    "Dashboard": Dashboard,
    "Journal": Journal,
    "Settings": Settings,
    "Trades": Trades,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};