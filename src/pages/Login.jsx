import {Component} from "react";
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
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import VerificationInput from "react-verification-input";
import "../styles/Login.css";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import GoogleLogo from "../res/img/Google Logo.svg";


class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            state: "login",
            showPassword: false,
            username: "",
            email: "",
            verification: "",
            password: "",
            passwordSure: "",
            enableSendCode: true,
            sb: false,
            leftTime: 60
        }
    }


    render() {
        return (
            <Container>
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
                                        <Button
                                            onClick={async () => {
                                                this.setState({sb: true, enableSendCode: false});
                                                for (const i of [...Array(60).keys()].reverse()) {
                                                    this.setState({leftTime: i});
                                                    await new Promise(r => setTimeout(r, 1000));
                                                }
                                                this.setState({enableSendCode: true});
                                            }}
                                            disabled={!this.state.email || !this.state.enableSendCode}
                                        >
                                            {this.state.enableSendCode ? "Get Code" : `${this.state.leftTime}S`}
                                        </Button>
                                        <Snackbar anchorOrigin={{horizontal: "right", vertical: "bottom"}} open={this.state.sb} autoHideDuration={10000} onClose={() => this.setState({sb: false})}>
                                            <Alert onClose={() => this.setState({sb: false})} severity="success" sx={{ width: '100%' }}>
                                                Mail sent!
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
                                    <FormControl variant="outlined" sx={{width: "100%"}}>
                                        <InputLabel htmlFor="login-password-sure">Repeat Password</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            id="login-password-sure"
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
                                            label="Repeat Password"
                                            value={this.state.passwordSure}
                                            onChange={(e) => this.setState({passwordSure: e.target.value})}
                                        />
                                    </FormControl>
                                </Collapse>
                                {this.state.state === "login" ? <Button variant={"outlined"} size={"large"}>
                                    Login
                                </Button> : <Button variant={"contained"} size={"large"}>
                                    Sign Up
                                </Button>}
                            </Stack>

                            <Divider sx={{width: "100%"}}>OR</Divider>

                            <Stack sx={{p: 3}} alignItems={"center"} spacing={2}>
                                <div className="g-signin2"></div>

                                {/*<Card>*/}
                                {/*    <CardActionArea sx={{display: 'flex', flexDirection: 'row'}}>*/}
                                {/*        <CardMedia*/}
                                {/*            component="img"*/}
                                {/*            sx={{width: 50}}*/}
                                {/*            image={GoogleLogo}*/}
                                {/*        />*/}
                                {/*        <CardContent sx={{pl: 0}}>*/}
                                {/*            <Typography sx={{fontSize: "1.25em"}}>*/}
                                {/*                {this.state.state === "login" ? "Login " : "SignUp "} with Google*/}
                                {/*            </Typography>*/}
                                {/*        </CardContent>*/}
                                {/*    </CardActionArea>*/}
                                {/*</Card>*/}
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        )
    }
}

export default Login;
