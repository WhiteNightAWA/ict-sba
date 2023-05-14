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
    Typography
} from "@mui/material";
import { LoadingButton } from '@mui/lab';
import VerificationInput from "react-verification-input";
import "../styles/Login.css";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import GoogleLoginButton from "../components/GoogleLoginButton";
import Axios from "axios";


class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            state: "login",
            showPassword: false,
            username: "",
            verification: "",
            password: "",
            passwordSure: "",

            // email ver
            email: "",
            enableSendCode: true,
            sb: false,
            sbS: "",
            sbMsg: "",
            leftTime: 60,
            emailCorrect: true,
            sendingMail: false,
        }
    }

    sendEmail = async () => {
        this.setState({sendingMail: true, enableSendCode: false});
        try {
            let res = await Axios.post("https://p01--server--p5rzjcrgjpvy.code.run/auth/code", {
                email: this.state.email
            });

            this.setState({sb: true, sbS: res.data.severify, sbMsg: res.data.msg, sendingMail: false});
        } catch (e) {
            let res = e.response;

            this.setState({sb: true, sbS: res.data.severify, sbMsg: res.data.msg, sendingMail: false});
        }


        for (const i of [...Array(60).keys()].reverse()) {
            this.setState({leftTime: i});
            await new Promise(r => setTimeout(r, 1000));
        }
        this.setState({enableSendCode: true});
    }

    render() {
        return (
            <Container sx={{p: 5}}>
                <Button onClick={() => console.log(this.state)}>state</Button>
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
                                        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                        let r = re.test(this.state.email);
                                        this.setState({
                                            emailCorrect: r
                                        });
                                    }}
                                    error={!this.state.emailCorrect}
                                    helperText={this.state.emailCorrect?"":"Invalid Email"}
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
                                                !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.state.email)}
                                        >
                                            {this.state.enableSendCode ? "Get Code" : `${this.state.leftTime}S`}
                                        </LoadingButton>
                                        <Snackbar anchorOrigin={{horizontal: "right", vertical: "bottom"}}
                                                  open={this.state.sb} autoHideDuration={10000}
                                                  onClose={() => this.setState({sb: false})}>
                                            <Alert onClose={() => this.setState({sb: false})} severity={this.state.sbS}
                                                   sx={{width: '100%'}}>
                                                {this.state.sbMsg}
                                            </Alert>
                                        </Snackbar>
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
                                        error={this.state.password !== this.state.passwordSure} variant="outlined" sx={{width: "100%"}}>
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
                                            error={this.state.password !== this.state.passwordSure}>{this.state.password===this.state.passwordSure?"":"Password didn't match!"}</FormHelperText>
                                    </FormControl>
                                </Collapse>
                                <Typography color={"grey"}>
                                    By clicking the "{this.state.state === "login" ? "Login" : "Sign Up"}" button you
                                    are agreeing to the <Button
                                    variant={"text"}
                                    onClick={() => window.open("https://whitenightawa.github.io/ict-sba/#/pp", "Privacy Policy", "width=700, height=400")}
                                >Privacy Policy</Button>.
                                </Typography>
                                {this.state.state === "login" ? <Button variant={"outlined"} size={"large"}>
                                    Login
                                </Button> : <Button variant={"contained"} size={"large"}>
                                    Sign Up
                                </Button>}
                            </Stack>

                            <Divider sx={{width: "100%"}}>OR</Divider>

                            <Stack sx={{p: 3}} alignItems={"center"} spacing={2}>
                                <GoogleLoginButton state={this.state.state} logined/>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        )
    }
}

export default Login;
