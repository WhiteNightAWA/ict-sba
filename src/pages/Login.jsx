import React, {Component} from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent, Collapse,
    Container, Divider, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Snackbar,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup, FormHelperText,
    Typography, Avatar
} from "@mui/material";
import {LoadingButton, TabPanel, TabContext} from '@mui/lab';
import VerificationInput from "react-verification-input";
import "../styles/Login.css";
import {OpenInNew, Visibility, VisibilityOff} from "@mui/icons-material";
import GoogleLoginButton from "../components/GoogleLoginButton";
import Requires from "../util/requires";
import cookie from "react-cookies";


class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Normal Pages
            state: "login",
            email: "",
            password: "",
            showPassword: false,

            // register
            username: "",
            verification: "",
            passwordSure: "",
            registering: false,

            // email ver
            enableSendCode: true,
            leftTime: 60,
            emailCorrect: true,
            sendingMail: false,

            // sb
            sb: false,
            sbS: "",
            sbMsg: "",

            // Google
            page: "login",
            google: {},
            googleData: {            },
        }
    }

    async componentDidMount() {
        let res = await Requires.get("/users/test");
        if (res.status === 200) {
            console.log("logined");
        }
    }

    sendEmail = async () => {
        this.setState({sendingMail: true, enableSendCode: false});

        const res = await Requires.post("/auth/code", {
            email: this.state.email
        })

        this.setState({sb: true, sbS: res.data.severify, sbMsg: res.data.msg, sendingMail: false});

        for (const i of [...Array(60).keys()].reverse()) {
            this.setState({leftTime: i});
            await new Promise(r => setTimeout(r, 1000));
        }
        this.setState({enableSendCode: true});
    };
    register = async () => {
        const {username, email, verification: code, password} = this.state;
        this.setState({
            registering: true,
        });
        const res = await Requires.post("/auth/register", {
            username, email, code, password
        });

        if (res.status === 200) {
            this.setState({
                registering: false,
                sb: true, sbS: "success", sbMsg: res.data.msg + "logging in...",
                state: "login"
            });
            await this.login();
        } else {
            this.setState({
                registering: false,
                sb: true, sbS: "error", sbMsg: res.data.error_description
            });
        }
    };
    login = async () => {
        const {email, password} = this.state;

        this.setState({
            registering: true,
        });

        const res = await Requires.post("/auth/login", {
            email, password
        });

        if (res.status === 200) {
            this.setState({
                registering: false,
            });
            window.location.hash = "";
            window.location.reload();
        } else {
            this.setState({
                registering: false,
                sb: true, sbS: "error", sbMsg: res.data.error_description
            });
        }
    };
    google = async (data, tokenResponse) => {
        console.log(data);
        this.setState({
            page: this.state.state,
            google: tokenResponse,
            googleData: data,
        })
    };
    googleLogin = async () => {
        this.setState({
            registering: true,
        });

        const res = await Requires.post("/auth/login", {
            google: this.state.google
        });

        if (res.status === 200) {
            this.setState({
                registering: false,
            });
            window.location.hash = "";
            window.location.reload();
        } else {
            this.setState({
                registering: false,
                sb: true, sbS: "error", sbMsg: res.data.error_description,
                page: "normal", google: {}, googleData: {}
            });
        }
    }
    googleSignup = async () => {
        this.setState({
            registering: true,
        });

        const res = await Requires.post("/auth/register", {
            google: this.state.google
        });

        if (res.status === 200) {
            this.setState({
                registering: false,
                page: "normal",
                sb: true, sbS: "success", sbMsg: res.data.msg + "logging in...",
                state: "login"
            });
            await this.googleLogin();
        } else {
            this.setState({
                registering: false,
                sb: true, sbS: "error", sbMsg: res.data.error_description,
                page: "normal",
                google: {}, googleData: {}
            });
        }
    }


    render() {
        return (
            <Container sx={{p: 5, overflowY: "scroll", maxHeight: "90vh"}} className={"scrollBar"}>
                <Snackbar anchorOrigin={{horizontal: "right", vertical: "bottom"}}
                          open={this.state.sb} autoHideDuration={10000}
                          onClose={() => this.setState({sb: false})}>
                    <Alert onClose={() => this.setState({sb: false})}
                           severity={this.state.sbS}
                           sx={{width: '100%'}}>
                        {this.state.sbMsg}
                    </Alert>
                </Snackbar>
                <Button onClick={() => console.log(this.state)}>state</Button>
                <Button onClick={() => Requires.get("/users/test")}>test</Button>
                <Stack spacing={5} textAlign={"center"} sx={{m: 5}} alignItems={"center"}>
                    <Collapse in={this.state.state === "login"} className={"noM"}>
                        <Typography variant={"h2"}>
                            Welcome Back!
                        </Typography>
                    </Collapse>
                    <Collapse in={this.state.state !== "login"} className={"noM"}>
                        <Typography variant={"h2"}>
                            Join Us!
                        </Typography>
                    </Collapse>
                    <Card variant="outlined" sx={{
                        minWidth: "60%",
                    }}>
                        <CardContent>
                            {this.state.page === "normal" && <>
                                <Stack sx={{p: 3}} alignItems={"center"} spacing={2}>
                                    <ToggleButtonGroup
                                        value={this.state.state}
                                        onChange={(e, c) => {
                                            this.setState({state: c === null ? this.state.state : c});
                                        }}
                                        exclusive
                                    >
                                        <ToggleButton value={"login"}>
                                            &nbsp;Login
                                        </ToggleButton>
                                        <ToggleButton value={"signup"}>
                                            SignUp
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                    <Collapse in={this.state.state === "signup"} className={"noM"} sx={{width: "100%"}}>
                                        <Box sx={{mt: 2}}/>
                                        <TextField
                                            label="Username"
                                            variant="outlined"
                                            fullWidth
                                            value={this.state.username}
                                            onChange={(e) => this.setState({username: e.target.value})}
                                        />
                                    </Collapse>
                                    <TextField
                                        label="Email Address"
                                        variant="outlined"
                                        fullWidth
                                        value={this.state.email}
                                        onChange={(e) => this.setState({email: e.target.value})}
                                        onBlur={(e) => {
                                            // eslint-disable-next-line
                                            let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                            let r = re.test(this.state.email);
                                            this.setState({
                                                emailCorrect: r
                                            });
                                        }}
                                        error={!this.state.emailCorrect}
                                        helperText={this.state.emailCorrect ? "" : "Invalid Email"}
                                    />
                                    <Collapse in={this.state.state === "signup"} className={"noM"}>
                                        <Box sx={{mt: 2}}/>
                                        <Stack direction={"row"} spacing={3}>
                                            <VerificationInput
                                                validChars={"0-9"}
                                                length={8}
                                                classNames={{
                                                    container: "verContainer",
                                                    character: "verCharacter",
                                                    characterInactive: "verCharacter--inactive",
                                                    characterSelected: "verCharacter--selected",
                                                }}
                                                value={this.state.verification}
                                                onChange={(v) => this.setState({verification: v})}
                                            />
                                            <LoadingButton
                                                loading={this.state.sendingMail}
                                                onClick={this.sendEmail}
                                                disabled={!this.state.email || !this.state.enableSendCode || !this.state.emailCorrect ||
                                                    // eslint-disable-next-line
                                                    !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.state.email)}
                                            >
                                                {this.state.enableSendCode ? "Get Code" : `${this.state.leftTime}S`}
                                            </LoadingButton>
                                        </Stack>
                                    </Collapse>
                                    <FormControl variant="outlined" sx={{width: "100%"}}>
                                        <InputLabel htmlFor="login-password">Password</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="login-password"
                                            type={this.state.showPassword ? "text" : "password"}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={(e) => this.setState({showPassword: !this.state.showPassword})}
                                                        edge="end"
                                                    >
                                                        {this.state.showPassword ? <VisibilityOff/> : <Visibility/>}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            label="Password"
                                            value={this.state.password}
                                            onChange={(e) => this.setState({password: e.target.value})}
                                        />
                                    </FormControl>

                                    <Collapse in={this.state.state === "signup"} sx={{width: "100%"}} className={"noM"}>
                                        <Box sx={{mt: 2}}/>
                                        <FormControl
                                            error={this.state.password !== this.state.passwordSure} variant="outlined"
                                            sx={{width: "100%"}}>
                                            <InputLabel htmlFor="login-password-sure">Repeat Password</InputLabel>
                                            <OutlinedInput
                                                fullWidth
                                                id="login-password-sure"
                                                type={this.state.showPassword ? "text" : "password"}
                                                error={this.state.password !== this.state.passwordSure}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={(e) => this.setState({showPassword: !this.state.showPassword})}
                                                            edge="end"
                                                        >
                                                            {this.state.showPassword ? <VisibilityOff/> : <Visibility/>}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                                label="Repeat Password"
                                                value={this.state.passwordSure}
                                                onChange={(e) => this.setState({passwordSure: e.target.value})}
                                            />
                                            <FormHelperText
                                                error={this.state.password !== this.state.passwordSure}>{this.state.password === this.state.passwordSure ? "" : "Password didn't match!"}</FormHelperText>
                                        </FormControl>
                                    </Collapse>
                                    <Typography color={"grey"}>
                                        By clicking the "{this.state.state === "login" ? "Login" : "Sign Up"}" button
                                        you
                                        are agreeing to the <a style={{
                                        color: "lightBlue",
                                        cursor: "pointer"
                                    }}
                                                               onClick={() => window.open("https://whitenightawa.github.io/ict-sba/#/pp", "Privacy Policy", "width=700, height=400")}
                                    >Privacy Policy<OpenInNew sx={{
                                        fontSize: "1em"
                                    }}/></a>.
                                    </Typography>
                                    {this.state.state === "login" ? <LoadingButton
                                        variant={"outlined"}
                                        size={"large"}
                                        disabled={!(this.state.email && this.state.password)}
                                        onClick={this.login}
                                        loading={this.state.registering}
                                    >
                                        Login
                                    </LoadingButton> : <LoadingButton variant={"contained"} size={"large"} disabled={
                                        !(this.state.username && this.state.email && this.state.verification && this.state.password && this.state.passwordSure
                                            && (this.state.password === this.state.passwordSure)
                                            // eslint-disable-next-line
                                            && /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.state.email)
                                        )
                                    } onClick={this.register} loading={this.state.registering}>
                                        Sign Up
                                    </LoadingButton>}
                                </Stack>
                                <Divider sx={{width: "100%"}}>OR</Divider>

                                <Stack sx={{p: 3}} alignItems={"center"} spacing={2}>
                                    <GoogleLoginButton disabled={this.state.registering} state={this.state.state}
                                                       logined
                                                       google={this.google}/>
                                </Stack>
                            </>
                            }
                            {["login", "signup"].includes(this.state.page) &&

                                <Stack alignItems={"center"} justifyContent={"center"} spacing={2}>
                                    <Avatar sx={{
                                        width: "8em",
                                        height: "8em",
                                        boxShadow: "rgba(255,255,255,0.125) 5px 5px 1em 0.125em"
                                    }} alt={this.state.googleData.name} src={this.state.googleData.picture}/>
                                    <Typography variant={"h2"}>
                                        {this.state.googleData.name}
                                    </Typography>
                                    <Typography color={"grey"}>
                                        email: {this.state.googleData.email}
                                    </Typography>
                                    <Typography variant={"h5"}>
                                        Are you sure using this account to {this.state.page}?
                                    </Typography>
                                    <Typography color={"grey"}>
                                        By clicking the "CONFIRM" button
                                        you
                                        are agreeing to the <a style={{
                                        color: "lightBlue",
                                        cursor: "pointer"
                                    }} onClick={() => window.open("https://whitenightawa.github.io/ict-sba/#/pp", "Privacy Policy", "width=700, height=400")}
                                    >Privacy Policy<OpenInNew sx={{
                                        fontSize: "1em"
                                    }}/></a>.
                                    </Typography>
                                    <Stack direction={"row"} spacing={5}>
                                        <LoadingButton loading={this.state.registering} color={"error"} variant={"text"} size={"large"}
                                                onClick={(e) => this.setState({
                                                    page: "normal",
                                                    google: {},
                                                    googleData: {}
                                                })}>
                                            Cancel
                                        </LoadingButton><LoadingButton
                                        loading={this.state.registering}
                                        color={"success"}
                                        variant={"contained"}
                                        size={"large"}
                                        onClick={() => this.state.page === "login" ? this.googleLogin() : this.googleSignup()}
                                    >
                                        Confirm
                                    </LoadingButton>
                                    </Stack>
                                </Stack>
                            }
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        )
    }
}

export default Login;
