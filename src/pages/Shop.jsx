import {Component} from "react";
import Requires from "../util/requires";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card, CardActions,
    CardContent,
    CardMedia,
    IconButton, InputAdornment, OutlinedInput,
    Snackbar,
    Stack,
    TextField, Typography, Tabs, Tab, Container, CardHeader, Skeleton
} from "@mui/material";
import Pagination from "../components/Pagination";
import {Clear, DoNotDisturb, Favorite, LocalPhone, LocationOn, MoreVert, OpenInNew, Share} from "@mui/icons-material";
import {LoadingButton, Rating, TabContext, TabPanel} from "@mui/lab";
import {autoPlay} from "react-swipeable-views-utils";
import SwipeableViews from "react-swipeable-views";


const AutoPlaySwipeableViews = autoPlay(SwipeableViews);


export default class Shop extends Component {
    constructor(props) {
        super(props);
        const shopId = window.location.href.split("/").pop();

        if (["", "shop"].includes(shopId)) {
            window.location.hash = "buy";
            return
        }

        this.state = {
            shopId: shopId,
            shop: {},
            tab: "item"
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
                shop: shopRes.data
            })
        } else {

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

                                                    <Rating name="read-only" value={this.state.shop.rating}
                                                            readOnly/>
                                                    <Typography color={"darkgrey"}>
                                                        ({this.state.shop.rating?.length})
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
                                <Tab label="Rating" value={"test"}/>
                            </Tabs>
                            <TabPanel value={"item"}>
                                <Container sx={{
                                    mt: 5,
                                    display: "flex",
                                    flexWrap: "wrap",
                                    justifyContent: "space-around",
                                    height: "68vh",
                                    overflow: "auto",
                                    width: "100%"
                                }} className={"scrollBar"}>
                                    {[345, 551, 642, 352, 465, 522].map((w, index) => {
                                        return (<Card sx={{width: w, m: 3}} elevation={6}>
                                            <CardHeader
                                                avatar={
                                                    <Skeleton variant="circular" width={40} height={40}/>
                                                }
                                                action={
                                                    <IconButton aria-label="settings" disabled={true}>
                                                        <MoreVert/>
                                                    </IconButton>
                                                }
                                                title={<Skeleton variant="rounded" height={20}/>}
                                                subheader={<Skeleton variant="text" sx={{fontSize: '1rem', width: "60%"}}/>}
                                            />

                                            <Skeleton variant="rectangular" width={"100%"} height={194}/>
                                            <CardContent>
                                                <Skeleton variant="text" sx={{fontSize: '1rem'}}/>
                                                <Skeleton variant="text" sx={{fontSize: '1rem'}}/>
                                                <Skeleton variant="text" sx={{fontSize: '1rem', width: "70%"}}/>
                                            </CardContent>
                                            <CardActions disableSpacing>
                                                <IconButton aria-label="add to favorites" disabled={true}>
                                                    <Favorite/>
                                                </IconButton>
                                                <IconButton aria-label="share" disabled={true}>
                                                    <Share/>
                                                </IconButton>
                                            </CardActions>
                                        </Card>)
                                    })}
                                </Container>
                            </TabPanel>
                            <TabPanel value={"test"}>
                                test
                            </TabPanel>

                        </TabContext>
                    </Stack> :
                    <Stack height={"80vh"} alignItems={"center"} justifyContent={"center"}>
                        <DoNotDisturb sx={{fontSize: "20em"}}/>
                        <Typography variant={"h1"}>
                            Shop Not Found! :(
                        </Typography>
                        <Button size={"large"} onClick={(e) => window.location.hash = "/buy"}>
                            Back
                        </Button>
                    </Stack>}
            </Box>
        )
    }
}