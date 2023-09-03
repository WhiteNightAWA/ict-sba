import React, {Component} from "react";
import {
    Alert, Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Container,
    Dialog, DialogActions, DialogTitle, IconButton, InputAdornment, OutlinedInput, Paper, Skeleton,
    Snackbar, Stack, Tab, Tabs, TextField, Tooltip, DialogContent, Typography, ImageList, ImageListItem,
    Divider, List, ListItem, ListItemButton, ListItemText, Checkbox, Autocomplete, Chip, Accordion,
    AccordionSummary, AccordionDetails, Collapse, MenuItem, CardActionArea, ToggleButton, ToggleButtonGroup,
    FormControl, InputLabel, Select, Menu, Switch, RadioGroup, Radio, FormControlLabel, FormLabel, Backdrop
} from "@mui/material";
import Requires from "../util/requires";
import {autoPlay} from 'react-swipeable-views-utils';
import SwipeableViews from 'react-swipeable-views';
import Pagination from "../components/Pagination";
import {LoadingButton, Rating, TabContext, TabPanel} from "@mui/lab";
import {
    ArrowRight, Clear, Dashboard, ExpandMore,
    Favorite, FormatListBulleted, KeyboardArrowRight, ListAlt,
    LocalPhone, LocationOn, MoreVert, OpenInNew, Replay, Share
} from "@mui/icons-material";
import {Uploader} from "uploader";
import {UploadDropzone, UploadButton} from "react-uploader";
import {
    AutoPlaySwipeableViews,
    flattenObject,
    transformObject,
    uploader,
    getValueColor
} from "../util/functions";
import {AnimatePresence, motion} from 'framer-motion';
import ImageUploader from 'react-images-upload';
import Item from "./Item";
import {AddItemDl} from "../components/shop/AddItemDl";
import {ItemDisplay} from "../components/shop/ItemDisplay";
import {ShopRatingUI} from "../components/shop/ShopRatingUI";


export default class MyShop extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            shop: {},
            imgIndex: 0,
            editing: false,
            loading: false,
            uploadedPhoto: null,
            tab: "item",

            // item
            items: [],
            pag: [],
            noItem: false,
            selectedItem: null,

            // rating
            ratings: [],

            // sb
            sb: false,
            sbS: "",
            sbMsg: "",
        };
    }

    loadRating = async () => {
        let res = await Requires.get("/shops/get/" + this.state.shop._id, {get_type: "rating"});

        if (res.status === 200) {
            let ratings = res.data.rating.flatMap((i, index) => {
                let ls = i.rating.map((r, index) => {
                    return {
                        name: i.name,
                        rating: i.rating,
                        itemId: i._id,
                        itemImageList: i.imageList,
                        visible: i.visible,
                        deleted: i.deleted,
                        ...r
                    }
                });
                return ls
            })
            this.setState({ratings: ratings})
        } else {
            this.setState({
                sb: true,
                sbS: "error",
                sbMsg: res.data.error_description,
            })
        }
    }

    save = async () => {
        this.setState({
            loading: true,
        });

        const res = await Requires.put("/users/update", {
            type: "shop",
            upate: this.state.shop,
        });

        if (res.status === 200) {
            this.setState({
                loading: false,
                editing: false,
                sb: true, sbS: "success", sbMsg: "Update Successfully.",
                savedShop: this.state.shop,
            });

        } else {
            this.setState({
                loading: false,
                sb: true, sbS: "error", sbMsg: res.data.error_description
            });
        }

    }

    async componentDidMount() {
        let res = await Requires.get("/users/test");
        if (res.status === 200) {
            if (res.data.type !== "sell") {
                window.location.href = "/#/";
            } else {
                let shopRes = await Requires.get("/shops/get/" + res.data.shop.toString())

                if (shopRes.status === 200) {
                    this.setState({
                        user: {...res.data},
                        shop: {...shopRes.data},
                        savedShop: {...shopRes.data},
                    });
                    setTimeout(async () => await this.loadRating(), 100);
                } else {
                    window.location.href = "/#/";
                }
            }
        } else {
            window.location.href = "/#/login";
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
                          onClose={() => this.setState({sb: false})}
                >
                    <Alert onClose={() => this.setState({sb: false})}
                           severity={this.state.sbS}
                           sx={{width: '100%'}}>
                        {this.state.sbMsg}
                    </Alert>
                </Snackbar>
                <Stack alignItems={"center"}>
                    <Card
                        sx={{
                            bgcolor: "rgba(255,255,255,0.01)",
                            minWidth: "80vw"
                        }}
                    >
                        {
                            (this.state.shop.shopPhotos?.length !== 0 || this.state.editing) &&
                            <Box sx={{position: 'relative', filter: "drop-shadow(2px 4px 6px black)"}}>
                                <AutoPlaySwipeableViews index={this.state.imgIndex}
                                                        onChangeIndex={(i) => this.setState({imgIndex: i})}
                                >
                                    {
                                        this.state.shop.shopPhotos?.map((url, index) => {
                                            return (
                                                <CardMedia
                                                    key={index}
                                                    sx={{height: 300}}
                                                    image={`${url}?w=164&h=164&fit=crop&auto=format`}
                                                    srcSet={`${url}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                                    title={url}
                                                    loading="lazy"
                                                />)
                                        })
                                    }
                                </AutoPlaySwipeableViews>
                                <Pagination dots={this.state.shop.shopPhotos?.length}
                                            index={this.state.imgIndex}
                                            onChangeIndex={(i) => this.setState({imgIndex: i})}/>
                            </Box>
                        }
                        {this.state.editing && <>
                            <Stack direction={"row"}>
                                <UploadDropzone
                                    uploader={uploader}
                                    options={{
                                        multi: true,
                                    }}

                                    onUpdate={files => this.setState({
                                        shop: {
                                            ...this.state.shop,
                                            shopPhotos: files.map((f) => f.fileUrl)
                                        }
                                    })}
                                    width={"50%"}
                                    height={"20em"}
                                />

                                {this.state.shop.shopPhotos.length === 0 ?
                                    <Stack width={"50%"} alignItems={"center"} justifyContent={"center"}>
                                        <Typography variant={"h6"} color={"darkgray"}>
                                            No Image
                                        </Typography>
                                    </Stack> : <ImageList sx={{
                                        width: "50%",
                                        height: "18em"
                                    }}>
                                        {this.state.shop.shopPhotos?.map((item) => (
                                            <ImageListItem key={item}>
                                                <img
                                                    src={`${item}?w=164&h=164&fit=crop&auto=format`}
                                                    srcSet={`${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                                    alt={item}
                                                    loading="lazy"
                                                />
                                            </ImageListItem>
                                        ))}
                                    </ImageList>
                                }
                            </Stack>
                        </>}
                        <CardContent sx={{
                            display: "flex",
                            justifyContent: "center"
                        }}>
                            <Stack alignItems={"center"} spacing={3} width={"80%"}>
                                <Stack direction={"row"} alignItems={"center"} spacing={5} width={"100%"}>
                                    <Stack>
                                        <Avatar
                                            src={this.state.shop.avatar}
                                            alt={this.state.shop.shopName}
                                            sx={{
                                                height: "8em",
                                                width: "8em"
                                            }}
                                        />
                                        {this.state.editing && <UploadButton
                                            uploader={uploader}
                                            options={{multi: false}}
                                            onComplete={files => this.setState({
                                                shop: {
                                                    ...this.state.shop,
                                                    avatar: files.length === 0 ? this.state.shop.avatar : files[0].fileUrl,
                                                }
                                            })}>
                                            {({onClick}) =>
                                                <Button onClick={onClick} variant={"outlined"}>
                                                    Update the avatar
                                                </Button>
                                            }
                                        </UploadButton>}
                                    </Stack>
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
                                                    value={this.state.shop.shopName}
                                                    onChange={(e) => this.setState({
                                                        shop: {
                                                            ...this.state.shop,
                                                            shopName: e.target.value,
                                                        }
                                                    })}
                                                    disabled={this.state.loading}
                                                >
                                                    Description
                                                </OutlinedInput> :
                                                this.state.shop.shopName
                                            }
                                        </Typography>

                                        <Typography color={"lightgray"} width={"100%"}>

                                            {this.state.editing ? <OutlinedInput
                                                    fullWidth
                                                    size={"small"}
                                                    placeholder={"Address"}
                                                    value={this.state.shop.address}
                                                    onChange={(e) => this.setState({
                                                        shop: {
                                                            ...this.state.shop,
                                                            address: e.target.value,
                                                        }
                                                    })}
                                                    disabled={this.state.loading}
                                                >
                                                    Description
                                                </OutlinedInput> :
                                                <Stack onClick={() => {
                                                    window.open("https://www.google.com/maps/search/" + this.state.shop.address)
                                                }} direction={"row"} justifyContent={"center"} alignItems={"center"}>
                                                    <LocationOn/>
                                                    <Typography sx={{
                                                        "text-decoration-line": "underline",
                                                        cursor: "pointer"
                                                    }}>{this.state.shop.address}</Typography>
                                                    <OpenInNew fontSize={"small"}/>
                                                </Stack>}
                                        </Typography>


                                        <Stack width={"100%"} direction={"row"} justifyContent={"space-between"}
                                               alignItems={"center"}>
                                            <Typography variant={"h6"} color={"lightgray"}>

                                                {this.state.editing ? <OutlinedInput
                                                        size={"small"}
                                                        placeholder={"店鋪類型, e.g. 肉店..."}
                                                        value={this.state.shop.short}
                                                        onChange={(e) => this.setState({
                                                            shop: {
                                                                ...this.state.shop,
                                                                short: e.target.value,
                                                            }
                                                        })}
                                                        disabled={this.state.loading}
                                                    >
                                                        Description
                                                    </OutlinedInput> :
                                                    this.state.shop.short}
                                            </Typography>
                                            <Stack direction={"row"} alignItems={"center"}>
                                                <LocalPhone/>

                                                {this.state.editing ? <TextField
                                                        size={"small"}
                                                        variant={"outlined"}
                                                        type={"number"}
                                                        error={this.state.shop.phone > 99999999 || this.state.shop.phone < 10000000}
                                                        placeholder={"Phone Number"}
                                                        value={this.state.shop.phone}
                                                        onChange={(e) => this.setState({
                                                            shop: {
                                                                ...this.state.shop,
                                                                phone: e.target.value,
                                                            }
                                                        })}
                                                        disabled={this.state.loading}
                                                        InputProps={{
                                                            startAdornment: <InputAdornment
                                                                position="start">+852 </InputAdornment>,
                                                        }}
                                                    /> :
                                                    this.state.shop.phone}
                                            </Stack>
                                        </Stack>

                                        <Stack width={"100%"} direction={"row"} justifyContent={"space-between"}
                                               alignItems={"center"}>
                                            <Typography color={"lightgray"}>
                                                Since {this.state.user.createTime?.slice(0, 10)}
                                            </Typography>

                                            <Stack direction={"row"} alignItems={"center"}>

                                                <Rating
                                                    value={this.state.ratings.length !== 0 ? this.state.ratings.map(r => r.rate).reduce((a, c) => a + c) / this.state.ratings.map(r => r.rate).length : 0}
                                                    precision={0.5}
                                                    readOnly
                                                />
                                                <Typography color={"darkgrey"}>
                                                    ({this.state.ratings.length})
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                </Stack>
                                {this.state.editing ? <OutlinedInput
                                        multiline fullWidth
                                        placeholder={"Description"}
                                        value={this.state.shop.shopDesc}
                                        onChange={(e) => this.setState({
                                            shop: {
                                                ...this.state.shop,
                                                shopDesc: e.target.value,
                                            }
                                        })}
                                        disabled={this.state.loading}
                                    >
                                        Description
                                    </OutlinedInput> :
                                    <Typography color={"darkgrey"} textAlign={"center"} fontSize={"small"}>
                                        {this.state.shop.shopDesc}
                                    </Typography>}
                            </Stack>
                        </CardContent>
                        <CardActions>
                            <Stack direction={"row-reverse"} width={"100%"}>
                                {this.state.editing ? <>
                                    <LoadingButton color={"success"} variant={"contained"} disabled={
                                        !this.state.shop.shopName ||
                                        this.state.shop.phone > 99999999 || this.state.shop.phone < 10000000
                                    } loading={this.state.loading} onClick={async () => await this.save()}>
                                        Save
                                    </LoadingButton>
                                    <Button color={"error"} variant={"text"} onClick={(e) => this.setState({
                                        shop: this.state.savedShop,
                                        editing: false
                                    })}
                                            loading={this.state.loading}>
                                        Cancel
                                    </Button>
                                </> : <Button variant={"outlined"} onClick={(e) => this.setState({editing: true})}>
                                    Edit
                                </Button>}

                            </Stack>
                        </CardActions>
                    </Card>

                    <TabContext value={this.state.tab}>
                        <Tabs
                            sx={{borderBottom: 1, borderColor: 'divider', width: "100%"}}
                            value={this.state.tab}
                            onChange={(e, n) => this.setState({tab: n})}
                            centered
                        >
                            <Tab label="商品" value={"item"}/>
                            <Tab label="Rating" value={"rating"}/>
                        </Tabs>
                        <TabPanel value={"item"} sx={{width: "100%"}}>
                            {this.state.shop._id &&
                                <ItemDisplay
                                    owner={true}
                                    shop={this.state.shop}
                                    showItem={this.state.showItem}
                                    clean={() => this.setState({ showItem: null })}
                                />
                            }
                        </TabPanel>
                        <TabPanel value={"rating"} sx={{width: "100%"}}>
                            <Stack width={"100%"} alignItems={"center"}>
                                <ShopRatingUI
                                    shop={this.state.shop}
                                    ratings={this.state.ratings}
                                    showItem={(itemId) => this.setState({ tab: "item", showItem: itemId })}
                                />
                            </Stack>
                        </TabPanel>
                    </TabContext>
                </Stack>
            </Box>
        )
    }
}