import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
    HashRouter, Route, Routes
} from "react-router-dom";
import Home from "./pages/Home"
import Buy from "./pages/Buy";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import PP from "./pages/PP";
import MyShop from "./pages/MyShop";
import NotFound from "./pages/NotFound";


import { AuthProvider } from 'react-auth-kit'
import {GoogleOAuthProvider} from "@react-oauth/google";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthProvider authType = {'cookie'}
                      authName={'_auth'}
                      cookieDomain={window.location.hostname}
                      cookieSecure={window.location.protocol === "https:"}>

            <GoogleOAuthProvider clientId={"492651620125-qq34m1ql3bgdgfdncb56irfa4c43pfhp.apps.googleusercontent.com"}>
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<App />}>
                            <Route path={""} element={<Home />} />
                            <Route path={"buy"} element={<Buy />} />
                            <Route path={"buy/shop/:shopID"} element={<Shop />} />
                            <Route path={"login"} element={<Login />} />
                            <Route path={"myShop"} element={<MyShop />} />

                            <Route path={"*"} element={<NotFound />} />
                            <Route path={"pp"} element={<PP />} />
                        </Route>
                    </Routes>
                </HashRouter>
            </GoogleOAuthProvider>
        </AuthProvider>
    </React.StrictMode>
);

reportWebVitals();