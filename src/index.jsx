import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
    HashRouter, Route, Routes
} from "react-router-dom";
import Home from "./pages/Home"
import Buy from "./pages/Buy";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import PP from "./pages/PP";


import { AuthProvider } from 'react-auth-kit'
import {GoogleOAuthProvider} from "@react-oauth/google";
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound";


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
                            <Route path={"chat"} element={<Chat />} />
                            <Route path={"login"} element={<Login />} />
                            <Route path={"shop"} element={<Shop />} />

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