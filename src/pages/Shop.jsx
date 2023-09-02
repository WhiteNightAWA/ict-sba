import React, {Component} from "react";
import Requires from "../util/requires";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    IconButton,
    InputAdornment,
    OutlinedInput,
    Snackbar,
    Stack,
    TextField,
    Typography,
    Tabs,
    Tab,
    Container,
    CardHeader,
    Skeleton,
    Paper,
    ToggleButton,
    Autocomplete,
    Tooltip,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ToggleButtonGroup,
    Collapse,
    List,
    ListItemButton,
    Checkbox,
    ListItem,
    Divider, CardActionArea, CircularProgress
} from "@mui/material";
import Pagination from "../components/Pagination";
import {
    Clear, Dashboard,
    DoNotDisturb, ExpandMore,
    Favorite, FormatListBulleted, KeyboardArrowRight,
    ListAlt,
    LocalPhone,
    LocationOn,
    MoreVert,
    OpenInNew, Replay,
} from "@mui/icons-material";
import {LoadingButton, Rating, TabContext, TabPanel} from "@mui/lab";
import {autoPlay} from "react-swipeable-views-utils";
import SwipeableViews from "react-swipeable-views";
import {
    AutoPlaySwipeableViews,
    flattenObject,
    transformObject,
    uploader,
    getValueColor
} from "../util/functions";
import {ItemDisplay} from "../components/shop/ItemDisplay";
import {ShopRatingUI} from "../components/shop/ShopRatingUI";


export default class Shop extends Component {
    constructor(props) {
        super(props);
        const shopId = window.location.href.split("/").pop().split("?")[0];

        if (["", "shop"].includes(shopId)) {
            window.location.hash = "buy";
            return
        }

        this.state = {
            shopId: shopId,
            user: {},
            category: {},
            shop: {},
            tab: "item",

            // item
            items: [],
            pag: [],
            noItem: false,

            // filter
            search: "",
            searchLs: false,
            searchedSelect: [],
            Els: [],
            display: "card",
            favorite: false,
            sort: "name",
            reverse: false,


            // rating
            ratings: [],


            loading: true,
        }
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


    async componentDidMount() {
        let shopRes = await Requires.get("/shops/get/" + this.state.shopId);

        let user = await Requires.get("/users/test");
        if (user.data.shop === shopRes.data._id) {
            window.location.hash = "/myShop"
        }

        if (shopRes.status === 200) {
            this.setState({
                shop: shopRes.data,
            })

            setTimeout(async () => await this.loadRating(), 100);
        } else {
            this.setState({
                loading: false,
            })
        }
        let category = await Requires.get("/data/category")
        if (category.status === 200) {
            this.setState({
                category: category.data,
            })
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

                {/*<Snackbar anchorOrigin={{horizontal: "right", vertical: "bottom"}}*/}
                {/*          open={this.state.sb} autoHideDuration={10000}*/}
                {/*          onClose={() => this.setState({sb: false})}>*/}
                {/*    <Alert onClose={() => this.setState({sb: false})}*/}
                {/*           severity={this.state.sbS}*/}
                {/*           sx={{width: '100%'}}>*/}
                {/*        {this.state.sbMsg}*/}
                {/*    </Alert>*/}
                {/*</Snackbar>*/}
                {this.state.shop.shopName !== undefined ? <Stack alignItems={"center"} spacing={3}>
                        <Card sx={{
                            bgcolor: "rgba(255,255,255,0.01)",
                            minWidth: "80vw"
                        }}
                        >
                            {
                                this.state.shop.shopPhotos?.length !== 0 &&
                                <Box sx={{position: 'relative', filter: "drop-shadow(2px 4px 6px black)"}}>
                                    <AutoPlaySwipeableViews index={this.state.imgIndex}
                                                            onChangeIndex={(i) => this.setState({imgIndex: i})}
                                    >
                                        {
                                            this.state.shop.shopPhotos?.map((url, index) => {
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
                                    <Pagination dots={this.state.shop.shopPhotos?.length}
                                                index={this.state.imgIndex}
                                                onChangeIndex={(i) => this.setState({imgIndex: i})}
                                    />
                                </Box>
                            }
                            <CardContent sx={{
                                display: "flex",
                                justifyContent: "center"
                            }}>
                                <Stack alignItems={"center"} spacing={3} width={"80%"}>
                                    <Stack direction={"row"} alignItems={"center"} spacing={5} width={"100%"}>
                                        <Avatar
                                            src={this.state.shop.avatar}
                                            alt={this.state.shop.shopName}
                                            sx={{
                                                height: "8em",
                                                width: "8em"
                                            }}
                                        />
                                        <Stack sx={{
                                            height: "100%",
                                            justifyContent: "center",
                                            width: "100%"
                                        }} alignItems={"center"}>
                                            <Typography variant={"h1"}>
                                                {this.state.shop.shopName}
                                            </Typography>

                                            <Typography color={"lightgray"} width={"100%"}>
                                                <Stack onClick={() => {
                                                    window.open("https://www.google.com/maps/search/" + this.state.shop.address)
                                                }} direction={"row"} justifyContent={"center"} alignItems={"center"}>
                                                    <LocationOn/>
                                                    <Typography sx={{
                                                        "text-decoration-line": "underline",
                                                        cursor: "pointer"
                                                    }}>{this.state.shop.address}</Typography>
                                                    <OpenInNew fontSize={"small"}/>
                                                </Stack>
                                            </Typography>


                                            <Stack width={"100%"} direction={"row"} justifyContent={"space-between"}
                                                   alignItems={"center"}>
                                                <Typography variant={"h6"} color={"lightgray"}>
                                                    {this.state.shop.short}
                                                </Typography>
                                                <Stack direction={"row"} alignItems={"center"}>
                                                    <LocalPhone/>
                                                    {this.state.shop.phone}
                                                </Stack>
                                            </Stack>

                                            <Stack width={"100%"} direction={"row"} justifyContent={"space-between"}
                                                   alignItems={"center"}>
                                                <Typography color={"lightgray"}>
                                                    Since {this.state.shop.createTime?.slice(0, 10)}
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
                                    <Typography color={"darkgrey"} textAlign={"center"} fontSize={"small"}>
                                        {this.state.shop.shopDesc}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                        <TabContext value={this.state.tab}>

                            <Tabs
                                sx={{borderBottom: 1, borderColor: 'divider', width: "100%"}}
                                value={this.state.tab}
                                onChange={(e, n) => this.setState({tab: n})}
                                centered
                            >
                                <Tab label="item" value={"item"}/>
                                <Tab label="Rating" value={"rating"}/>
                            </Tabs>

                            <TabPanel value={"item"} sx={{width: "100%"}}>
                                {this.state.shop._id &&
                                    <ItemDisplay
                                        owner={false}
                                        shop={this.state.shop}
                                        showItem={this.state.showItem}
                                        clean={() => this.setState({ showItem: null })}
                                    />
                                }
                            </TabPanel>
                            <TabPanel value={"rating"} sx={{ width: "100%" }}>
                                <Stack width={"100%"} alignItems={"center"}>
                                    <ShopRatingUI
                                        shop={this.state.shop}
                                        ratings={this.state.ratings}
                                        showItem={(itemId) => this.setState({ tab: "item", showItem: itemId })}
                                    />
                                </Stack>
                            </TabPanel>
                        </TabContext>
                    </Stack> :
                    (this.state.loading ? <Stack height={"80vh"} alignItems={"center"} justifyContent={"center"}>
                        <CircularProgress size={"10em"} />
                    </Stack> : <Stack height={"80vh"} alignItems={"center"} justifyContent={"center"}>
                        <DoNotDisturb sx={{fontSize: "20em"}}/>
                        <Typography variant={"h1"}>
                            Shop Not Found! :(
                        </Typography>
                        <Button size={"large"} onClick={(e) => window.location.hash = "/buy"}>
                            Back
                        </Button>
                    </Stack>)
                }
            </Box>
        )
    }
}