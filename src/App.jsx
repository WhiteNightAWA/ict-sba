import './styles/App.css';
import "./styles/index.css"
import react from "react";
import {
    ThemeProvider,
    Paper,
    createTheme
} from "@mui/material";
import {Outlet} from "react-router-dom";
import AppBar from "./components/AppBar";


class App extends react.Component {
    constructor(props) {
        super(props);

        let darkMode = window.localStorage.getItem("darkMode");
        window.localStorage.setItem("darkMode", "dark")
        if (darkMode === null) {
            const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            darkMode = prefersDarkMode ? "dark" : "light";
            window.localStorage.setItem("darkMode", "dark");
        }

        this.state = {
            tab: "home",
            darkMode: {
                mode: darkMode,
                theme: createTheme({
                    palette: {
                        mode: darkMode,
                    },
                })
            }
        }
    }

    render() {
        return (
            <ThemeProvider theme={this.state.darkMode.theme} className={"test"}>
                <Paper style={{minHeight: "100vh", height: "100%", borderRadius: 0}}>
                    <AppBar />
                    <Outlet changePage={this.changePage}/>
                </Paper>
            </ThemeProvider>
        );
    }
}

export default App;
