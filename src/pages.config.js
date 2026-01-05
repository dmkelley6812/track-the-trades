import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Trades": Trades,
    "Journal": Journal,
    "Analytics": Analytics,
    "Settings": Settings,
    "Admin": Admin,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};