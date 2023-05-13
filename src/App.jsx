import './styles/App.css';
import "./styles/index.css"
import react from "react";
import {
    ThemeProvider,
    Paper,
    createTheme,
    Typography,
    Button,
    Box,
    AppBar,
    Toolbar, Tabs,
    styled, InputBase, alpha
} from "@mui/material";
import {Home, Search, LocalMall, Chat} from "@mui/icons-material";
import TabsLink from "./components/TabsLink";
import {Link, Outlet} from "react-router-dom";


const SearchBar = styled('div')(({theme}) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));
const SearchIconWrapper = styled('div')(({theme}) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));
const StyledInputBase = styled(InputBase)(({theme}) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));


class App extends react.Component {
    constructor(props) {
        super(props);

        let darkMode = window.localStorage.getItem("darkMode");
        if (darkMode === null) {
            const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            darkMode = prefersDarkMode ? "dark" : "light";
            window.localStorage.setItem("darkMode", darkMode);
        }

        this.tabs = [
            ["主頁", <Home/>, "home"],
            ["BUY", <LocalMall/>, "buy"],
            ["CHAT", <Chat/>, "chat"]
        ]

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
                    <Box sx={{flexGrow: 1}}>
                        <AppBar position="static">
                            <Toolbar sx={{justifyContent: "space-between"}}>
                                <Toolbar>

                                    <Typography variant="h6" component="div">
                                        [logo] Name
                                    </Typography>

                                    <SearchBar>
                                        <SearchIconWrapper>
                                            <Search/>
                                        </SearchIconWrapper>
                                        <StyledInputBase
                                            placeholder="Search…"
                                            inputProps={{'aria-label': 'search'}}
                                        />
                                    </SearchBar>
                                </Toolbar>

                                <Tabs
                                    value={this.state.tab}
                                    onChange={(e, n) => this.setState({tab: n})}
                                    aria-label="page tabs"
                                >

                                    {
                                        this.tabs.map((data, index) => {
                                            return <TabsLink sx={{
                                                width: "8em"
                                            }} label={data[0]} key={data[0]} icon={data[1]} value={data[2]} wrapped/>
                                        })
                                    }
                                </Tabs>
                                <Link to={"login"}>
                                    <Button className={"noTD"} size={"large"} vaiant={"contained"} onClick={() => this.setState({tab: "login"})}>
                                        Login & SignUp
                                    </Button>
                                </Link>
                            </Toolbar>
                        </AppBar>
                    </Box>
                    <Outlet changePage={this.changePage}/>
                </Paper>
            </ThemeProvider>
        );
    }
}

export default App;
