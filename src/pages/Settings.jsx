import React, {Component} from "react";
import Requires from "../util/requires";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader, Checkbox,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, FormControlLabel, IconButton, Snackbar,
    Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip,
    Typography
} from "@mui/material";
import {uploader} from "../util/functions";
import {UploadButton} from "react-uploader";
import {Check, Dashboard, Delete, Edit, FormatListBulleted, Help} from "@mui/icons-material";

export default class Settings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            backUser: null,
            isHove: false,
            edit: false,
            ratingFilter: window.localStorage.getItem("ratingFilter") === "true",
            display: window.localStorage.getItem("display") === "list" ? "list": "card",

            // sb
            sb: false,
            sbS: "",
            sbMsg: "",
        };
    }

    async componentDidMount() {
        let user = await Requires.get("/users/test");
        if (user.status === 200) {
            this.setState({user: user.data, backUser: user.data})
        } else {
            window.location.hash = "/login"
        }
    }

    updateUser = async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        let res = await Requires.put("/users/update", {
            type: "user",
            update: {
                photoURL: this.state.user.photoURL,
                username: this.state.user.username,
            }
        });
        if (res.status === 200) {
            this.setState({
                sb: true,
                sbS: "success",
                sbMsg: res.data.msg,
                backUser: this.state.user,
            })
        } else {
            this.setState({
                sb: true,
                sbS: "error",
                sbMsg: res.data.error_description,
                user: this.state.backUser,
            })
        }
    }

    render() {
        return <Stack width={"calc(100% - 8em)"} height={"90vh"} alignItems={"center"} justifyContent={"center"}
                      px={"4em"}>

            <Snackbar anchorOrigin={{horizontal: "right", vertical: "bottom"}}
                      open={this.state.sb} autoHideDuration={10000}
                      onClose={() => this.setState({sb: false})}
            >
                <Alert onClose={() => this.setState({sb: false})}
                       severity={this.state.sbS}
                       sx={{width: '100%'}}>
                    {this.state.sbMsg}
                </Alert>
            </Snackbar>
            {this.state.user ? <Card variant={"outlined"} sx={{width: "60%", p: 5}}>
                <CardHeader
                    title={<Typography variant={"h2"} textAlign={"center"}>Settings</Typography>}
                />
                <Divider/>
                <CardContent>
                    <Stack width={"100%"} alignItems={"center"} spacing={2}>

                        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} width={"100%"}>
                            <Typography variant={"h4"}>
                                Avatar:
                            </Typography>
                            <UploadButton
                                uploader={uploader}
                                options={{multi: false}}
                                onComplete={async files => {
                                    this.setState({
                                        user: {
                                            ...this.state.user,
                                            photoURL: files.length === 0 ? this.state.user.photoURL : files[0].fileUrl,
                                        }
                                    });
                                    await this.updateUser();
                                }}>
                                {({onClick}) =>
                                    <Box sx={{position: "relative", cursor: "pointer"}}
                                         onMouseEnter={() => this.setState({isHover: true})}
                                         onMouseLeave={() => this.setState({isHover: false})}
                                         onClick={onClick}
                                    >
                                        <Avatar
                                            src={this.state.user.photoURL}
                                            alt={this.state.username}
                                            sx={{
                                                width: "4em",
                                                height: "4em",
                                                transition: "filter 0.5s",
                                                filter: this.state.isHover ? "brightness(0.5)" : ""
                                            }}
                                        />
                                        <Typography sx={{
                                            position: "absolute",
                                            textAlign: "center",
                                            width: "100%",
                                            top: "25%",
                                            zIndex: 99,
                                            opacity: this.state.isHover ? 1 : 0,
                                            transition: "opacity 0.5s"
                                        }}>Change Avatar</Typography>
                                    </Box>
                                }
                            </UploadButton>
                        </Stack>
                        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} width={"100%"}>
                            <Typography variant={"h4"}>
                                Username:
                            </Typography>
                            <Stack direction={"row"} alignItems={"center"}>
                                {this.state.edit ?
                                    <TextField
                                        value={this.state.user.username}
                                        onChange={(e) => this.setState({
                                                user: {
                                                    ...this.state.user,
                                                    username: e.target.value
                                                }
                                            }
                                        )}
                                    /> :
                                    <Typography variant={"h5"} color={"lightgray"}>
                                        {this.state.user.username}
                                    </Typography>
                                }
                                {this.state.edit ?
                                    <IconButton onClick={async () => {
                                        this.setState({edit: false});
                                        await this.updateUser();
                                    }} disabled={this.state.user.username.length < 1}>
                                        <Check/>
                                    </IconButton> :
                                    <IconButton onClick={() => this.setState({edit: true})}>
                                        <Edit/>
                                    </IconButton>
                                }
                            </Stack>
                        </Stack>
                        <Divider flexItem>顯示設置（僅適用於此設備）</Divider>
                        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} width={"100%"}>
                            <Typography  variant={"h4"}>
                                總是顯示精選評價<Tooltip
                                arrow
                                title={<Typography variant={"h6"}>評價必需附帶照片</Typography>}
                                placement="top"
                            >
                                <Help fontSize={"small"}/>
                            </Tooltip>:
                            </Typography>
                            <Checkbox
                                checked={this.state.ratingFilter}
                                onChange={(e, n) => {
                                    window.localStorage.setItem("ratingFilter", n);
                                    this.setState({ ratingFilter: n })
                                }}
                            />
                        </Stack>
                        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} width={"100%"}>
                            <Typography variant={"h4"}>
                                顯示類型:
                            </Typography>
                            <ToggleButtonGroup
                                value={this.state.display}
                                onChange={(e, n) => {
                                    this.setState({display: n === null ? this.state.display : n});
                                    window.localStorage.setItem("display", n === null ? this.state.display : n)
                                }}
                                exclusive
                            >
                                <ToggleButton value={"list"}>
                                    <FormatListBulleted/>
                                </ToggleButton>
                                <ToggleButton value={"card"}>
                                    <Dashboard/>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>
                        <Divider flexItem>信息<Typography color={"error"}>（只能在注銷帳戶後才能更改）</Typography></Divider>
                        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} width={"100%"}>
                            <Typography variant={"h4"}>
                                帳戶類型:
                            </Typography>
                            <Typography variant={"h5"} color={"lightgray"}>
                                {this.state.user.google ? "Google" : "Email"}
                            </Typography>
                        </Stack>
                        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} width={"100%"}>
                            <Typography variant={"h4"}>
                                用戶類型:
                            </Typography>
                            <Typography variant={"h5"} color={"lightgray"}>
                                {this.state.user.type==="shop" ? "商家" : "買家"}
                            </Typography>
                        </Stack>
                        <Button onClick={() => this.setState({
                            deleteDl: true,
                            deleteName: "",
                            deleteCountDown: "-"
                        })} startIcon={<Delete/>} variant={"contained"} color={"error"}>
                            注銷帳戶
                        </Button>
                        <Dialog open={this.state.deleteDl} onClose={() => this.setState({deleteDl: false})}>
                            <DialogTitle>
                                <Typography variant={"h3"} color={"error"}>
                                    您確定要注銷此帳戶嗎<br/>您無法撤消此操作
                                </Typography>
                            </DialogTitle>
                            <DialogContent>
                                <TextField
                                    label={`請輸入該帳戶的名稱 [ ${this.state.user.username} ] 進行確認`}
                                    value={this.state.deleteName}
                                    onChange={(e) => {
                                        let text = e.target.value;
                                        this.setState({deleteName: text});

                                        if (text === this.state.user.username) {
                                            this.setState({deleteCountDown: 5});
                                            setTimeout(() => {
                                                this.setState({deleteCountDown: 4});
                                                if (this.state.deleteName === this.state.user.username) {
                                                    setTimeout(() => {
                                                        this.setState({deleteCountDown: 3});
                                                        if (this.state.deleteName === this.state.user.username) {
                                                            setTimeout(() => {
                                                                this.setState({deleteCountDown: 2});
                                                                if (this.state.deleteName === this.state.user.username) {
                                                                    setTimeout(() => {
                                                                        this.setState({deleteCountDown: 1});
                                                                        if (this.state.deleteName === this.state.user.username) {
                                                                            setTimeout(() => {
                                                                                this.setState({deleteCountDown: 0});
                                                                                if (this.state.deleteName === this.state.user.username) {

                                                                                } else {
                                                                                    this.setState({deleteCountDown: "-"});
                                                                                }
                                                                            }, 1000)
                                                                        } else {
                                                                            this.setState({deleteCountDown: "-"});
                                                                        }
                                                                    }, 1000)
                                                                } else {
                                                                    this.setState({deleteCountDown: "-"});
                                                                }
                                                            }, 1000)
                                                        } else {
                                                            this.setState({deleteCountDown: "-"});
                                                        }
                                                    }, 1000)
                                                } else {
                                                    this.setState({deleteCountDown: "-"});
                                                }
                                            }, 1000)
                                        }
                                    }}
                                    error={this.state.deleteName !== this.state.user.username}
                                    sx={{mt: 2}}
                                    fullWidth
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={(e) => this.setState({deleteDl: false})}
                                    color={"error"}
                                    variant={"text"}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size={"large"}
                                    color={"error"}
                                    variant={"contained"}
                                    disabled={this.state.deleteCountDown > 0 || "-" === this.state.deleteCountDown}
                                    onClick={async () => {
                                        // TODO delte user
                                    }}
                                >
                                    注銷{![0, "-"].includes(this.state.deleteCountDown) && <> ({this.state.deleteCountDown}s)</>}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Stack>
                </CardContent>
            </Card> : <CircularProgress sx={{fontSize: "5rem"}}/>}

        </Stack>
    }
}