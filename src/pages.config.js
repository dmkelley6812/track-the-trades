import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';


export const PAGES = {
    "Dashboard": Dashboard,
    "Trades": Trades,
    "Journal": Journal,
    "Analytics": Analytics,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
};