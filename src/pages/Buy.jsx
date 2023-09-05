import React, {Component} from "react";
import {
    Container,
    Card,
    CardHeader,
    IconButton,
    CardContent,
    ListItemIcon,
    CardActions,
    Skeleton,
    Divider,
    Stack,
    List,
    MenuItem,
    Typography,
    ListItemText,
    Paper,
    TextField,
    ToggleButton,
    Autocomplete,
    Tooltip,
    Chip,
    FormControl,
    InputLabel,
    Select,
    ToggleButtonGroup,
    Collapse,
    ListItemButton,
    Checkbox,
    ListItem,
    InputAdornment,
    Box,
    Button,
    FormControlLabel,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    Snackbar,
    Alert
} from "@mui/material";
import {
    ArrowRight, Dashboard,
    ExpandMore,
    Favorite, FormatListBulleted, KeyboardArrowRight,
    KeyboardDoubleArrowRight,
    ListAlt,
    MoreVert, Replay, Search,
    Share, Sort
} from "@mui/icons-material";
import "../styles/Buy.css"
import Requires from "../util/requires";
import {ItemDisplay} from "../components/shop/ItemDisplay";
import {transformObject} from "../util/functions";
import mapboxgl from "mapbox-gl";
import {LoadingButton} from "@mui/lab";

class Buy extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            searchedSelect: [],
            sort: "name",
            un: false,
            favorite: false,
            noSave: true,

            items: [],
            shops: [],
            position: [],

            category: {},
            Els: [],
            display: window.localStorage.getItem("display") === "list" ? "list": "card",
            searchable: false,
            noResults: false,

            pag: 0,
            count: 0,

            positionDl: false,

            // sb
            sb: false,
            sbS: "",
            sbMsg: "",
        };
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
        if (JSON.stringify([this.state.name, this.state.searchedSelect, this.state.sort, this.state.un, this.state.favorite, this.state.noSave]) !==
            JSON.stringify([prevState.name, prevState.searchedSelect, prevState.sort, prevState.un, prevState.favorite, prevState.noSave])) {
            this.setState({
                searchable: true
            })
        }
    }

    selectEl = (i) => {
        this.setState({
            searchable: true
        })
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
        let category = await Requires.get("/data/category");
        if (category.status === 200) {
            this.setState({
                category: category.data,
            })
        }
        let user = await Requires.get("/users/test");
        if (user.status === 200) {
            this.setState({
                user: user.data,
            })
        }
        let allow = window.localStorage.getItem("allowLocation");
        console.log(allow);
        if (allow === null) {
            this.setState({ positionDl: true, })
        } else if (allow === "true") {
            await this.getLocation();
        } else {
            await this.loadItem()
        }
    }
    async getLocation() {
        let positions;
        if ("geolocation" in navigator) {
            window.localStorage.setItem("allowLocation", "true");
            this.setState({
                gettingLocation: true
            });
            navigator.geolocation.getCurrentPosition(async (position) => {
                    positions = [position.coords.latitude, position.coords.longitude]

                    console.log(positions)
                    this.setState({
                        gettingLocation: false,
                        position: positions,
                        positionDl: false,
                        sort: "distance",
                    });
                    setTimeout(async () => await this.loadItem(), 100);
                }, async (error) => {
                    let msg;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            msg = "User denied the request for Geolocation.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            msg = "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            msg = "The request to get user location timed out.";
                            break;
                        case error.UNKNOWN_ERROR:
                            msg = "An unknown error occurred.";
                            break;
                    }

                    this.setState({
                        gettingLocation: false,
                        sb: true,
                        sbS: "error",
                        sbMsg: msg,
                        positionDl: false,
                    });
                    await this.loadItem();
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
        } else {
            positions = [-1, -1]
        }
    }

    loadItem = async () => {
        this.setState({
            items: [],
            shops: [],
        })
        let items = await this.loadItems();
        items = items ? items : [];
        this.setState({
            items: items,
            noResults: items.length === 0
        });
    }

    loadItems = async () => {
        let items = await Requires.get("/shops/search", {}, {
            name: this.state.name,
            selectedCategory: JSON.stringify(this.state.searchedSelect),
            sortBy: this.state.sort,
            un: this.state.un,
            favorited: this.state.user && this.state.favorite ? this.state.user.user_id : "None",
            noSave: this.state.noSave,
            page: this.state.pag,
            position: JSON.stringify(this.state.position),
        });
        this.setState({ count: items.data.count })
        if (items.status === 200) {
            return items.data.items;
        }
    }

    render() {
        return <Stack alignItems={"center"} width={"calc(100% - 6em)"} p={"3em"} pt={0}>
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
            <Paper sx={{
                width: "90%",
                bgColor: "rgba(255,255,255,0.01)",
                position: "absolute",
                zIndex: 99,
                mt: "3em"
            }} elevation={12}>

                <Dialog open={this.state.positionDl} maxWidth={"md"} fullWidth>
                    <DialogTitle>
                        <Typography variant={"h3"}>
                            請允許使用來獲取您當前的位置
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Stack alignItems={"center"}>
                            <Typography variant={"h6"} color={"lightgray"} textAlign={"center"}>
                                尋找最近的店舖時，我們需要知道您的目前位置。請按下面的按鈕，允許我們自動獲取您的位置資訊。
                            </Typography>
                            <LoadingButton loading={this.state.gettingLocation} variant={"outlined"} onClick={async (e) => {
                                this.setState({ gettingLocation: true })
                                await this.getLocation();
                            }}>
                                <Typography variant={"h4"}>
                                    獲取我的位置
                                </Typography>
                            </LoadingButton>
                            <Typography variant={"h6"} color={"lightgray"} textAlign={"center"}>
                                請放心，我們尊重您的隱私，我們只會使用您的位置資訊來尋找最近的店舖。您的位置資料不會被儲存或與任何第三方分享。
                                <br/>
                                通過提供您的目前位置，我們可以為您提供有關附近店舖的準確且相關的資訊，包括距離和路線。這將大大提升您的購物體驗，幫助您更輕鬆地找到您需要的物品。
                                <br/>
                                感謝您允許我們獲取您的位置！如果您對於隱私或位置資料的使用有任何疑慮或問題，請隨時聯繫我們的支援團隊。祝您購物愉快！
                            </Typography>
                            <Button onClick={async () => {
                                this.setState({positionDl: false, sort: "name"});
                                await this.loadItem();
                            }}>
                                拒絕
                            </Button>
                            <Button color={"error"} onClick={async () => {
                                window.localStorage.setItem("allowLocation", false)
                                this.setState({positionDl: false, sort: "name"});
                                await this.loadItem();
                            }}>
                                不要再次詢問
                            </Button>
                        </Stack>
                    </DialogContent>
                </Dialog>

                <Stack width={"100%"} alignItems={"center"}>
                    <Stack direction={"row"} width={"100%"}>
                        <TextField
                            value={this.state.name}
                            label={"Search"}
                            variant={"filled"}
                            onChange={(e) => this.setState({name: e.target.value})}
                            fullWidth
                            size="big"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search/>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button variant={"contained"} color={"success"} disabled={!this.state.searchable}
                                onClick={async () => {
                                    this.setState({
                                        searchable: false,
                                        pag: 0,
                                    });
                                    await this.loadItem();
                                }}>
                            <Typography variant={"h6"}>
                                Search
                            </Typography>
                        </Button>
                    </Stack>
                    <Stack width={"100%"} direction={"row"} justifyContent={"center"}>
                        <Stack width={"50%"} direction={"row"} justifyContent={"center"}>
                            <ToggleButton
                                value={"listAlt"}
                                selected={this.state.searchLs}
                                onClick={(e) => this.setState({searchLs: !this.state.searchLs})}
                            >
                                <ListAlt/>
                            </ToggleButton>
                            <Autocomplete
                                fullWidth
                                disabled={this.state.loading}
                                multiple
                                sx={{height: "3em"}}
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
                        <Stack width={"50%"} direction={"row"} justifyContent={"space-evenly"}>
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
                                        <MenuItem value={"distance"} onClick={(e) => {
                                            this.state.position.length === 0 && this.setState({ positionDl: true })
                                        }}>距離</MenuItem>
                                        <MenuItem value={"price"}>價格</MenuItem>
                                        <MenuItem value={"fresh"}>新鮮</MenuItem>
                                    </Select>
                                </FormControl>

                                <IconButton
                                    onClick={(e) => this.setState({reverse: !this.state.reverse})}
                                    sx={{
                                        width: "2em",
                                    }}
                                >
                                    <Sort
                                        sx={{
                                            transform: this.state.reverse ? "rotateX(180deg)" : "rotateX(0deg)",
                                            transition: "transform 1s",
                                        }}
                                    />
                                </IconButton>
                            </Stack>

                            <ToggleButton
                                selected={this.state.favorite}

                                animate={{scale: [1, 1.3, 0.8, 1.2, 1]}}
                                transition={{duration: 0.5}}
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

                            <Tooltip title={<Typography variant={"h5"}>Show no save items</Typography>}>
                                <Checkbox
                                    checked={this.state.noSave}
                                    defaultChecked
                                    onChange={(e, n) => this.setState({noSave: n})}
                                />
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Stack>
                <Collapse in={this.state.searchLs} timeout={1000} sx={{width: "100%"}}>
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

            </Paper>
            <Box sx={{maxHeight: "75vh", overflowY: "auto", pt: "10em", width: "100%"}}>
                <ItemDisplay
                    owner={false}
                    buy={true}
                    display={this.state.display}
                    loadItems={this.loadItem}
                    showDistance={this.state.sort === "distance"}
                    items={this.state.items}
                    noResults={this.state.noResults}

                    showItem={this.state.showItem}
                    clean={() => this.setState({showItem: null})}
                />
            </Box>
            <Box
                sx={{
                    position: "absolute",
                    bottom: "1em",
                    zIndex: 99,
                    border: "rgba(255,255,255,0.2) solid 2px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.3)",
                    backdropFilter: "blur(4px)",
                    padding: "1em"
                }}
            >
                <Pagination
                    count={Math.ceil(this.state.count / 5)}
                    variant={"text"}
                    size={"large"}
                    onChange={async (e, n) => {
                        this.setState({pag: n-1});
                        setTimeout(async () => await this.loadItem(), 100);
                    }}
                    color={"secondary"}
                />
            </Box>
        </Stack>
    }
}

export default Buy;