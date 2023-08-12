import {Component, useContext} from "react";
import {
    IconButton,
    Avatar,
    alpha,
    Box,
    Button,
    InputBase,
    styled,
    Tabs,
    Toolbar,
    Typography,
    AppBar as ABar,
    Stack,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    ToggleButton,
    ToggleButtonGroup,
    Collapse,
    Paper,
    TextField,
    InputAdornment,
    OutlinedInput,
    InputLabel,
    FormControl,
    Alert,
    Snackbar
} from "@mui/material";
import {
    Chat, Home, LocalMall, Logout, Search,
    ShoppingCart, Settings, Person, ShoppingBasket, Storefront, Check
} from "@mui/icons-material";
import TabsLink from "./TabsLink";
import {Link} from "react-router-dom";
import Requires from "../util/requires";
import cookie from "react-cookies";
import {LoadingButton} from '@mui/lab';

import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import Axios from "axios";


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

class AppBar extends Component {
    constructor(props) {

        super(props);
        this.state = {
            tabs: [
                ["主頁", <Home/>, "home"],
                ["BUY", <LocalMall/>, "buy"],
            ],
            tab: "home",
            login: false,
            menu: false,
            logoutDia: false,
            settingDia: false,
            settingVal: "buy",
            gettingLocation: false,
            position: [-1, -1],
            HKID: "",
            vat: "",
            doneing: false,

            // sb
            sb: false,
            sbS: "",
            sbMsg: "",
        }
    }

    async componentDidMount() {
        let res = await Requires.get("/users/test");
        if (res.status === 200) {
            this.setState({login: true, data: res.data, settingDia: !res.data.type});
            if (res.data.type === "sell") {
                this.setState({
                    tabs: [
                        ...this.state.tabs,
                        ["My Shop", <Storefront/>, "shop"],
                    ]
                })
            }
        }
    }

    async logout() {
        cookie.remove("jwt");
        window.location.reload();
    }

    async getLocation() {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX;
        let positions;
        if ("geolocation" in navigator) {
            this.setState({
                gettingLocation: true
            });
            navigator.geolocation.getCurrentPosition(position => {
                positions = [position.coords.longitude, position.coords.latitude]
                this.setState({
                    gettingLocation: false,
                    position: positions
                })
            });
        } else {
            positions = [-1, -1]
        }
    }
    checkHKID(idno) { // Check vat code
        var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let i, a, d, sum = 0, s = "";
        if (idno.length != 7) return;

        function valid(idno) {	// A123456
            var a = idno.charAt(0).toUpperCase();
            if (idno.length != 7 || a < "A" || a > "Z") return 0;
            for (i = 1; i < idno.length; i++)
                if (idno.charAt(i) < "0" || idno.charAt(i) > "9") return 0;
            return 1;
        }

        if (valid(idno) == 1) {
            a = idno.charAt(0).toUpperCase();
            sum = 58 * 9 + (alpha.indexOf(a) + 10) * 8;
            s = "58*9 +" + (alpha.indexOf(a) + 10) + "*8"
            for (i = 1; i <= 6; i++) {
                sum += idno.charAt(i) * (8 - i);
                s += " + " + idno.charAt(i) + "*" + (8 - i);
            }

            d = sum % 11;
            if (d == 0) d = "0";
            else if (d == 1) d = "A";
            else d = 11 - d;
            return d;
        }
    }
    async done () {
        if (!(this.state.settingVal === "sell" && !(this.state.fn && this.state.ln && String(this.checkHKID(this.state.HKID)) === this.state.vat.toString() && this.state.shopname && !this.state.position.includes(-1)))) {
            this.setState({doneing: true});
            const res = await Requires.post("/users/done", {
                type: this.state.settingVal,
                ...this.state
            })
            if (res.status === 200) {
                this.setState({
                    doneing: false,
                    settingDia: false,
                })
                if (res.data.sell) {
                    this.setState({
                        tabs: [
                            ["My Shop", <Storefront/>, "shop"],
                            ...this.state.tabs
                        ]
                    })
                }
            } else {
                this.setState({
                    doneing: false,
                    sb: true, sbS: "error", sbMsg: res.data.error_description
                })
            }
        }
    }

    render() {
        return (
            <Box sx={{flexGrow: 1}}>
                <Snackbar anchorOrigin={{horizontal: "right", vertical: "bottom"}}
                          open={this.state.sb} autoHideDuration={10000}
                          onClose={() => this.setState({sb: false})}>
                    <Alert onClose={() => this.setState({sb: false})}
                           severity={this.state.sbS}
                           sx={{width: '100%'}}>
                        {this.state.sbMsg}
                    </Alert>
                </Snackbar>
                <Dialog open={this.state.settingDia} maxWidth={"xl"}>
                    <DialogContent>
                        <Typography variant={"h4"}>
                            Let us know what you are doing there...
                        </Typography>
                        <Stack sx={{
                            mt: "2em",
                            width: "100%"
                        }} alignItems={"center"}>
                            <ToggleButtonGroup
                                value={this.state.settingVal}
                                exclusive
                                onChange={(e, n) => this.setState({settingVal: n})}
                            >
                                <ToggleButton value="buy" sx={{
                                    flexDirection: "column"
                                }}>
                                    <ShoppingBasket sx={{
                                        fontSize: "5em"
                                    }}/>
                                    <Typography>
                                        I'm a buyer
                                    </Typography>
                                </ToggleButton>
                                <ToggleButton value="sell" sx={{
                                    flexDirection: "column"
                                }}>
                                    <Storefront sx={{
                                        fontSize: "5em"
                                    }}/>
                                    <Typography>
                                        I'm a seller
                                    </Typography>
                                </ToggleButton>
                            </ToggleButtonGroup>
                            <Collapse in={this.state.settingVal === "sell"}>
                                <Paper sx={{
                                    p: 2, mt: 2
                                }}>
                                    <Stack spacing={2} alignItems={"center"}>
                                        <Stack direction={"row"} spacing={2}>
                                            <TextField
                                                required
                                                label="Real First name"
                                                value={this.state.fn}
                                                onChange={(e) => this.setState({fn: e.target.value})}
                                            />
                                            <TextField
                                                required
                                                label="Real Last name"
                                                value={this.state.ln}
                                                onChange={(e) => this.setState({ln: e.target.value})}
                                            />
                                        </Stack>

                                        <Stack direction={"row"} spacing={2}>
                                            <FormControl>
                                                <InputLabel
                                                    error={String(this.checkHKID(this.state.HKID)) !== this.state.vat.toString()}
                                                    htmlFor="ohkid-input"
                                                >HKID*</InputLabel>
                                                <OutlinedInput
                                                    id={"hkid-input"}
                                                    required
                                                    error={String(this.checkHKID(this.state.HKID)) !== this.state.vat.toString()}
                                                    label="HKID"
                                                    onChange={(e) => this.setState({HKID: e.target.value})}
                                                    sx={{
                                                        width: "14em"
                                                    }}
                                                    endAdornment={<InputAdornment position="end">
                                                        <Typography color={String(this.checkHKID(this.state.HKID)) !== this.state.vat.toString() ? "error" : "white"}>(</Typography>
                                                        <InputBase
                                                            sx={{
                                                                width: "1em",
                                                                "*": {
                                                                    textAlign: "center",
                                                                }
                                                            }}
                                                            onChange={(e) => this.setState({vat: e.target.value})}
                                                        />
                                                        <Typography color={String(this.checkHKID(this.state.HKID)) !== this.state.vat.toString() ? "error" : "white"}>)</Typography>
                                                    </InputAdornment>}
                                                />
                                            </FormControl>
                                            <TextField
                                                required
                                                label="Shop name"
                                                value={this.state.shopname}
                                                onChange={(e) => this.setState({shopname: e.target.value})}
                                            />
                                        </Stack>
                                        {this.state.position.includes(-1) ?
                                            <LoadingButton loading={this.state.gettingLocation} fullWidth
                                                           onClick={async () => await this.getLocation()}>
                                                Get my location
                                            </LoadingButton> :
                                            <Typography color={"grey"} display={"flex"} flexDirection={"column"}
                                                        alignItems={"center"}>
                                                <Check color={"success"}/>
                                                {this.state.position.toString()}
                                            </Typography>}
                                    </Stack>
                                </Paper>
                            </Collapse>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <LoadingButton loading={this.state.doneing} color="success" size={"large"} disabled={
                            this.state.settingVal === "sell" &&
                            !(
                                this.state.fn && this.state.ln &&
                                String(this.checkHKID(this.state.HKID)) === this.state.vat.toString() &&
                                this.state.shopname &&
                                !this.state.position.includes(-1)
                            )
                        } variant={"contained"} onClick={async () => await this.done()}>
                            Done
                        </LoadingButton>
                    </DialogActions>
                </Dialog>
                <ABar position="static">
                    <Toolbar sx={{justifyContent: "space-between"}}>
                        <Stack direction={"row"}>
                            <Toolbar>

                                <Typography variant="h6" component="div">
                                    [logo] 買D餸
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
                                    this.state.tabs.map((data, index) => {
                                        return <TabsLink sx={{
                                            width: "8em"
                                        }} label={data[0]} key={data[0]} icon={data[1]} value={data[2]} wrapped/>
                                    })
                                }
                            </Tabs>
                        </Stack>

                        {this.state.login ? <>
                            <IconButton sx={{p: 0}} onClick={() => this.setState({menu: true})}>
                                <Avatar alt={this.state.data.username} src={this.state.data.photoURL}/>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={this.state.menu}
                                onClose={() => this.setState({menu: false})}
                                sx={{
                                    pt: "0"
                                }}
                            >
                                <Stack direction={"row"} alignItems={"flex-end"} sx={{
                                    m: "1em",
                                    height: "5em",
                                    width: "100%"
                                }} spacing={3}>
                                    <Stack>
                                        <Typography color={"grey"}>
                                            Welcome,
                                        </Typography>
                                        <Typography variant={this.state.data.username.length > 8 ? "h3" : "h2"}>
                                            {this.state.data.username}
                                        </Typography>
                                    </Stack>
                                    <Avatar alt={this.state.data.username} src={this.state.data.photoURL} sx={{
                                        height: "4em",
                                        width: "4em"
                                    }}/>
                                </Stack>

                                <Divider sx={{m: "0.5em"}}/>

                                <MenuItem onClick={() => this.setState({menu: false})}>
                                    <ListItemIcon>
                                        <Person/>
                                    </ListItemIcon>
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={() => this.setState({menu: false})}>
                                    <ListItemIcon>
                                        <ShoppingCart/>
                                    </ListItemIcon>
                                    Cart
                                </MenuItem>
                                <MenuItem onClick={() => this.setState({menu: false})}>
                                    <ListItemIcon>
                                        <Settings/>
                                    </ListItemIcon>
                                    Setting
                                </MenuItem>

                                <Divider sx={{m: "0.5em"}}/>

                                <MenuItem onClick={() => this.setState({menu: false, logoutDia: true})}>
                                    <ListItemIcon>
                                        <Logout color={"error"}/>
                                    </ListItemIcon>
                                    <Typography color={"error"}>
                                        Logout
                                    </Typography>
                                </MenuItem>
                                <Dialog open={this.state.logoutDia}>
                                    <DialogTitle>
                                        Logout Confirm
                                    </DialogTitle>
                                    <DialogContent>
                                        Are you sure to logout?
                                    </DialogContent>
                                    <DialogActions>
                                        <Button variant={"text"} onClick={() => this.setState({logoutDia: false})}>
                                            Cancel
                                        </Button>
                                        <Button color={"error"} variant={"contained"} onClick={this.logout}>
                                            Confirm
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </Menu>
                        </> : <Link to={"login"}>
                            <Button className={"noTD"} size={"large"} vaiant={"contained"}
                                    onClick={() => this.setState({tab: "login"})}>
                                Login & SignUp
                            </Button>
                        </Link>}

                    </Toolbar>
                </ABar>
            </Box>
        )
    }
}

export default AppBar;
