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
    ListItem, InputAdornment, Box, Button, FormControlLabel, Pagination
} from "@mui/material";
import {
    ArrowRight, Dashboard,
    ExpandMore,
    Favorite, FormatListBulleted, KeyboardArrowRight,
    KeyboardDoubleArrowRight,
    ListAlt,
    MoreVert, Replay, Search,
    Share
} from "@mui/icons-material";
import "../styles/Buy.css"
import Requires from "../util/requires";
import {ItemDisplay} from "../components/shop/ItemDisplay";
import {transformObject} from "../util/functions";

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

            category: {},
            Els: [],
            display: "card",
            searchable: false,
            noResults: false,

            pag: 0,
            count: 0,
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
        await this.loadItem()
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
        });

        items.map(async (item, index) => {
            await Requires.get("/shops/get/" + item.shopId).then((shop) => {
                console.log(shop);
                if (shop.status === 200) {
                    let shops = this.state.shops;
                    shops.push(shop.data);
                    this.setState({
                        shops: shops
                    })
                }
            });
        });
    }

    loadItems = async () => {
        let items = await Requires.get("/shops/search", {}, {
            name: this.state.name,
            selectedCategory: JSON.stringify(this.state.searchedSelect),
            sortBy: this.state.sort,
            un: this.state.un,
            favorited: this.state.user && this.state.favorite ? JSON.stringify(this.state.user.favorited) : "[]",
            noSave: this.state.noSave,
            page: this.state.pag
        });
        this.setState({ count: items.data.count })
        if (items.status === 200) {
            return items.data.items;
        }
    }

    render() {
        return <Stack alignItems={"center"} width={"calc(100% - 6em)"} p={"3em"} pt={0}>
            <Paper sx={{
                width: "90%",
                bgColor: "rgba(255,255,255,0.01)",
                position: "absolute",
                zIndex: 99,
                mt: "3em"
            }} elevation={12}>
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
                                        <MenuItem value={"price"}>價格</MenuItem>
                                        <MenuItem value={"fresh"}>新鮮</MenuItem>
                                    </Select>
                                </FormControl>

                                <IconButton
                                    onClick={(e) => this.setState({un: !this.state.un})}
                                    sx={{
                                        rotate: this.state.un ? "180deg" : "0deg",
                                        transition: "rotate 1s",
                                        width: "2em",
                                    }}
                                >
                                    <ExpandMore/>
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
                    shops={this.state.shops}
                    display={this.state.display}
                    loadItems={this.loadItem}
                    items={this.state.items}
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