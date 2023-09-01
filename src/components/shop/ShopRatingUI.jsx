import React, {Component} from "react";
import {
    Avatar,
    Box, Card, CardContent,
    CardHeader,
    CardMedia,
    Checkbox,
    Divider,
    FormControlLabel, IconButton,
    Stack,
    Tooltip,
    Typography, Pagination as Paginations, Collapse, CardActionArea
} from "@mui/material";
import {Help, Replay, Star} from "@mui/icons-material";
import {AutoPlaySwipeableViews, colors} from "../../util/functions";
import FlipNumbers from "react-flip-numbers";
import {Rating} from "@mui/lab";
import Requires from "../../util/requires";
import Pagination from "../Pagination";

export class ShopRatingUI extends Component {
    constructor(props) {
        super(props);
        const {shop, ratings} = props;

        this.state = {
            shop, ratings,

            setRatings: ratings,
            lsRatings: [],
            ratedUserPags: [],
            pag: 0,

            onPage: 10,
            done: true,
        }
    }

    loadRating = async () => {
        let rating = this.state.setRatings;
        let filtedRating = rating;

        this.setState({lsRatings: [], ratedUserPags: [], done: false});
        setTimeout(async () => {
            filtedRating.map(async (r, index) => {
                let user = await Requires.get("/user/" + r.user_id);
                if (user.status === 200) {
                    this.setState({
                        lsRatings: [...this.state.lsRatings, {
                            ...r,
                            username: r.anonymous ? "匿名" : user.data.user.username,
                            photoURL: r.anonymous ? "" : user.data.user.photoURL
                        }],
                        ratedUserPags: [...this.state.ratedUserPags, 0]
                    })
                }
            });
            this.setState({done: true})
        }, 100)
    }

    async componentDidMount() {
        await this.loadRating();
    }

    render() {
        const {shop, ratings} = this.props;
        if ([shop, ratings].includes(undefined)) {
            return <Stack width={"100%"} height={"100%"} alignItems={"center"} justifyContent={"center"}>
                <Typography>
                    Invalid Props
                </Typography>
            </Stack>
        } else {
            return <Stack width={"90%"} alignItems={"center"} spacing={4}>
                <Stack width={"100%"} alignItems={"center"}>
                    <Stack direction={"row"} width={"100%"} justifyContent={"center"}>
                        <Typography fontSize={"10rem"} lineHeight={"inherit"}>
                            <FlipNumbers
                                numbers={this.state.setRatings.length === 0 ? "0.0" : (this.state.setRatings.map(r => r.rate).reduce((a, c) => a + c) / this.state.setRatings.length).toFixed(1).toString()}
                                play
                                height={150}
                                perspective={4000}
                                width={80}
                                numberStyle={{fontSize: "10rem"}}
                                color={"white"}
                                duration={4}
                            />
                        </Typography>
                        {/*<AnimatedNumbers*/}
                        {/*    number={this.state.setRatings.length === 0 ? "0.0" : (this.state.setRatings.map(r => r.rate).reduce((a, c) => a+c) / this.state.setRatings.length).toFixed(1).toString()}*/}
                        {/*/>*/}
                        <Stack pl={2} justifyContent={"center"}>
                            {[5, 4, 3, 2, 1].map((i, index) => {
                                return <Stack key={index} alignItems={"center"} direction={"row"}>
                                    <Typography fontSize={"1.25rem"}>{i}</Typography>
                                    <Star/>
                                    <Box
                                        ml={1}
                                        borderRadius={"8px"}
                                        boxShadow={"inset #333030 0 0 0.25em 0.125em"}
                                        width={"200px"}
                                        height={"15px"}
                                        bgcolor={"rgba(255,255,255,0.2)"}
                                    ><Box
                                        height={"15px"}
                                        borderRadius={"8px"}
                                        bgcolor={colors[index]}
                                        sx={{
                                            transition: "width 0.5s"
                                        }}
                                        width={this.state.setRatings.length === 0 ? 0 : this.state.setRatings?.filter(r => r.rate === i).length / this.state.setRatings?.filter(r => r.rate === this.state.setRatings?.map(r => r.rate).reduce(
                                            (acc, val, index, arr) =>
                                                (arr.filter(v => v === val).length > acc[1] ? [val, arr.filter(v => v === val).length] : acc),
                                            [null, 0]
                                        )[0]).length * 200}
                                    /></Box>
                                </Stack>
                            })}
                        </Stack>
                    </Stack>
                    <Rating
                        value={this.state.setRatings.length === 0 ? 0 : (this.state.setRatings.map(r => r.rate).reduce((a, c) => a + c) / this.state.setRatings.length).toFixed(1)}
                        readOnly
                        precision={0.5}
                        size={"large"}
                    />
                    <Typography color={"lightgray"} variant={"h6"}>
                        {this.state.setRatings.length}則評價
                    </Typography>

                    <Stack direction={"row"} alignItems={"center"}>
                        <FormControlLabel
                            label={<Stack direction={"row"}>
                                <Typography>
                                    精選評價
                                </Typography>
                                <Tooltip
                                    arrow
                                    title={<Typography variant={"h6"}>評價必需附帶照片</Typography>}
                                    placement="top"
                                >
                                    <Help fontSize={"small"}/>
                                </Tooltip>
                            </Stack>}
                            control={<Checkbox
                                sx={{pt: 1}}
                                value={this.state.ratingFilter}
                                onChange={async (e, n) => {
                                    this.setState({
                                        ratingFilter: n,
                                        setRatings: n ? this.state.ratings.filter(r => r.imageList.length !== 0) : this.state.ratings
                                    });
                                }}
                            />}
                        />
                    </Stack>
                </Stack>
                <Divider flexItem sx={{width: "100%"}}/>
                <Stack width={"90%"} spacing={4} alignItems={"center"} justifyContent={"space-between"}>
                    <IconButton onClick={async () => await this.loadRating()}>
                        <Replay/>
                    </IconButton>
                    {this.state.lsRatings.map((r, index) => {
                        return <Card elevation={12} sx={{m: "2em", width: "80%"}}>
                            <CardHeader
                                sx={{pb: 0}}
                                avatar={
                                    <Avatar
                                        src={r.photoURL}
                                        alt={r.username}
                                        sx={{
                                            height: 40,
                                            width: 40
                                        }}
                                    />
                                }
                                title={<Typography
                                    variant={"h5"}>{r.username}</Typography>}
                            />
                            <CardContent sx={{pt: 0}}>
                                <Card elevation={12} sx={{m: 1}}>
                                    <CardActionArea>
                                        <CardContent>
                                            <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                                                <Typography variant={"h6"}>
                                                    評價商品：
                                                </Typography>

                                                <Typography variant={"h4"}>
                                                    {r.name}
                                                </Typography>

                                                <Stack direction={"row"} alignItems={"center"}>
                                                    <Rating
                                                        readOnly
                                                        value={[0, undefined].includes(r.rating?.length) ? 0 : r.rating.map(r => r.rate).reduce((a, c) => a + c) / r.rating.length}
                                                        precision={0.5}
                                                        icon={<Star/>}
                                                        emptyIcon={<Star style={{opacity: 0.55}}/>}
                                                    />
                                                    <Typography color={"gray"} ml={1}>
                                                        ({[0, undefined].includes(r.rating?.length) ? 0 : r.rating.length})
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                                <Rating
                                    readOnly
                                    value={r.rate}
                                    precision={1}
                                    icon={<Star/>}
                                    emptyIcon={<Star style={{opacity: 0.55}}/>}
                                />
                                <Typography color={"gray"}>
                                    {r.desc}
                                </Typography>
                            </CardContent>
                            {
                                r.imageList?.length !== 0 && <Box sx={{
                                    position: 'relative',
                                    filter: "drop-shadow(2px 4px 6px black)"
                                }}>
                                    <AutoPlaySwipeableViews
                                        index={this.state.ratedUserPags[index]}
                                        onChangeIndex={(i) => {
                                            let n = this.state.ratedUserPags;
                                            n[index] = i;
                                            this.setState({ratedUserPags: n})
                                        }}
                                    >
                                        {
                                            r.imageList?.map((url, i) => {
                                                return (
                                                    <CardMedia
                                                        key={i}
                                                        sx={{height: 200}}
                                                        image={url}
                                                        title={url}
                                                    />)
                                            })
                                        }
                                    </AutoPlaySwipeableViews>
                                    <Pagination
                                        dots={r.imageList?.length}
                                        index={this.state.ratedUserPags[index]}
                                        onChangeIndex={(i) => {
                                            let n = this.state.ratedUserPags;
                                            n[index] = i;
                                            this.setState({ratedUserPags: n})
                                        }}
                                    />
                                </Box>
                            }
                        </Card>
                    })}
                    <Paginations
                        count={Math.ceil(this.state.lsRatings.length / this.state.onPage)}
                        onChange={(e, n) => this.setState({pag: n})}
                    />
                </Stack>
            </Stack>
        }
    }
}