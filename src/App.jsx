import './styles/App.css';
import "./styles/index.css"
import react from "react";
import {
    ThemeProvider,
    Paper,
    createTheme, Dialog, DialogTitle, DialogContent, Typography
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
            darkMode: {
                mode: darkMode,
                theme: createTheme({
                    palette: {
                        mode: darkMode,
                    },
                })
            },
            showUpdate: window.localStorage.getItem("lastVersion") !== "1.0.1",
        }
    }

    componentDidMount() {
        window.localStorage.setItem("lastVersion", "1.0.1")
    }

    render() {
        return (
            <ThemeProvider theme={this.state.darkMode.theme} className={"test"}>
                <Dialog maxWidth={"md"} open={this.state.showUpdate} onClose={() => this.setState({ showUpdate: false })}>
                    <DialogTitle>
                        <Typography variant={"h3"}>
                            V1.0.1 - Update notes
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant={"h6"}>
                            ~ Merge Google Login & Signup <br/>
                            ~ Now same email (gmail) can register both email and google account. <br/>
                            ~ Fixed "favorite" function <br/>
                            ~ Fixed Login Password bugs <br/>
                            + Add image zoom function <br/>
                            ~ update the reverse order button make it easier to understand
                        </Typography>
                        <Typography color={"gray"}>
                            *Thank you for all your testing and responses btw .w.
                        </Typography>
                    </DialogContent>
                </Dialog>
                <Paper style={{minHeight: "100vh", height: "100%", borderRadius: 0}}>
                    <AppBar />
                    <Outlet changePage={this.changePage}/>
                </Paper>
            </ThemeProvider>
        );
    }
}

export default App;
