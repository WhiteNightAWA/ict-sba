import {Component} from "react";
import {
    Container,
    Card,
    CardHeader,
    IconButton,
    CardContent, ListItemIcon,
    CardActions, Skeleton, Divider, Stack, List, MenuItem, Typography, ListItemText
} from "@mui/material";
import {ArrowRight, Favorite, KeyboardDoubleArrowRight, MoreVert, Share} from "@mui/icons-material";
import "../styles/Buy.css"
import Requires from "../util/requires";

class Buy extends Component {
    constructor(props) {
        super(props);

        this.state = {
            shops: []
        };
    }

    async componentDidMount() {
        let shops = await Requires.get("/temp/getShops");
        if (shops.status === 200) {
            this.setState({
                shops: shops.data.shops,
            })
        }
    }

    render() {
        return <Stack spacing={2} alignItems={"center"} width={"100%"}>
            <Divider flexItem>臨時</Divider>
            <Typography variant={"h4"}>
                店鋪鏈接:
            </Typography>
            <List sx={{ width: "50%" }}>
                {this.state.shops.map((shop, index) => {
                    return <>
                        <MenuItem onClick={(e) => window.location.hash = window.location.hash.replace(/#\/buy.*$|\/buy\?[^#]*/i, `#/shop/${shop._id}`)}>
                            <ListItemText>
                                <Typography variant={"h3"}>
                                    {shop.shopName}
                                </Typography>
                            </ListItemText>
                            <ListItemIcon>
                                <KeyboardDoubleArrowRight />
                            </ListItemIcon>
                        </MenuItem>
                        <Divider flexItem sx={{ m: 0 }}/>
                    </>
                })}
            </List>
            <Divider flexItem>臨時</Divider>
            <Container sx={{
                mt: 5,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-around",
                height: "85vh",
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
        </Stack>
    }
}

export default Buy;