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


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <HashRouter basename="/">
            <Routes>
                <Route path="/" element={<App />}>
                    <Route path={"/"} element={<Home />} />
                    <Route path={"/buy"} element={<Buy />} />
                    <Route path={"/chat"} element={<Chat />} />
                    <Route path={"/login"} element={<Login />} />
                </Route>
            </Routes>
        </HashRouter>
    </React.StrictMode>
);

reportWebVitals();