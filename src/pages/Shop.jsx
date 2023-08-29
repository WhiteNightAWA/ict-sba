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
    Divider, CardActionArea
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
    Share
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
        }
    }
    getFiltedItems = () => {
        return this.state.items.filter((i) => {
            return (this.state.user.favorite?.includes(i._id.toString()) || !this.state.favorite) &&
                (this.state.search === "" || (
                    i.name.toLowerCase().includes(this.state.search.toLowerCase()) ||
                    i.desc.toLowerCase().includes(this.state.search.toLowerCase()) ||
                    i.selectedCategoryOther.toLowerCase().includes(this.state.search.toLowerCase()) ||
                    i.selectedCategory.map(r => r.toLocaleString().includes(this.state.search.toLowerCase())).includes(true)
                )) && (
                    this.state.searchedSelect.length === 0 || (
                        this.state.searchedSelect.map(r => i.selectedCategoryOther.startsWith(r)).includes(true) ||
                        this.state.searchedSelect.map(r => i.selectedCategory.map(j => j.startsWith(r)).includes(true)).includes(true)
                    )
                )
        }).sort((a, b) => {
            switch (this.state.sort) {
                case "price":
                    return Math.min(...a.price.map(i => i[0] / i[1])) - Math.min(...b.price.map(i => i[0] / i[1]))
                case "fresh":
                    return Math.min(...a.record.map(r => Math.floor(new Date() - new Date(r.time)))) - Math.min(...b.record.map(r => Math.floor(new Date() - new Date(r.time))))
                default:
                    return a.name.localeCompare(b.name);
            }
        }).map((element, index, arr) => this.state.reverse ? arr[arr.length - 1 - index] : element)
    }

    loadItem = async () => {
        let res = await Requires.get("/shops/items/" + this.state.shop._id);
        if (res.status === 200) {
            this.setState({
                items: res.data.items,
                pag: Array(res.data.items.length).fill(0),
                noItem: res.data.items.length < 1
            });
        } else {
            this.setState({
                loading: false,
                sb: true, sbS: "error", sbMsg: res.data.error_description
            });
        }
    }
    selectEl = (i) => {
        if (this.state.searchedSelect.includes(i)) {
            this.state.searchedSelect = this.state.searchedSelect.filter(it => it !== i)
        } else {
            this.state.searchedSelect.push(i)
        }
        this.setState({
            searchedSelect: this.state.searchedSelect
        })
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
                user: user.data
            })
        } else {
            this.setState({
                user: user.data
            })
        }
        await this.loadItem();
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
                                <Tab label="Rating" value={"rating"}/>
                            </Tabs>

                            <TabPanel value={"item"} sx={{width: "100%"}}>
                                <Stack alignItems={"center"}>
                                    <Paper
                                        sx={{
                                            bgcolor: "rgba(0,0,0,0.1)",
                                            width: "100%",
                                            height: "3em",
                                            mt: 1
                                        }}
                                    >
                                        <Stack direction={"row"} justifyContent={"space-around"} spacing={4} height={"100%"}
                                               alignItems={"center"}
                                        >
                                            <TextField
                                                label={"搜尋"}
                                                variant={"filled"}
                                                size={"small"}
                                                value={this.state.search}
                                                onChange={(e) => this.setState({search: e.target.value})}
                                            />
                                            <Stack direction={"row"} justifyContent={"center"}>
                                                <ToggleButton
                                                    value={"listAlt"}
                                                    selected={this.state.searchLs}
                                                    onClick={(e) => this.setState({searchLs: !this.state.searchLs})}
                                                >
                                                    <ListAlt/>
                                                </ToggleButton>
                                                <Autocomplete
                                                    disabled={this.state.loading}
                                                    multiple
                                                    sx={{width: "20em", height: "3em"}}
                                                    value={this.state.searchedSelect}
                                                    options={transformObject(this.state.category)}
                                                    onChange={(e, v) => this.setState({searchedSelect: v})}
                                                    getOptionLabel={(option) => option}
                                                    renderTags={(value, getTagProps) => {
                                                        return value.map((option, index) => (
                                                            <Tooltip
                                                                title={<Typography
                                                                    fontSize={"1.5em"}>{option}</Typography>}
                                                                sx={{
                                                                    fontSize: "2em"
                                                                }}>
                                                                <Chip
                                                                    key={option}
                                                                    label={option.split(" > ").pop()}
                                                                    {...getTagProps({index})}
                                                                    size={"small"}
                                                                    sx={{
                                                                        fontSize: "0.75rem"
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        ))
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            disabled={this.state.loading}
                                                            label={"類別搜尋"}
                                                            variant={"filled"}
                                                            size={"small"}
                                                            width={"20em"}
                                                            sx={{
                                                                borderTopRightRadius: "0 !important",
                                                            }}
                                                        />
                                                    )}
                                                />

                                            </Stack>
                                            <Stack direction={"row"}>
                                                <FormControl sx={{width: "10em"}}>
                                                    <InputLabel id="item-sort-by-label" variant={"filled"}
                                                                size={"small"}>排序方式</InputLabel>
                                                    <Select
                                                        labelId="item-sort-by-label"
                                                        value={this.state.sort}
                                                        label="排序方式"
                                                        variant={"filled"}
                                                        size={"small"}
                                                        onChange={(e) => this.setState({sort: e.target.value})}
                                                    >
                                                        <MenuItem value={"name"}>名稱</MenuItem>
                                                        <MenuItem value={"price"}>價格</MenuItem>
                                                        <MenuItem value={"fresh"}>新鮮</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                <IconButton
                                                    onClick={(e) => this.setState({reverse: !this.state.reverse})}
                                                    sx={{
                                                        rotate: this.state.reverse ? "180deg" : "0deg",
                                                        transition: "rotate 1s"
                                                    }}
                                                >
                                                    <ExpandMore/>
                                                </IconButton>
                                            </Stack>

                                            <ToggleButton
                                                selected={this.state.favorite}
                                                onClick={(e) => this.setState({favorite: !this.state.favorite})}
                                                sx={this.state.favorite && {
                                                    color: "red !important"
                                                }}
                                            >
                                                <Favorite/>
                                            </ToggleButton>

                                            <ToggleButtonGroup
                                                value={this.state.display}
                                                onChange={(e, n) => this.setState({display: n === null ? this.state.display : n})}
                                                exclusive
                                            >
                                                <ToggleButton value={"list"}>
                                                    <FormatListBulleted/>
                                                </ToggleButton>
                                                <ToggleButton value={"card"}>
                                                    <Dashboard/>
                                                </ToggleButton>
                                            </ToggleButtonGroup>



                                            <IconButton
                                                onClick={async () => {
                                                    this.setState({rotateReload: true, items: [], noItem: false});
                                                    setTimeout(async () => {
                                                        await this.loadItem();
                                                        setTimeout(() => {
                                                            this.setState({rotateReload: false});
                                                        }, 500);
                                                    }, 500);
                                                }}
                                            >
                                                <Replay
                                                    sx={{
                                                        transition: this.state.rotateReload ? "rotate 0.5s" : "",
                                                        rotate: this.state.rotateReload ? '-405deg' : '-45deg',
                                                    }}
                                                />
                                            </IconButton>
                                        </Stack>
                                    </Paper>

                                    <Collapse in={this.state.searchLs} timeout={1000} sx={{width: "97%"}}>
                                        <Paper sx={{
                                            width: "100%",
                                            maxHeight: "15em",
                                            bgcolor: "rgba(0,0,0,0.5)",
                                            borderRadius: "0 0 4px 4px"
                                        }}>
                                            <Stack direction={"row"}>
                                                <List sx={{
                                                    width: "17%"
                                                }} dense>
                                                    {Object.keys(this.state.category).map((item, key) => {
                                                        return !isNaN(Number(item)) ?
                                                            <ListItemButton key={key}
                                                                            onClick={(e) => this.selectEl(this.state.Els.join(" > ") + " > " + item)}>
                                                                <Checkbox
                                                                    size={"small"}
                                                                    edge="start"
                                                                    tabIndex={-1}
                                                                    disableRipple
                                                                    checked={this.state.searchedSelect.includes(this.state.Els.join(" > ") + " > " + item)}
                                                                />
                                                                {item}
                                                            </ListItemButton> :
                                                            <ListItem key={key}>
                                                                <ListItemButton onClick={(e) => this.selectEl(item)}>
                                                                    <Checkbox
                                                                        size={"small"}
                                                                        edge="start"
                                                                        tabIndex={-1}
                                                                        disableRipple
                                                                        checked={this.state.searchedSelect.includes(item)}
                                                                    />
                                                                    {item}
                                                                </ListItemButton>
                                                                <ToggleButton
                                                                    sx={{border: 0}}
                                                                    size={"small"}
                                                                    value={"expend"}
                                                                    selected={this.state.Els[0] === item}
                                                                    onClick={(e) => {
                                                                        this.setState({Els: [item]});
                                                                    }}>
                                                                    <KeyboardArrowRight/>
                                                                </ToggleButton>
                                                            </ListItem>
                                                    })}
                                                </List>
                                                <Divider orientation="vertical" flexItem/>
                                                {this.state.Els[0] !== undefined &&
                                                    <List
                                                        sx={isNaN(Object.keys(this.state.category[this.state.Els[0]])[0]) ? {
                                                            width: "17%",
                                                            overflowY: "scroll",
                                                            maxHeight: "14em",
                                                        } : {
                                                            width: `${17 * 5}%`,
                                                            overflowY: "scroll",
                                                            maxHeight: "14em",
                                                        }}
                                                        dense
                                                    >
                                                        {Object.keys(this.state.category[this.state.Els[0]]).map((item, key) => {
                                                            return !isNaN(Number(item)) ?
                                                                <ListItemButton key={key}
                                                                                onClick={(e) => this.selectEl(this.state.Els.join(" > ") + " > " + this.state.category[this.state.Els[0]][item])}>
                                                                    <Checkbox
                                                                        size={"small"}
                                                                        edge="start"
                                                                        tabIndex={-1}
                                                                        disableRipple
                                                                        checked={this.state.searchedSelect.includes(this.state.Els.join(" > ") + " > " + this.state.category[this.state.Els[0]][item])}
                                                                    />
                                                                    {this.state.category[this.state.Els[0]][item]}
                                                                </ListItemButton> :
                                                                <ListItem key={key}>
                                                                    <ListItemButton
                                                                        onClick={(e) => this.selectEl(this.state.Els[0] + " > " + item)}>
                                                                        <Checkbox
                                                                            size={"small"}
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            disableRipple
                                                                            checked={this.state.searchedSelect.includes(this.state.Els[0] + " > " + item)}
                                                                        />
                                                                        {item}
                                                                    </ListItemButton>
                                                                    <ToggleButton
                                                                        sx={{border: 0}}
                                                                        size={"small"}
                                                                        value={"expend"}
                                                                        selected={this.state.Els[1] === item}
                                                                        onClick={(e) => {
                                                                            this.setState({Els: [this.state.Els[0], item]});
                                                                        }}>
                                                                        <KeyboardArrowRight/>
                                                                    </ToggleButton>
                                                                </ListItem>
                                                        })}
                                                    </List>
                                                }
                                                <Divider orientation="vertical" flexItem/>
                                                {this.state.Els[1] !== undefined &&
                                                    <List
                                                        sx={isNaN(Object.keys(this.state.category[this.state.Els[0]][this.state.Els[1]])[0]) ? {
                                                            width: "17%",
                                                            overflowY: "scroll",
                                                            maxHeight: "14em",
                                                        } : {
                                                            width: `${17 * 4}%`,
                                                            overflowY: "scroll",
                                                            maxHeight: "14em",
                                                        }}
                                                        dense>
                                                        {Object.keys(this.state.category[this.state.Els[0]][this.state.Els[1]]).map((item, key) => {
                                                            return !isNaN(Number(item)) ?
                                                                <ListItemButton key={key}
                                                                                onClick={(e) => this.selectEl(this.state.Els.join(" > ") + " > " + this.state.category[this.state.Els[0]][this.state.Els[1]][item])}>
                                                                    <Checkbox
                                                                        size={"small"}
                                                                        edge="start"
                                                                        tabIndex={-1}
                                                                        disableRipple
                                                                        checked={this.state.searchedSelect.includes(this.state.Els.join(" > ") + " > " + this.state.category[this.state.Els[0]][this.state.Els[1]][item])}
                                                                    />
                                                                    {this.state.category[this.state.Els[0]][this.state.Els[1]][item]}
                                                                </ListItemButton> :
                                                                <ListItem key={key}>
                                                                    <ListItemButton
                                                                        onClick={(e) => this.selectEl(this.state.Els[0] + " > " + this.state.Els[1] + " > " + item)}>
                                                                        <Checkbox
                                                                            size={"small"}
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            disableRipple
                                                                            checked={this.state.searchedSelect.includes(this.state.Els[0] + " > " + this.state.Els[1] + " > " + item)}
                                                                        />
                                                                        {item}
                                                                    </ListItemButton>
                                                                    <ToggleButton
                                                                        sx={{border: 0}}
                                                                        size={"small"}
                                                                        value={"expend"}
                                                                        selected={this.state.Els[2] === item}
                                                                        onClick={(e) => {
                                                                            this.setState({Els: [this.state.Els[0], this.state.Els[1], item]});
                                                                        }}>
                                                                        <KeyboardArrowRight/>
                                                                    </ToggleButton>
                                                                </ListItem>
                                                        })}
                                                    </List>
                                                }
                                                <Divider orientation="vertical" flexItem/>
                                                {this.state.Els[2] !== undefined &&
                                                    <List
                                                        sx={isNaN(Object.keys(this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]])[0]) ? {
                                                            width: "17%",
                                                            overflowY: "scroll",
                                                            maxHeight: "14em",
                                                        } : {
                                                            width: `${17 * 3}%`,
                                                            overflowY: "scroll",
                                                            maxHeight: "14em",
                                                        }}
                                                        dense>
                                                        {Object.keys(this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]]).map((item, key) => {
                                                            return !isNaN(Number(item)) ?
                                                                <ListItemButton key={key}
                                                                                onClick={(e) => this.selectEl(this.state.Els.join(" > ") + " > " + this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][item])}>
                                                                    <Checkbox
                                                                        size={"small"}
                                                                        edge="start"
                                                                        tabIndex={-1}
                                                                        disableRipple
                                                                        checked={this.state.searchedSelect.includes(this.state.Els.join(" > ") + " > " + this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][item])}
                                                                    />
                                                                    {this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][item]}
                                                                </ListItemButton> :
                                                                <ListItem key={key}>
                                                                    <ListItemButton
                                                                        onClick={(e) => this.selectEl(this.state.Els[0] + " > " + this.state.Els[1] + " > " + this.state.Els[2] + " > " + item)}>
                                                                        <Checkbox
                                                                            size={"small"}
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            disableRipple
                                                                            checked={this.state.searchedSelect.includes(this.state.Els[0] + " > " + this.state.Els[1] + " > " + this.state.Els[2] + " > " + item)}
                                                                        />
                                                                        {item}
                                                                    </ListItemButton>
                                                                    <ToggleButton
                                                                        sx={{border: 0}}
                                                                        size={"small"}
                                                                        value={"expend"}
                                                                        selected={this.state.Els[3] === item}
                                                                        onClick={(e) => {
                                                                            this.setState({Els: [this.state.Els[0], this.state.Els[1], this.state.Els[2], item]});
                                                                        }}>
                                                                        <KeyboardArrowRight/>
                                                                    </ToggleButton>
                                                                </ListItem>
                                                        })}
                                                    </List>
                                                }
                                                <Divider orientation="vertical" flexItem/>
                                                {this.state.Els[3] !== undefined &&
                                                    <List
                                                        sx={isNaN(Object.keys(this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][this.state.Els[3]])[0]) ? {
                                                            width: "17%",
                                                            overflowY: "scroll",
                                                            maxHeight: "14em",
                                                        } : {
                                                            width: `${17 * 2}%`,
                                                            overflowY: "scroll",
                                                            maxHeight: "14em",
                                                        }}
                                                        dense>
                                                        {Object.keys(this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][this.state.Els[3]]).map((item, key) => {
                                                            return !isNaN(Number(item)) ?
                                                                <ListItemButton key={key}
                                                                                onClick={(e) => this.selectEl(this.state.Els.join(" > ") + " > " + this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][this.state.Els[3]][item])}>
                                                                    <Checkbox
                                                                        size={"small"}
                                                                        edge="start"
                                                                        tabIndex={-1}
                                                                        disableRipple
                                                                        checked={this.state.searchedSelect.includes(this.state.Els.join(" > ") + " > " + this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][this.state.Els[3]][item])}
                                                                    />
                                                                    {this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][this.state.Els[3]][item]}
                                                                </ListItemButton> :
                                                                <ListItem key={key}>
                                                                    <ListItemButton
                                                                        onClick={(e) => this.selectEl(this.state.Els[0] + " > " + this.state.Els[1] + " > " + this.state.Els[2] + " > " + this.state.Els[3] + " > " + item)}>
                                                                        <Checkbox
                                                                            size={"small"}
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            disableRipple
                                                                            checked={this.state.searchedSelect.includes(this.state.Els[0] + " > " + this.state.Els[1] + " > " + this.state.Els[2] + " > " + this.state.Els[3] + " > " + item)}
                                                                        />
                                                                        {item}
                                                                    </ListItemButton>
                                                                    <ToggleButton
                                                                        sx={{border: 0}}
                                                                        size={"small"}
                                                                        value={"expend"}
                                                                        selected={this.state.Els[4] === item}
                                                                        onClick={(e) => {
                                                                            this.setState({Els: [this.state.Els[0], this.state.Els[1], this.state.Els[2], this.state.Els[3], item]});
                                                                        }}>
                                                                        <KeyboardArrowRight/>
                                                                    </ToggleButton>
                                                                </ListItem>
                                                        })}
                                                    </List>
                                                }
                                                <Divider orientation="vertical" flexItem/>
                                                {this.state.Els[4] !== undefined &&
                                                    <List
                                                        sx={isNaN(Object.keys(this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][this.state.Els[3]][this.state.Els[4]])[0]) ? {
                                                            width: "17%",
                                                            overflowY: "scroll",
                                                            maxHeight: "14em",
                                                        } : {
                                                            width: `${17}%`,
                                                            overflowY: "scroll",
                                                            maxHeight: "14em",
                                                        }}
                                                        dense>
                                                        {Object.keys(this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][this.state.Els[3]][this.state.Els[4]]).map((item, key) => {
                                                            return !isNaN(Number(item)) ?
                                                                <ListItemButton key={key}
                                                                                onClick={(e) => this.selectEl(this.state.Els.join(" > ") + " > " + this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][this.state.Els[3]][this.state.Els[4]][item])}>
                                                                    <Checkbox
                                                                        size={"small"}
                                                                        edge="start"
                                                                        tabIndex={-1}
                                                                        disableRipple
                                                                        checked={this.state.searchedSelect.includes(this.state.Els.join(" > ") + " > " + this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][this.state.Els[3]][this.state.Els[4]][item])}
                                                                    />
                                                                    {this.state.category[this.state.Els[0]][this.state.Els[1]][this.state.Els[2]][this.state.Els[3]][this.state.Els[4]][item]}
                                                                </ListItemButton> :
                                                                <ListItem key={key}>
                                                                    <ListItemButton
                                                                        onClick={(e) => this.selectEl(this.state.Els[0] + " > " + this.state.Els[1] + " > " + this.state.Els[2] + " > " + this.state.Els[3] + " > " + this.state.Els[4] + " > " + item)}>
                                                                        <Checkbox
                                                                            size={"small"}
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            disableRipple
                                                                            checked={this.state.searchedSelect.includes(this.state.Els[0] + " > " + this.state.Els[1] + " > " + this.state.Els[2] + " > " + this.state.Els[3] + " > " + this.state.Els[4] + " > " + item)}
                                                                        />
                                                                        {item}
                                                                    </ListItemButton>
                                                                    <ToggleButton
                                                                        sx={{border: 0}}
                                                                        size={"small"}
                                                                        value={"expend"}
                                                                        selected={this.state.Els[5] === item}
                                                                        onClick={(e) => {
                                                                            this.setState({Els: [this.state.Els[0], this.state.Els[1], this.state.Els[2], this.state.Els[3], this.state.Els[4], item]});
                                                                        }}>
                                                                        <KeyboardArrowRight/>
                                                                    </ToggleButton>
                                                                </ListItem>
                                                        })}
                                                    </List>
                                                }
                                            </Stack>
                                        </Paper>
                                    </Collapse>
                                    {
                                        this.state.display === "card" ? <Container
                                                sx={{
                                                    mt: 3,
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    justifyContent: "space-around",
                                                    overflow: "auto",
                                                    width: "100%",
                                                }}
                                                className={"scrollBar"}
                                            >
                                                {this.state.noItem ?  <Stack sx={{ width: "90%", height: "50vh" }} alignItems={"center"} justifyContent={"center"}>
                                                    <Typography variant={"h1"} color={"gray"}>暫無商品</Typography>
                                                </Stack> : this.state.items.length === 0 ? [345, 551, 642, 352, 465, 522].map((item, index) => {
                                                    return (<Card sx={{width: item, m: 3}} elevation={6}>
                                                        <CardHeader
                                                            avatar={
                                                                <Skeleton variant="circular" width={40} height={40}/>
                                                            }
                                                            action={
                                                                <>
                                                                    <IconButton disabled>
                                                                        <Favorite/>
                                                                    </IconButton>
                                                                    <IconButton disabled>
                                                                        <Share/>
                                                                    </IconButton>
                                                                    <IconButton disabled>
                                                                        <MoreVert/>
                                                                    </IconButton>
                                                                </>
                                                            }
                                                            title={<Skeleton variant="rounded" height={20}/>}
                                                            subheader={<Skeleton variant="text"
                                                                                 sx={{fontSize: '1rem', width: "60%"}}/>}
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
                                                }) :  this.getFiltedItems().length > 0 ? this.getFiltedItems().map((item, index) => {
                                                    return (<Card sx={{
                                                        width: "auto",
                                                        m: 2,
                                                        minWidth: 300,
                                                        height: "fit-content"
                                                    }} elevation={6}
                                                    >

                                                        <CardHeader
                                                            avatar={
                                                                <Avatar
                                                                    src={this.state.shop.avatar}
                                                                    alt={this.state.shop.shopName}
                                                                    sx={{
                                                                        height: 40,
                                                                        width: 40
                                                                    }}
                                                                />
                                                            }
                                                            action={
                                                                <>
                                                                    <IconButton>
                                                                        <Favorite/>
                                                                    </IconButton>
                                                                    <IconButton>
                                                                        <Share/>
                                                                    </IconButton>
                                                                    <IconButton>
                                                                        <MoreVert/>
                                                                    </IconButton>
                                                                </>
                                                            }
                                                            title={<Typography
                                                                variant={"h5"}>{this.state.shop.shopName}</Typography>}
                                                            subheader={<Typography sx={{fontSize: '1rem', width: "60%"}}>
                                                                {this.state.shop.short && this.state.shop.short + " - "}
                                                            </Typography>}
                                                        />

                                                        {
                                                            item.imageList?.length !== 0 &&
                                                            <Box sx={{
                                                                position: 'relative',
                                                                filter: "drop-shadow(2px 4px 6px black)"
                                                            }}>
                                                                <AutoPlaySwipeableViews
                                                                    index={this.state.pag[index]}
                                                                    onChangeIndex={(i) => {
                                                                        let newPag = this.state.pag;
                                                                        newPag[index] = i;
                                                                        this.setState({pag: newPag})
                                                                    }}
                                                                >
                                                                    {
                                                                        item.imageList?.map((url, index) => {
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
                                                                <Pagination
                                                                    dots={item.imageList?.length}
                                                                    index={this.state.pag[index]}
                                                                    onChangeIndex={(i) => {
                                                                        let newPag = this.state.pag;
                                                                        newPag[index] = i;
                                                                        this.setState({pag: newPag})
                                                                    }}
                                                                />
                                                            </Box>
                                                        }
                                                        <CardActionArea>
                                                            <CardContent>
                                                                <Stack direction={"row"} justifyContent={"space-between"}>
                                                                    <Stack>
                                                                        <Typography fontSize={'1rem'} color={"darkgray"}>
                                                                            {item.others ? item.selectedCategoryOther : item.selectedCategory.join("\n")}
                                                                        </Typography>
                                                                        <Typography variant={"h3"}>
                                                                            {item.name}
                                                                        </Typography>
                                                                        <Typography variant={"p"} color={"gray"}>
                                                                            {item.desc}
                                                                        </Typography>
                                                                    </Stack>
                                                                    <Box sx={{width: 60}}/>
                                                                    <Stack justifyContent={"space-between"} sx={{
                                                                        "*": {
                                                                            textAlign: "right"
                                                                        }
                                                                    }}>
                                                                        <Typography color={"lightgreen"} fontSize={"1.25rem"}>
                                                                            <a style={{
                                                                                fontSize: "2.5rem"
                                                                            }}>${Math.min(...item.price.map(i => i[0] / i[1]))}</a><sub>/{item.unit}</sub>
                                                                        </Typography>
                                                                        {item.record.length < 1 ?
                                                                            <Typography variant={"h4"} color={"red"}>
                                                                                無庫存
                                                                            </Typography> : <Tooltip
                                                                                title={<Typography variant={"h5"}
                                                                                                   textAlign={"center"}>最近最新鮮的進貨日期:<br/>{`${('0' + (new Date(Math.max(...item.record.map(r => new Date(r.time))))).getDate()).slice(-2)}-${('0' + ((new Date(Math.max(...item.record.map(r => new Date(r.time))))).getMonth() + 1)).slice(-2)}-${(new Date(Math.max(...item.record.map(r => new Date(r.time))))).getFullYear()}`}
                                                                                </Typography>}>
                                                                                <Typography
                                                                                    color={getValueColor(Math.min(...item.record.map(r => Math.floor((new Date() - new Date(r.time)) / (1000 * 60 * 60 * 24)))))}
                                                                                    variant={"h4"}
                                                                                >
                                                                                    {Math.min(...item.record.map(r => Math.floor((new Date() - new Date(r.time)) / (1000 * 60 * 60 * 24))))}日{Math.min(...item.record.map(r => Math.floor((new Date() - new Date(r.time)) / (1000 * 60 * 60) % 24)))}小時
                                                                                </Typography></Tooltip>
                                                                        }
                                                                    </Stack>
                                                                </Stack>
                                                            </CardContent>
                                                        </CardActionArea>
                                                    </Card>)
                                                }) : <Stack sx={{ width: "100%", height: "50vh" }} alignItems={"center"} justifyContent={"center"}>
                                                    <Typography variant={"h1"} color={"gray"}>沒有搜尋結果</Typography>
                                                </Stack>}
                                            </Container> // Card UI
                                            : <Container
                                                sx={{
                                                    overflow: "auto",
                                                    width: "100%",
                                                }}
                                            >
                                                <List sx={{
                                                    bgcolor: "rgba(255,255,255,0.1)",
                                                    borderRadius: "0 0 4px 4px",
                                                    boxShadow: "rgba(0,0,0,0.5) 0 5px 1em",
                                                    mb: "1em"
                                                }}>
                                                    {this.state.noItem ?  <Stack sx={{ width: "100%", height: "50vh" }} alignItems={"center"} justifyContent={"center"}>
                                                        <Typography variant={"h1"} color={"gray"}>暫無商品</Typography>
                                                    </Stack> : this.state.items.length === 0 ? [345, 551, 642, 352, 465, 522].map((item, index) => {
                                                        return <>
                                                            <ListItem sx={{
                                                                transition: "background-color 0.5s",
                                                                ":hover": {
                                                                    bgcolor: "rgba(255,255,255,0.1)"
                                                                }
                                                            }}>
                                                                <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                                                    <Skeleton variant="circular" width={50} height={50}/>
                                                                    <Stack>
                                                                        <Skeleton variant="rounded" height={20} width={120}/>
                                                                        <Skeleton variant="text" sx={{fontSize: '1rem'}}
                                                                                  width={100}/>
                                                                    </Stack>
                                                                </Stack>
                                                                <Stack direction={"row"} spacing={4} width={"100%"}
                                                                       justifyContent={"center"} alignItems={"center"}>
                                                                    <Stack alignItems={"center"}>
                                                                        <Skeleton variant="text"
                                                                                  sx={{fontSize: '1rem', width: "60%"}}
                                                                                  width={300}/>
                                                                        <Skeleton variant="rounded" height={40} width={200}/>
                                                                    </Stack>
                                                                    <Skeleton variant="rounded" height={60} width={80}/>
                                                                    <Skeleton variant="rounded" height={60} width={120}/>
                                                                </Stack>
                                                                <Stack direction={"row"} spacing={0}>
                                                                    <IconButton disabled>
                                                                        <Favorite/>
                                                                    </IconButton>
                                                                    <IconButton disabled>
                                                                        <Share/>
                                                                    </IconButton>
                                                                    <IconButton disabled>
                                                                        <MoreVert/>
                                                                    </IconButton>
                                                                </Stack>
                                                            </ListItem>
                                                            {index + 1 !== this.state.items.length &&
                                                                <Divider/>}
                                                        </>
                                                    }) : this.getFiltedItems().length > 0 ? this.getFiltedItems().map((item, index)  => {
                                                        return <>
                                                            <ListItem sx={{
                                                                transition: "background-color 0.5s",
                                                                ":hover": {
                                                                    bgcolor: "rgba(255,255,255,0.1)"
                                                                }
                                                            }}>
                                                                <Stack width={"20%"} direction={"row"} spacing={2}
                                                                       alignItems={"center"}>
                                                                    <Avatar
                                                                        src={this.state.shop.avatar}
                                                                        alt={this.state.shop.shopName}
                                                                        sx={{
                                                                            height: 50,
                                                                            width: 50
                                                                        }}
                                                                    />
                                                                    <Stack>
                                                                        <Typography
                                                                            variant={"h5"}>{this.state.shop.shopName}</Typography>
                                                                        <Typography sx={{fontSize: '1rem', width: "60%"}}>
                                                                            {this.state.shop.short && this.state.shop.short}
                                                                        </Typography>
                                                                    </Stack>
                                                                </Stack>
                                                                <Stack direction={"row"} spacing={4} width={"35%"}
                                                                       justifyContent={"center"} alignItems={"center"}>
                                                                    <Stack alignItems={"center"}>
                                                                        <Typography fontSize={'1rem'} color={"darkgray"}>
                                                                            {item.others ? item.selectedCategoryOther : item.selectedCategory.join("\n")}
                                                                        </Typography>
                                                                        <Typography variant={"h3"}>
                                                                            {item.name}
                                                                        </Typography>
                                                                    </Stack>
                                                                </Stack>
                                                                <Typography width={"15%"} color={"lightgreen"}
                                                                            fontSize={"1.25rem"}
                                                                            textAlign={"center"}>
                                                                    <a style={{
                                                                        fontSize: "2.5rem"
                                                                    }}>${Math.min(...item.price.map(i => i[0] / i[1]))}</a><sub>/{item.unit}</sub>
                                                                </Typography>
                                                                {item.record.length < 1 ?
                                                                    <Typography variant={"h5"} color={"red"} width={"15%"}
                                                                                textAlign={"center"}>
                                                                        無庫存
                                                                    </Typography> : <Tooltip
                                                                        width={"15%"}
                                                                        title={<Typography variant={"h6"}
                                                                                           textAlign={"center"}>最近最新鮮的進貨日期:<br/>{`${('0' + (new Date(Math.max(...item.record.map(r => new Date(r.time))))).getDate()).slice(-2)}-${('0' + ((new Date(Math.max(...item.record.map(r => new Date(r.time))))).getMonth() + 1)).slice(-2)}-${(new Date(Math.max(...item.record.map(r => new Date(r.time))))).getFullYear()}`}
                                                                        </Typography>}>
                                                                        <Typography
                                                                            textAlign={"center"}
                                                                            color={getValueColor(Math.min(...item.record.map(r => Math.floor((new Date() - new Date(r.time)) / (1000 * 60 * 60 * 24)))))}
                                                                            variant={"h5"}
                                                                        >
                                                                            {Math.min(...item.record.map(r => Math.floor((new Date() - new Date(r.time)) / (1000 * 60 * 60 * 24))))}日{Math.min(...item.record.map(r => Math.floor((new Date() - new Date(r.time)) / (1000 * 60 * 60) % 24)))}小時
                                                                        </Typography></Tooltip>
                                                                }
                                                                <Stack width={"15%"} direction={"row"} spacing={0}>
                                                                    <IconButton>
                                                                        <Favorite/>
                                                                    </IconButton>
                                                                    <IconButton>
                                                                        <Share/>
                                                                    </IconButton>
                                                                    <IconButton>
                                                                        <MoreVert/>
                                                                    </IconButton>
                                                                </Stack>
                                                            </ListItem>
                                                            {
                                                                index + 1 !== this.state.items.length &&
                                                                <Divider/>
                                                            }
                                                        </>
                                                    }) : <Stack sx={{ width: "100%", height: "50vh" }} alignItems={"center"} justifyContent={"center"}>
                                                    <Typography variant={"h1"} color={"gray"}>沒有搜尋結果</Typography>
                                                </Stack>}
                                                </List>
                                            </Container>
                                    }

                                </Stack>
                            </TabPanel>
                            <TabPanel value={"rating"}>
                                rating
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