import {
    Alert,
    Autocomplete,
    Avatar, Backdrop,
    Box,
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardHeader,
    CardMedia,
    Checkbox,
    Chip,
    Collapse,
    Container,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    ImageList, ImageListItem,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    Snackbar,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    Pagination as Paginations
} from "@mui/material";
import {
    Check, Close,
    Dashboard,
    ExpandMore,
    Favorite,
    FormatListBulleted, Image,
    KeyboardArrowRight,
    ListAlt, MoreVert, OpenInNew,
    Replay, Share, Sort, Star, Warning,
} from "@mui/icons-material";
import {AutoPlaySwipeableViews, getValueColor, transformObject, uploader} from "../../util/functions";
import Pagination from "../Pagination";
import {AddItemDl} from "./AddItemDl";
import Item from "../../pages/Item";
import Requires from "../../util/requires";
import React, {Component} from "react";
import {UploadDropzone} from "react-uploader";
import {Rating} from "@mui/lab";
import SwipeableViews from "react-swipeable-views";

export class ItemDisplay extends Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.state = {

            user: {},
            shop: props.shop,
            imgIndex: 0,
            editing: false,
            loading: false,
            uploadedPhoto: null,
            tab: "item",

            // item
            items: this.props.buy ? this.props.items : [],
            pag: [],
            noItem: false,
            selectedItem: null,
            showImages: [],
            showImagesPag: 0,

            // filter
            search: "",
            searchLs: false,
            searchedSelect: [],
            Els: [],
            display: window.localStorage.getItem("display") === "list" ? "list" : "card",
            favorite: false,
            sort: "name",
            reverse: false,

            // add item
            addDl: false,
            imageList: [],
            category: {},
            categorySelect: [],
            selectedCategory: [],
            name: "",
            unit: "",
            desc: "",
            selectedCategoryOther: "",
            others: false,
            barCode: "",
            price: [
                [null, null]
            ],

            // sb
            sb: false,
            sbS: "",
            sbMsg: "",

            // report
            reportDl: false,
            report: {
                photos: []
            },
        }
    }

    onFavorite = async (un, _id) => {
        let res = await Requires.put("/users/marked/" + _id, {
            action: un ? "unfavorite" : "favorite"
        });
        this.setState({
            user: {
                ...this.state.user,
                favorited: res.data.favorited,
            }
        })
    }
    getFiltedItems = () => {
        return this.props.buy ? this.props.items : this.state.items.filter((i) => {
            return (this.state.user.favorited?.includes(i._id.toString()) || !this.state.favorite) &&
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
                ) && !i.deleted
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
    loadItem = async () => {
        if (this.props.buy) {
            this.setState({
                items: this.props.items
            })
        } else {
            let res = this.props.owner ? await Requires.get("/shops/items!/" + this.state.shop?._id) : await Requires.get("/shops/items/" + this.state.shop?._id);
            if (res.status === 200) {
                this.setState({
                    items: res.data.items,
                    pag: Array(res.data.items.length).fill(0),
                    noItem: res.data.items.length < 1
                });
                setTimeout(() => {
                    if (this.props.showItem) {
                        this.setState({
                            selectedItem: this.state.items.filter(i => i._id.toString() === this.props.showItem)[0]
                        });
                        this.props.clean();
                    } else if (window.location.href.includes("?")) {
                        let obj = Object.fromEntries(new URLSearchParams(window.location.href.split("?")[1]));

                        if (obj.itemId) {
                            if (this.state.items.map(i => i._id.toString() === obj.itemId).includes(true)) {
                                this.setState({
                                    selectedItem: this.state.items.filter(i => i._id.toString() === obj.itemId)[0]
                                });
                                delete obj.itemId;
                                window.location.hash = window.location.hash.split("?")[0] + new URLSearchParams(obj).toString();
                            }
                        }
                    }
                }, 100)
            } else {
                this.setState({
                    loading: false,
                    sb: true, sbS: "error", sbMsg: res.data.error_description
                });
            }
        }
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
        await this.loadItem();
    }


    render() {
        return <>
            <Backdrop
                open={this.state.showImages.length !== 0}
                sx={{zIndex: 999}}
            >
                <IconButton
                    size={"large"}
                    onClick={(e) => this.setState({showImages: [], showImagesPag: 0})}
                    sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        "*": {

                            fontSize: "5rem"
                        }
                    }}
                >
                    <Close />
                </IconButton>
                <SwipeableViews index={this.state.showImagesPag}>
                    {this.state.showImages.map((url, index) => {
                        return <Stack height={"100%"} justifyContent={"center"}>
                            <img src={url} alt={url} style={{
                                width: "100%"
                            }}/>
                        </Stack>
                    })}
                </SwipeableViews>
                <Paginations
                    sx={{
                        position: "absolute",
                        bottom: "2em",
                        backdropFilter: "blur(4px)",
                        background: "rgba(0,0,0,0.25)",
                        p: 2,
                    }}
                    count={this.state.showImages.length}
                    size={"large"}
                    variant={"text"}
                    shape={"rounded"}
                    onChange={(e, n) => this.setState({ showImagesPag: n-1 })}
                />
            </Backdrop>
            <Dialog
                open={this.state.reportDl}
                maxWidth={"md"}
                fullWidth
            >
                <DialogTitle>
                    <Typography variant={"h2"}>
                        Report
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Stack width={"calc(100% - 4em)"} spacing={2} padding={"2em"}>
                        <TextField
                            label={"Reason"}
                            value={this.state.report.reason}
                            fullWidth
                            onChange={(e) => this.setState({
                                report: {
                                    ...this.state.report,
                                    reason: e.target.value
                                }
                            })}
                        />
                        <TextField
                            label={"Details"}
                            value={this.state.report.details}
                            fullWidth
                            multiline
                            minRows={5}
                            onChange={(e) => this.setState({
                                details: {
                                    ...this.state.report,
                                    details: e.target.value
                                }
                            })}
                        />
                        <Stack direction={"row"}>
                            <UploadDropzone
                                uploader={uploader}
                                options={{
                                    multi: true,
                                }}

                                onUpdate={files => this.setState({
                                    report: {
                                        ...this.state.report,
                                        photos: files.map((f) => f.fileUrl)
                                    }
                                })}
                                width={"50%"}
                                height={"20em"}
                            />

                            {this.state.report.photos?.length === 0 ?
                                <Stack width={"50%"} alignItems={"center"}
                                       justifyContent={"center"}>
                                    <Typography variant={"h6"} color={"darkgray"}>
                                        No Image
                                    </Typography>
                                </Stack> : <ImageList sx={{
                                    width: "50%",
                                    height: "18em"
                                }}>
                                    {this.state.report.photos?.map((item) => (
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
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        color={"error"} variant={"text"}
                        onClick={(e) => this.setState({reportDl: false})}
                    >
                        Cancel
                    </Button>
                    <Button color={"warning"} variant={"contained"} onClick={async () => {
                        // TODO report action
                    }}>
                        Report
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar anchorOrigin={{horizontal: "right", vertical: "bottom"}}
                      open={this.state.needLoginSb} autoHideDuration={10000}
                      onClose={() => this.setState({needLoginSb: false})}
            >
                <Alert onClose={() => this.setState({needLoginSb: false})}
                       severity={"error"}
                       sx={{width: '100%'}}>
                    You need to Login / Signup first
                </Alert>
            </Snackbar>
            <Stack alignItems={"center"}>
                {this.props.owner && <Button
                    fullWidth
                    variant={"outlined"}
                    color={"success"}
                    onClick={(e) => this.setState({addDl: true})}
                >新增商品</Button>}
                {!this.props.buy &&
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
                }

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
                            {
                                this.state.Els[1] !== undefined &&
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
                    (this.props.buy ? this.props.display : this.state.display) === "card" ? <Box
                            sx={{
                                mt: 3,
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "space-around",
                                alignItems: "center",
                                overflow: "auto",
                                width: "100%",
                            }}
                            className={"scrollBar"}
                        >
                            {(this.props.buy ? this.props.noResults : this.state.noItem) ?
                                <Stack sx={{width: "90%", height: "50vh"}} alignItems={"center"}
                                       justifyContent={"center"}>
                                    <Typography variant={"h1"} color={"gray"}>暫無商品</Typography>
                                </Stack> : (this.props.buy ? this.props.items : this.state.items).length === 0 ? [345, 551, 642, 352, 465, 522].map((item, index) => {
                                    return (<Card sx={{
                                        width: item,
                                        m: 3,
                                    }} elevation={6}>
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
                                    </Card>)
                                }) : this.getFiltedItems().length > 0 ? this.getFiltedItems().map((item, index) => {
                                    return (<Card sx={{
                                        width: "auto",
                                        m: 2,
                                        minWidth: "50%",
                                        height: "fit-content",
                                        background: item.visible === false ? "repeating-linear-gradient(-45deg, rgba(255, 255, 255, .125), rgba(255, 255, 255, .125) 30px, rgba(255, 0, 0, 0) 0, rgba(255, 255, 255, 0) 50px) !important" : ""
                                    }} elevation={6}
                                    >
                                        <CardHeader
                                            avatar={
                                                <Avatar
                                                    src={this.props.buy ? item.shopData.avatar : this.state.shop.avatar}
                                                    alt={this.props.buy ? item.shopData.shopName : this.state.shop.shopName}
                                                    sx={{
                                                        height: 40,
                                                        width: 40
                                                    }}
                                                />
                                            }
                                            action={
                                                <>
                                                    {this.props.buy && <IconButton size={"large"}
                                                                                   onClick={() => window.location.hash = `/shop/${item.shopId}?itemId=${item._id}`}>
                                                        <OpenInNew/>
                                                    </IconButton>}
                                                    {this.state.user?.favorited?.includes(item._id) ? <IconButton
                                                        onClick={async () => await this.onFavorite(true, item._id)}
                                                    >
                                                        <Favorite sx={{color: "red"}}/>
                                                    </IconButton> : <IconButton
                                                        onClick={async () => this.state.user?._id ? await this.onFavorite(false, item._id) : this.setState({needLoginSb: true})}
                                                    >
                                                        <Favorite/>
                                                    </IconButton>}
                                                    {this.state.copied === item._id ? <IconButton
                                                        onClick={() => {
                                                            this.setState({copied: item._id})
                                                            navigator.clipboard.writeText("https://" + window.location.host + `/#/shop/${item.shopId}?itemId=${item._id}`);
                                                            setTimeout(() => this.setState({copied: null}), 1000);
                                                        }}
                                                    >
                                                        <Check sx={{color: "lightgreen"}}/>
                                                    </IconButton> : <IconButton
                                                        onClick={() => {
                                                            this.setState({copied: item._id})
                                                            navigator.clipboard.writeText("https://" + window.location.host + (process.env.REACT_APP_HERF !== undefined ? process.env.REACT_APP_HERF : "") + `/#/shop/${item.shopId}?itemId=${item._id}`);
                                                            setTimeout(() => this.setState({copied: null}), 1000);
                                                        }}
                                                    >
                                                        <Share/>
                                                    </IconButton>}

                                                    <IconButton onClick={(e) => this.setState({menu: e.currentTarget})}>
                                                        <MoreVert/>
                                                    </IconButton>
                                                    <Menu open={this.state.menu} anchorEl={this.state.menu}
                                                          onClose={() => this.setState({menu: null})}>
                                                        <MenuItem
                                                            onClick={() => this.state.user?._id ? this.setState({
                                                                reportDl: true,
                                                                menu: null
                                                            }) : this.setState({needLoginSb: true, menu: null})}
                                                        >
                                                            <ListItemIcon>
                                                                <Warning/>
                                                            </ListItemIcon>
                                                            <ListItemText>
                                                                Report
                                                            </ListItemText>
                                                        </MenuItem>
                                                    </Menu>
                                                </>
                                            }
                                            title={<Stack direction={"row"}>
                                                <Typography variant={"h5"}>
                                                    {this.props.buy ? item.shopData.shopName : this.state.shop.shopName}
                                                </Typography>
                                                <Typography fontSize={"1.5rem"} color={"gold"}>
                                                    {this.props.showDistance && <>
                                                        &nbsp;- {item.distance > 1 ? item.distance.toFixed(2).toString() + "公里" : Math.round(item.distance * 1000).toString() + "米"}
                                                    </>}
                                                </Typography>
                                            </Stack>}
                                            subheader={<Typography
                                                sx={{fontSize: '1rem', width: "60%"}}>
                                                {this.props.buy ? item.shopData.short : this.state.shop.short}
                                            </Typography>}
                                        />

                                        {
                                            item.imageList?.length !== 0 &&
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    filter: "drop-shadow(2px 4px 6px black)",
                                                    transition: "filter 0.5s, transform 0.5s",
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                        filter: "drop-shadow(2px 4px 6px black) brightness(0.5)",
                                                        transform: "scale(1.125)",
                                                    }
                                                }}
                                                onClick={(e) => this.setState({showImages: item.imageList})}
                                            >
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
                                        <CardActionArea onClick={(e) => this.setState({selectedItem: item})}>
                                            <CardContent>
                                                <Stack direction={"row"}
                                                       justifyContent={"space-between"}>
                                                    <Stack>
                                                        <Typography fontSize={'1rem'}
                                                                    color={"darkgray"}>
                                                            {item.others ? item.selectedCategoryOther : item.selectedCategory.join("\n")}
                                                        </Typography>
                                                        <Typography variant={"h3"}>
                                                            {item.name}
                                                        </Typography>

                                                        <Stack direction={"row"} alignItems={"center"}>
                                                            <Rating
                                                                readOnly
                                                                value={[0, undefined].includes(item.rating?.length) ? 0 : item.rating.map(r => r.rate).reduce((a, c) => a + c) / item.rating.length}
                                                                precision={0.5}
                                                                icon={<Star/>}
                                                                emptyIcon={<Star style={{opacity: 0.55}}/>}
                                                            />
                                                            <Typography color={"gray"} pl={1}>
                                                                ({[0, undefined].includes(item.rating?.length) ? "暫無評價" : item.rating.length})
                                                            </Typography>
                                                        </Stack>
                                                        <Typography variant={"h6"} color={"lightgray"} maxWidth={"20em"}>
                                                            {item.desc}
                                                        </Typography>
                                                    </Stack>
                                                    <Box sx={{width: 60}}/>
                                                    <Stack justifyContent={"space-between"} sx={{
                                                        "*": {
                                                            textAlign: "right"
                                                        }
                                                    }}>
                                                        <Typography color={"lightgreen"}
                                                                    fontSize={"1.25rem"}>
                                                            <a style={{
                                                                fontSize: "2.5rem"
                                                            }}>${Math.ceil(Math.min(...item.price.map(i => i[0] / i[1])) * 10) / 10}</a><sub>/{item.unit}</sub>
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
                                }) : <Stack sx={{width: "90%", height: "50vh"}}
                                            alignItems={"center"}
                                            justifyContent={"center"}>
                                    <Typography variant={"h1"} color={"gray"}>沒有搜尋結果</Typography>
                                </Stack>}
                        </Box> // Card UI
                        :
                        <Box
                            sx={{
                                overflow: "auto",
                                width: "95%",
                            }}
                        >
                            <List sx={{
                                bgcolor: "rgba(255,255,255,0.1)",
                                borderRadius: "0 0 4px 4px",
                                boxShadow: "rgba(0,0,0,0.5) 0 5px 1em",
                                mb: "1em",
                                overflowX: "hidden"
                            }}>
                                {(this.props.buy ? this.props.noResults : this.state.noItem) ?
                                    <Stack sx={{width: "100%", height: "50vh"}}
                                           alignItems={"center"}
                                           justifyContent={"center"}>
                                        <Typography variant={"h1"}
                                                    color={"gray"}>暫無商品</Typography>
                                    </Stack> : (this.props.buy ? this.props.items : this.state.items).length === 0 ? [345, 551, 642, 352, 465, 522].map((item, index) => {
                                        return <>
                                            <ListItem sx={{
                                                transition: "background-color 0.5s",
                                                ":hover": {
                                                    bgcolor: "rgba(255,255,255,0.1)"
                                                }
                                            }}>
                                                <Stack direction={"row"} spacing={2}
                                                       alignItems={"center"}>
                                                    <Skeleton variant="circular" width={50}
                                                              height={50}/>
                                                    <Stack>
                                                        <Skeleton variant="rounded" height={20}
                                                                  width={120}/>
                                                        <Skeleton variant="text"
                                                                  sx={{fontSize: '1rem'}}
                                                                  width={100}/>
                                                    </Stack>
                                                </Stack>
                                                <Stack direction={"row"} spacing={4}
                                                       width={"100%"}
                                                       justifyContent={"center"}
                                                       alignItems={"center"}>
                                                    <Stack alignItems={"center"}>
                                                        <Skeleton variant="text"
                                                                  sx={{
                                                                      fontSize: '1rem',
                                                                      width: "60%"
                                                                  }}
                                                                  width={300}/>
                                                        <Skeleton variant="rounded" height={40}
                                                                  width={200}/>
                                                    </Stack>
                                                    <Skeleton variant="rounded" height={60}
                                                              width={80}/>
                                                    <Skeleton variant="rounded" height={60}
                                                              width={120}/>
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
                                            {index + 1 !== (this.props.buy ? this.props.items : this.state.items).length &&
                                                <Divider/>}
                                        </>
                                    }) : this.getFiltedItems().length > 0 ? this.getFiltedItems().map((item, index) => {
                                        return <>
                                            <Stack
                                                direction={"row"}
                                                width={"calc(100% - 4em)"}
                                                px={"2em"}
                                                alignItems={"center"}
                                                sx={{
                                                    background: item.visible === false ? "repeating-linear-gradient(-45deg, rgba(255, 255, 255, .125), rgba(255, 255, 255, .125) 30px, rgba(255, 0, 0, 0) 0, rgba(255, 255, 255, 0) 50px) !important" : ""
                                                }}
                                            >
                                                <Stack width={"20%"} direction={"row"}
                                                       spacing={2}
                                                       alignItems={"center"}
                                                >
                                                    <Avatar
                                                        src={this.props.buy ? item.shopData.avatar : this.state.shop.avatar}
                                                        alt={this.props.buy ? item.shopData.shopName : this.state.shop.shopName}
                                                        sx={{
                                                            height: 50,
                                                            width: 50
                                                        }}
                                                    />
                                                    <Stack>
                                                        <Typography variant={"h5"}>
                                                            {this.props.buy ? item.shopData.shopName : this.state.shop.shopName}
                                                        </Typography>
                                                        <Stack direction={"row"}>
                                                            <Typography sx={{
                                                                fontSize: '1rem',
                                                            }}>
                                                                {this.props.buy ? item.shopData.short : this.state.shop.short}
                                                            </Typography>
                                                            <Typography fontSize={"1rem"} color={"gold"}>
                                                                {this.props.showDistance && <>
                                                                    &nbsp;- {item.distance > 1 ? item.distance.toFixed(2).toString() + "公里" : Math.round(item.distance * 1000).toString() + "米"}
                                                                </>}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>

                                                </Stack>
                                                <MenuItem sx={{
                                                    width: "65%"
                                                }} onClick={(e) => this.setState({selectedItem: item})}>
                                                    <Stack direction={"row"} spacing={4}
                                                           width={"60%"}
                                                           justifyContent={"center"}
                                                           alignItems={"center"}>
                                                        <Stack alignItems={"center"}>
                                                            <Typography fontSize={'1rem'}
                                                                        color={"darkgray"}>
                                                                {item.others ? item.selectedCategoryOther : item.selectedCategory.join("\n")}
                                                            </Typography>
                                                            <Typography variant={"h3"}>
                                                                {item.name}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                    <Typography width={"20%"} color={"lightgreen"}
                                                                fontSize={"1.25rem"}
                                                                textAlign={"center"}>
                                                        <a style={{
                                                            fontSize: "2.5rem"
                                                        }}>${Math.ceil(Math.min(...item.price.map(i => i[0] / i[1])) * 10) / 10}</a><sub>/{item.unit}</sub>
                                                    </Typography>
                                                    {item.record.length < 1 ?
                                                        <Typography variant={"h5"} color={"red"}
                                                                    width={"20%"}
                                                                    textAlign={"center"}>
                                                            無庫存
                                                        </Typography> : <Tooltip
                                                            width={"20%"}
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
                                                </MenuItem>

                                                <Stack width={"15%"} direction={"row"}
                                                       height={"fit-content"}
                                                       spacing={0} justifyContent={"flex-end"}>
                                                    {this.props.buy && <IconButton size={"large"}
                                                                                   onClick={() => window.location.hash = `/shop/${item.shopId}?itemId=${item._id}`}>
                                                        <OpenInNew/>
                                                    </IconButton>}
                                                    {this.state.user?.favorited?.includes(item._id) ? <IconButton
                                                        onClick={async () => await this.onFavorite(true, item._id)}
                                                    >
                                                        <Favorite sx={{color: "red"}}/>
                                                    </IconButton> : <IconButton
                                                        onClick={async () => this.state.user?._id ? await this.onFavorite(false, item._id) : this.setState({needLoginSb: true})}
                                                    >
                                                        <Favorite/>
                                                    </IconButton>}
                                                    {this.state.copied === item._id ? <IconButton
                                                        onClick={() => {
                                                            this.setState({copied: item._id})
                                                            navigator.clipboard.writeText("https://" + window.location.host + `/#/shop/${item.shopId}?itemId=${item._id}`);
                                                            setTimeout(() => this.setState({copied: null}), 1000);
                                                        }}
                                                    >
                                                        <Check sx={{color: "lightgreen"}}/>
                                                    </IconButton> : <IconButton
                                                        onClick={() => {
                                                            this.setState({copied: item._id})
                                                            navigator.clipboard.writeText("https://" + window.location.host + (process.env.REACT_APP_HERF !== undefined ? process.env.REACT_APP_HERF : "") + `/#/shop/${item.shopId}?itemId=${item._id}`);
                                                            setTimeout(() => this.setState({copied: null}), 1000);
                                                        }}
                                                    >
                                                        <Share/>
                                                    </IconButton>}

                                                    <IconButton onClick={(e) => this.setState({menu: e.currentTarget})}>
                                                        <MoreVert/>
                                                    </IconButton>
                                                    <Menu open={this.state.menu} anchorEl={this.state.menu}
                                                          onClose={() => this.setState({menu: null})}>
                                                        <MenuItem
                                                            onClick={() => this.state.user?._id ? this.setState({
                                                                reportDl: true,
                                                                menu: null
                                                            }) : this.setState({needLoginSb: true, menu: null})}
                                                        >
                                                            <ListItemIcon>
                                                                <Warning/>
                                                            </ListItemIcon>
                                                            <ListItemText>
                                                                Report
                                                            </ListItemText>
                                                        </MenuItem>
                                                    </Menu>
                                                </Stack>

                                            </Stack>
                                            {
                                                index + 1 !== (this.props.buy ? this.props.items : this.state.items).length &&
                                                <Divider/>
                                            }
                                        </>
                                    }) : <Stack sx={{width: "100%", height: "50vh"}}
                                                alignItems={"center"}
                                                justifyContent={"center"}>
                                        <Typography variant={"h1"}
                                                    color={"gray"}>沒有搜尋結果</Typography>
                                    </Stack>}
                            </List>
                        </Box>
                }

            </Stack>

            <AddItemDl
                addDl={this.state.addDl}
                closeDl={() => this.setState({addDl: false})}
                category={this.state.category}
                loadItem={this.loadItem}
                edit={false}
            />
            <Dialog
                open={this.state.selectedItem !== null}
                onClose={(e) => this.setState({selectedItem: null})}
                maxWidth={"md"}
                fullWidth
                scroll={"body"}
            >
                {this.state.selectedItem?._id &&
                    <Item
                        item={this.state.selectedItem}
                        favorited={this.state.user.favorited}
                        onFavorite={this.onFavorite}
                        loadItem={this.loadItem}
                        category={this.state.category}
                        close={() => this.setState({selectedItem: null})}
                        owner={this.props.owner}
                        user={this.state.user}
                    />
                }
            </Dialog>
        </>
    }
}