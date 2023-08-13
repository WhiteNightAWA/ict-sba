import React, {Component} from "react";
import {
    Alert,
    Avatar,
    Box, Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Container, IconButton, InputAdornment, OutlinedInput,
    Paper, Snackbar,
    Stack, TextField, Tooltip,
    Typography
} from "@mui/material";
import Requires from "../util/requires";
import {autoPlay} from 'react-swipeable-views-utils';
import SwipeableViews from 'react-swipeable-views';
import Pagination from "../components/Pagination";
import {LoadingButton, Rating} from "@mui/lab";
import {Clear, LocalPhone} from "@mui/icons-material";

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export default class Shop extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            imgIndex: 0,
            editing: false,
            loading: false,
            uploadedPhoto: null,

            // sb
            sb: false,
            sbS: "",
            sbMsg: "",
        };
    }


    async componentDidMount() {
        let res = await Requires.get("/users/test");
        if (res.status === 200) {
            if (res.data.type !== "sell") {
                window.location.href = "/#/";
            } else {
                this.setState({
                    user: {...res.data},
                })
            }
        } else {
            window.location.href = "/#/login";
        }
    }

    handleFileInputChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (event) => {
                const uploadedPhoto = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    dataURL: event.target.result,
                };

                this.setState({uploadedPhoto});
            };

            reader.readAsDataURL(file);
        }
    };

    save = async () => {
        this.setState({
            loading: true,
        });

        const res = await Requires.post("/users/update", this.state.user);

        if (res.status === 200) {
            this.setState({
                loading: false,
                editing: false,
                sb: true, sbS: "success", sbMsg: "Update Successfully."
            });

        } else {
            this.setState({
                loading: false,
                sb: true, sbS: "error", sbMsg: res.data.error_description
            });
        }

    }

    render() {
        return (
            <Box sx={{
                width: "calc(100vw - 7em)",
                p: "3em",
                maxHeight: "80vh",
                overflowY: "scroll",
                // bgcolor: "rgba(255,255,255,0.125)",
                borderRadius: 2,
            }} className={"scrollBar"}>
                <Button onClick={() => console.log(this.state)}>state</Button>

                <Snackbar anchorOrigin={{horizontal: "right", vertical: "bottom"}}
                          open={this.state.sb} autoHideDuration={10000}
                          onClose={() => this.setState({sb: false})}>
                    <Alert onClose={() => this.setState({sb: false})}
                           severity={this.state.sbS}
                           sx={{width: '100%'}}>
                        {this.state.sbMsg}
                    </Alert>
                </Snackbar>
                <Stack alignItems={"center"}>
                    <Card sx={{
                        bgcolor: "rgba(255,255,255,0.01)",
                        minWidth: "80vw"
                    }}>
                        {
                            (this.state.user.shopData?.shopPhotos?.length !== 0 || this.state.editing) &&
                            <Box sx={{position: 'relative', filter: "drop-shadow(2px 4px 6px black)"}}>
                                <AutoPlaySwipeableViews index={this.state.imgIndex}
                                                        onChangeIndex={(i) => this.setState({imgIndex: i})}
                                >
                                    {
                                        this.state.user.shopData?.shopPhotos?.map((url, index) => {
                                            return (
                                                <CardMedia
                                                    key={index}
                                                    sx={{height: 200}}
                                                    image={url}
                                                    title={url}
                                                />)
                                        })
                                    }
                                </AutoPlaySwipeableViews>
                                <Pagination dots={this.state.user.shopData?.shopPhotos?.length}
                                            index={this.state.imgIndex}
                                            onChangeIndex={(i) => this.setState({imgIndex: i})}/>
                                {this.state.editing && <Box sx={{p: 1}}>
                                    {
                                        this.state.user.shopData?.shopPhotos?.map((img, index) => {
                                            return (<><TextField
                                                variant={"standard"}
                                                value={img}
                                                key={index}
                                                sx={{width: "95%"}}
                                                onChange={(e) => {
                                                    let photos = this.state.user.shopData?.shopPhotos;
                                                    photos[index] = e.target.value;
                                                    this.setState({
                                                        user: {
                                                            ...this.state.user, shopData: {
                                                                ...this.state.user.shopData,
                                                                shopPhotos: photos,
                                                            },
                                                        }
                                                    });
                                                }}
                                            /><IconButton color={"error"} onClick={() => {
                                                let photos = this.state.user.shopData?.shopPhotos;
                                                if (index > -1) {
                                                    photos.splice(index, 1);
                                                }
                                                this.setState({
                                                    user: {
                                                        ...this.state.user, shopData: {
                                                            ...this.state.user.shopData,
                                                            shopPhotos: photos,
                                                        },
                                                    },
                                                });
                                            }}>
                                                <Clear/>
                                            </IconButton></>)
                                        })
                                    }
                                    <Button fullWidth color={"success"} variant={"outlined"} onClick={() => {
                                        let photos = this.state.user.shopData?.shopPhotos;
                                        photos.push("");
                                        this.setState({
                                            user: {
                                                ...this.state.user, shopData: {
                                                    ...this.state.user.shopData,
                                                    shopPhotos: photos,
                                                },
                                            }
                                        });
                                    }}>Add Image</Button>
                                </Box>}
                            </Box>
                        }
                        <CardContent sx={{
                            display: "flex",
                            justifyContent: "center"
                        }}>
                            <Stack alignItems={"center"} spacing={3} width={"80%"}>
                                <Stack direction={"row"} alignItems={"center"} spacing={5} width={"100%"}>
                                    {this.state.editing ? <Box sx={{
                                        position: "relative"
                                    }}>
                                        <TextField
                                            label="Avatar Image Url"
                                            sx={{
                                                top: "40%",
                                                position: "absolute",
                                                zIndex: "50",
                                                backdropFilter: "blur(1em)",
                                                borderRadius: "5px",
                                            }}
                                            size={"small"}
                                            value={this.state.user.shopData?.avatar}
                                            onChange={(e) => this.setState({
                                                user: {
                                                    ...this.state.user, shopData: {
                                                        ...this.state.user.shopData,
                                                        avatar: e.target.value,
                                                    },
                                                }
                                            })}
                                        />
                                        <Avatar
                                            src={this.state.user.shopData?.avatar}
                                            alt={this.state.user.shopData?.shopName}
                                            sx={{
                                                height: "8em",
                                                width: "8em"
                                            }}
                                        />
                                    </Box> : <Avatar
                                        src={this.state.user.shopData?.avatar}
                                        alt={this.state.user.shopData?.shopName}
                                        sx={{
                                            height: "8em",
                                            width: "8em"
                                        }}
                                    />}
                                    <Stack sx={{
                                        height: "100%",
                                        justifyContent: "center",
                                        width: "100%"
                                    }} alignItems={"center"}>
                                        <Typography variant={"h1"}>
                                            {this.state.editing ? <OutlinedInput
                                                    fullWidth
                                                    size={"medium"}
                                                    sx={{
                                                        fontSize: "0.75em"
                                                    }}
                                                    value={this.state.user.shopData?.shopName}
                                                    onChange={(e) => this.setState({
                                                        user: {
                                                            ...this.state.user, shopData: {
                                                                ...this.state.user.shopData,
                                                                shopName: e.target.value,
                                                            },
                                                        }
                                                    })}
                                                    disabled={this.state.loading}
                                                >
                                                    Description
                                                </OutlinedInput> :
                                                this.state.user.shopData?.shopName
                                            }
                                        </Typography>

                                        <Stack width={"100%"} direction={"row"} justifyContent={"space-between"}
                                               alignItems={"center"}>
                                            <Typography variant={"h6"} color={"lightgray"}>

                                                {this.state.editing ? <OutlinedInput
                                                        size={"small"}
                                                        placeholder={"店鋪類型, e.g. 肉店..."}
                                                        value={this.state.user.shopData?.short}
                                                        onChange={(e) => this.setState({
                                                            user: {
                                                                ...this.state.user, shopData: {
                                                                    ...this.state.user.shopData,
                                                                    short: e.target.value,
                                                                },
                                                            }
                                                        })}
                                                        disabled={this.state.loading}
                                                    >
                                                        Description
                                                    </OutlinedInput> :
                                                    this.state.user.shopData?.short}
                                            </Typography>
                                            <Stack direction={"row"} alignItems={"center"}>
                                                <LocalPhone/>

                                                {this.state.editing ? <TextField
                                                        size={"small"}
                                                        variant={"outlined"}
                                                        type={"number"}
                                                        error={this.state.user.shopData?.phone > 99999999 || this.state.user.shopData?.phone < 10000000}
                                                        placeholder={"Phone Number"}
                                                        value={this.state.user.shopData?.phone}
                                                        onChange={(e) => this.setState({
                                                            user: {
                                                                ...this.state.user, shopData: {
                                                                    ...this.state.user.shopData,
                                                                    phone: e.target.value,
                                                                },
                                                            }
                                                        })}
                                                        disabled={this.state.loading}
                                                        InputProps={{
                                                            startAdornment: <InputAdornment position="start">+852 </InputAdornment>,
                                                        }}
                                                    >
                                                        Description
                                                    </TextField> :
                                                    this.state.user.shopData?.phone}
                                            </Stack>
                                        </Stack>

                                        <Stack width={"100%"} direction={"row"} justifyContent={"space-between"}
                                               alignItems={"center"}>
                                            <Typography color={"lightgray"}>
                                                Since {this.state.user.createTime?.slice(0, 10)}
                                            </Typography>

                                            <Stack direction={"row"} alignItems={"center"}>

                                                <Rating name="read-only" value={this.state.user.shopData?.rating}
                                                        readOnly/>
                                                <Typography color={"darkgrey"}>
                                                    ({this.state.user.shopData?.rating.length})
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                </Stack>
                                {this.state.editing ? <OutlinedInput
                                        multiline fullWidth
                                        value={this.state.user.shopData?.shopDesc}
                                        onChange={(e) => this.setState({
                                            user: {
                                                ...this.state.user, shopData: {
                                                    ...this.state.user.shopData,
                                                    shopDesc: e.target.value,
                                                },
                                            }
                                        })}
                                        disabled={this.state.loading}
                                    >
                                        Description
                                    </OutlinedInput> :
                                    <Typography color={"darkgrey"} textAlign={"center"} fontSize={"small"}>
                                        {this.state.user.shopData?.shopDesc}
                                    </Typography>}
                            </Stack>
                        </CardContent>
                        <CardActions>
                            <Stack direction={"row-reverse"} width={"100%"}>
                                {this.state.editing ? <>
                                    <LoadingButton color={"success"} variant={"contained"} disabled={
                                        !this.state.user.shopData?.shopName ||
                                        this.state.user.shopData?.phone > 99999999 || this.state.user.shopData?.phone < 10000000
                                    } loading={this.state.loading} onClick={async () => await this.save()}>
                                        Save
                                    </LoadingButton>
                                    <Button color={"error"} variant={"text"} onClick={(e) => window.location.reload()} loading={this.state.loading}>
                                        Cancel
                                    </Button>
                                </> : <Button variant={"outlined"} onClick={(e) => this.setState({editing: true})}>
                                    Edit
                                </Button>}

                            </Stack>
                        </CardActions>
                    </Card>
                </Stack>
            </Box>
        )
    }
}