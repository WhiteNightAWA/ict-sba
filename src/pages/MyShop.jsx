import React, {Component} from "react";
import {
    Alert, Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Container,
    Dialog, DialogActions, DialogTitle, IconButton, InputAdornment, OutlinedInput, Paper, Skeleton,
    Snackbar, Stack, Tab, Tabs, TextField, Tooltip, DialogContent, Typography, ImageList, ImageListItem,
    Divider, List, ListItem, ListItemButton, ListItemText, Checkbox, Autocomplete, Chip, Accordion,
    AccordionSummary, AccordionDetails, Collapse, MenuItem, CardActionArea, ToggleButton, ToggleButtonGroup,
    FormControl, InputLabel, Select, Menu, Switch, RadioGroup, Radio, FormControlLabel, FormLabel
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
import {motion} from 'framer-motion';
import ImageUploader from 'react-images-upload';


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

            // filter
            search: "",
            searchLs: false,
            searchedSelect: [],
            Els: [],
            display: "card",
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
        };
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

        const res = await Requires.post("/users/update", this.state.shop);

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
    select = (item) => {
        let i = this.state.categorySelect.join(" > ") + " > " + item;
        if (this.state.selectedCategory.includes(i)) {
            this.state.selectedCategory = this.state.selectedCategory.filter(it => it !== i)
        } else {
            this.state.selectedCategory.push(i)
        }
        this.setState({
            selectedCategory: this.state.selectedCategory
        })
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
    addItem = async () => {
        this.setState({loading: true})
        let res = await Requires.post("/users/addItem", {
            imageList: this.state.imageList,
            selectedCategory: this.state.selectedCategory,
            others: this.state.others,
            selectedCategoryOther: this.state.selectedCategoryOther,
            name: this.state.name,
            unit: this.state.unit,
            desc: this.state.desc,
            barCode: this.state.barCode,
            price: this.state.price,
        });

        if (res.status === 200) {
            this.setState({
                loading: false,
                sb: true, sbS: "success", sbMsg: "Add Item Successfully.",

                // item
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
            });
            await this.loadItem();
        } else {
            this.setState({
                loading: false,
                sb: true, sbS: "error", sbMsg: res.data.error_description
            });
        }
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
                    setTimeout(async () => await this.loadItem(), 100);
                } else {
                    window.location.href = "/#/";
                }

            }
        } else {
            window.location.href = "/#/login";
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

                                                <Rating name="read-only" value={this.state.shop.rating}
                                                        readOnly/>
                                                <Typography color={"darkgrey"}>
                                                    ({this.state.shop.rating?.length})
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
                                    <Button color={"error"} variant={"text"} onClick={(e) => this.setState({ shop: this.state.savedShop,
                                        editing: false })}
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
                            <Stack alignItems={"center"}>
                                <Button
                                    fullWidth
                                    variant={"outlined"}
                                    color={"success"}
                                    onClick={(e) => this.setState({addDl: true})}
                                >新增商品</Button>

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
                                            }) : this.getFiltedItems().length > 0 ? this.getFiltedItems().map((item, index) => {
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
                                            }) : <Stack sx={{ width: "90%", height: "50vh" }} alignItems={"center"} justifyContent={"center"}>
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
                                                }) : this.getFiltedItems().length > 0 ? this.getFiltedItems().map((item, index) => {
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
                        <TabPanel value={"test"}>
                            test
                        </TabPanel>

                    </TabContext>
                </Stack>
                <Dialog open={this.state.addDl} maxWidth={"lg"} fullWidth>
                    <DialogTitle> Add Item </DialogTitle>
                    <DialogContent>
                        <Paper sx={{
                            p: 5,
                            m: 2,
                        }}>
                            <Stack spacing={2}>
                                <Divider> 圖片 </Divider>
                                <Stack direction={"row"}>
                                    <UploadDropzone
                                        uploader={uploader}
                                        options={{
                                            multi: true,
                                        }}
                                        onUpdate={files => this.setState({imageList: files.map((f) => f.fileUrl)})}
                                        width={"50%"}
                                        height={"20em"}

                                    />

                                    {this.state.imageList.length === 0 ?
                                        <Stack width={"50%"} alignItems={"center"} justifyContent={"center"}>
                                            <Typography variant={"h6"} color={"darkgray"}>
                                                No Image
                                            </Typography>
                                        </Stack> : <ImageList sx={{
                                            width: "50%",
                                            height: "18em"
                                        }}>
                                            {this.state.imageList.map((item) => (
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

                                <Divider> 基本信息 </Divider>
                                <Collapse in={this.state.others}>
                                    <Alert variant={"filled"} timeout={1000} severity={"error"}>
                                        這可能會影響該產品的流量
                                    </Alert>
                                </Collapse>
                                <Stack>
                                    {this.state.others ? <Stack direction={"row"}><TextField
                                        fullWidth
                                        value={this.state.selectedCategoryOther}
                                        onChange={(e) => this.setState({selectedCategoryOther: e.target.value})}
                                        variant={"filled"}
                                        label={"銷售商品類別"}
                                        sx={{
                                            borderTopRightRadius: "0 !important",
                                        }}
                                    /><Button
                                        sx={{
                                            width: "3em",
                                            borderTopLeftRadius: "0 !important",
                                            borderBottomLeftRadius: "0 !important",
                                        }}
                                        onClick={() => this.setState({others: false})}
                                        variant={"contained"}
                                        disabled={this.state.loading}
                                    >
                                        返回
                                    </Button></Stack> : <Stack>
                                        <Stack direction={"row"}>
                                            <Autocomplete
                                                disabled={this.state.loading}
                                                fullWidth
                                                multiple
                                                value={this.state.selectedCategory}
                                                options={flattenObject(this.state.category)}
                                                onChange={(e, v) => this.setState({selectedCategory: v})}
                                                getOptionLabel={(option) => option}
                                                renderTags={(value, getTagProps) => {
                                                    return value.map((option, index) => (
                                                        <Tooltip
                                                            title={<Typography fontSize={"1.5em"}>{option}</Typography>}
                                                            sx={{
                                                                fontSize: "2em"
                                                            }}>
                                                            <Chip
                                                                key={option}
                                                                label={option.split(" > ").pop()}
                                                                sx={{
                                                                    fontSize: "1.2em"
                                                                }}
                                                                {...getTagProps({index})}
                                                            />
                                                        </Tooltip>
                                                    ))
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        disabled={this.state.loading}
                                                        label={"銷售商品類別"}
                                                        variant={"filled"}
                                                        sx={{
                                                            borderTopRightRadius: "0 !important",
                                                        }}
                                                    />
                                                )}
                                            />
                                            <Button
                                                sx={{
                                                    width: "3em",
                                                    borderTopLeftRadius: "0 !important",
                                                    borderBottomLeftRadius: "0 !important",
                                                    borderBottomRightRadius: "0 !important",
                                                }}
                                                variant={"outlined"}
                                                onClick={() => this.setState({others: true})}
                                                disabled={this.state.loading}
                                            >
                                                其他
                                            </Button>
                                        </Stack>
                                    </Stack>
                                    }
                                    <Collapse in={!this.state.others} timeout={1000}>
                                        <Accordion sx={{
                                            bgcolor: "rgba(255,255,255,0.1)",
                                            "marginTop": "0 !important",
                                            borderTopLeftRadius: "0 !important",
                                            borderTopRightRadius: "0 !important",
                                        }} defaultExpanded>
                                            <AccordionSummary
                                                expandIcon={<ExpandMore/>}
                                            >
                                                列表
                                            </AccordionSummary>
                                            <Divider/>
                                            <AccordionDetails>

                                                <Paper sx={{
                                                    width: "100%",
                                                    maxHeight: "30em",
                                                    bgcolor: "rgba(0,0,0,0.5)"
                                                }}>
                                                    <Stack direction={"row"}>
                                                        <List sx={{
                                                            width: "17%"
                                                        }}>
                                                            {Object.keys(this.state.category).map((item, key) => {
                                                                return !isNaN(Number(item)) ?
                                                                    <ListItemButton key={key}
                                                                                    onClick={(e) => this.select(item)}>
                                                                        <Checkbox
                                                                            size={"small"}
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            disableRipple
                                                                            checked={this.state.selectedCategory.includes(this.state.categorySelect.join(" > ") + " > " + item)}
                                                                        />
                                                                        {item}
                                                                    </ListItemButton> :
                                                                    <ListItemButton key={key} onClick={(e) => {
                                                                        this.setState({categorySelect: [item]});
                                                                    }} sx={this.state.categorySelect[0] === item ? {
                                                                        bgcolor: "rgba(255,255,255,0.2)"
                                                                    } : {}}>
                                                                        <ListItemText>
                                                                            {item}
                                                                        </ListItemText>
                                                                        <KeyboardArrowRight/>
                                                                    </ListItemButton>
                                                            })}
                                                        </List>
                                                        <Divider orientation="vertical" flexItem/>
                                                        {this.state.categorySelect[0] !== undefined &&
                                                            <List
                                                                sx={isNaN(Object.keys(this.state.category[this.state.categorySelect[0]])[0]) ? {
                                                                    width: "17%",
                                                                    overflowY: "scroll",
                                                                    maxHeight: "29em",
                                                                } : {
                                                                    width: `${17 * 5}%`,
                                                                    overflowY: "scroll",
                                                                    maxHeight: "29em",
                                                                }}
                                                                dense={!isNaN(Object.keys(this.state.category[this.state.categorySelect[0]])[0])}>
                                                                {Object.keys(this.state.category[this.state.categorySelect[0]]).map((item, key) => {
                                                                    return !isNaN(Number(item)) ?
                                                                        <ListItemButton key={key}
                                                                                        onClick={(e) => this.select(this.state.category[this.state.categorySelect[0]][item])}>
                                                                            <Checkbox
                                                                                size={"small"}
                                                                                edge="start"
                                                                                tabIndex={-1}
                                                                                disableRipple
                                                                                checked={this.state.selectedCategory.includes(this.state.categorySelect.join(" > ") + " > " + this.state.category[this.state.categorySelect[0]][item])}
                                                                            />
                                                                            {this.state.category[this.state.categorySelect[0]][item]}
                                                                        </ListItemButton> :
                                                                        <ListItemButton key={key} onClick={(e) => {
                                                                            this.setState({categorySelect: [this.state.categorySelect[0], item]});
                                                                        }} sx={this.state.categorySelect[1] === item ? {
                                                                            bgcolor: "rgba(255,255,255,0.2)"
                                                                        } : {}}>
                                                                            <ListItemText>
                                                                                {item}
                                                                            </ListItemText>
                                                                            <KeyboardArrowRight/>
                                                                        </ListItemButton>
                                                                })}
                                                            </List>
                                                        }
                                                        <Divider orientation="vertical" flexItem/>
                                                        {this.state.categorySelect[1] !== undefined &&
                                                            <List
                                                                sx={isNaN(Object.keys(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]])[0]) ? {
                                                                    width: "17%",
                                                                    overflowY: "scroll",
                                                                    maxHeight: "29em",
                                                                } : {
                                                                    width: `${17 * 4}%`,
                                                                    overflowY: "scroll",
                                                                    maxHeight: "29em",
                                                                }}
                                                                dense={!isNaN(Object.keys(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]])[0])}>
                                                                {Object.keys(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]]).map((item, key) => {
                                                                    return !isNaN(Number(item)) ?
                                                                        <ListItemButton key={key}
                                                                                        onClick={(e) => this.select(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][item])}>
                                                                            <Checkbox
                                                                                size={"small"}
                                                                                edge="start"
                                                                                tabIndex={-1}
                                                                                disableRipple
                                                                                checked={this.state.selectedCategory.includes(this.state.categorySelect.join(" > ") + " > " + this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][item])}
                                                                            />
                                                                            {this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][item]}
                                                                        </ListItemButton> :
                                                                        <ListItemButton key={key} onClick={(e) => {
                                                                            this.setState({categorySelect: [this.state.categorySelect[0], this.state.categorySelect[1], item]});
                                                                        }} sx={this.state.categorySelect[2] === item ? {
                                                                            bgcolor: "rgba(255,255,255,0.2)"
                                                                        } : {}}>
                                                                            <ListItemText>
                                                                                {item}
                                                                            </ListItemText>
                                                                            <KeyboardArrowRight/>
                                                                        </ListItemButton>
                                                                })}
                                                            </List>
                                                        }
                                                        <Divider orientation="vertical" flexItem/>
                                                        {this.state.categorySelect[2] !== undefined &&
                                                            <List
                                                                sx={isNaN(Object.keys(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]])[0]) ? {
                                                                    width: "17%",
                                                                    overflowY: "scroll",
                                                                    maxHeight: "29em",
                                                                } : {
                                                                    width: `${17 * 3}%`,
                                                                    overflowY: "scroll",
                                                                    maxHeight: "29em",
                                                                }}
                                                                dense={!isNaN(Object.keys(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]])[0])}>
                                                                {Object.keys(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]]).map((item, key) => {
                                                                    return !isNaN(Number(item)) ?
                                                                        <ListItemButton key={key}
                                                                                        onClick={(e) => this.select(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][item])}>
                                                                            <Checkbox
                                                                                size={"small"}
                                                                                edge="start"
                                                                                tabIndex={-1}
                                                                                disableRipple
                                                                                checked={this.state.selectedCategory.includes(this.state.categorySelect.join(" > ") + " > " + this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][item])}
                                                                            />
                                                                            {this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][item]}
                                                                        </ListItemButton> :
                                                                        <ListItemButton key={key} onClick={(e) => {
                                                                            this.setState({categorySelect: [this.state.categorySelect[0], this.state.categorySelect[1], this.state.categorySelect[2], item]});
                                                                        }} sx={this.state.categorySelect[3] === item ? {
                                                                            bgcolor: "rgba(255,255,255,0.2)"
                                                                        } : {}}>
                                                                            <ListItemText>
                                                                                {item}
                                                                            </ListItemText>
                                                                            <KeyboardArrowRight/>
                                                                        </ListItemButton>
                                                                })}
                                                            </List>
                                                        }
                                                        <Divider orientation="vertical" flexItem/>
                                                        {this.state.categorySelect[3] !== undefined &&
                                                            <List
                                                                sx={isNaN(Object.keys(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]])[0]) ? {
                                                                    width: "17%",
                                                                    overflowY: "scroll",
                                                                    maxHeight: "29em",
                                                                } : {
                                                                    width: `${17 * 2}%`,
                                                                    overflowY: "scroll",
                                                                    maxHeight: "29em",
                                                                }}
                                                                dense={!isNaN(Object.keys(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]])[0])}>
                                                                {Object.keys(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]]).map((item, key) => {
                                                                    return !isNaN(Number(item)) ?
                                                                        <ListItemButton key={key}
                                                                                        onClick={(e) => this.select(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][item])}>
                                                                            <Checkbox
                                                                                size={"small"}
                                                                                edge="start"
                                                                                tabIndex={-1}
                                                                                disableRipple
                                                                                checked={this.state.selectedCategory.includes(this.state.categorySelect.join(" > ") + " > " + this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][item])}
                                                                            />
                                                                            {this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][item]}
                                                                        </ListItemButton> :
                                                                        <ListItemButton key={key} onClick={(e) => {
                                                                            this.setState({categorySelect: [this.state.categorySelect[0], this.state.categorySelect[1], this.state.categorySelect[2], this.state.categorySelect[3], item]});
                                                                        }} sx={this.state.categorySelect[4] === item ? {
                                                                            bgcolor: "rgba(255,255,255,0.2)"
                                                                        } : {}}>
                                                                            <ListItemText>
                                                                                {item}
                                                                            </ListItemText>
                                                                            <KeyboardArrowRight/>
                                                                        </ListItemButton>
                                                                })}
                                                            </List>
                                                        }

                                                        <Divider orientation="vertical" flexItem/>
                                                        {this.state.categorySelect[4] !== undefined &&
                                                            <List
                                                                sx={isNaN(Object.keys(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][this.state.categorySelect[4]])[0]) ? {
                                                                    width: "17%",
                                                                    overflowY: "scroll",
                                                                    maxHeight: "29em",
                                                                } : {
                                                                    width: `${17}%`,
                                                                    overflowY: "scroll",
                                                                    maxHeight: "29em",
                                                                }}
                                                                dense={!isNaN(Object.keys(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][this.state.categorySelect[4]])[0])}>
                                                                {Object.keys(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][this.state.categorySelect[4]]).map((item, key) => {
                                                                    return !isNaN(Number(item)) ?
                                                                        <ListItemButton key={key}
                                                                                        onClick={(e) => this.select(this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][this.state.categorySelect[4]][item])}>
                                                                            <Checkbox
                                                                                size={"small"}
                                                                                edge="start"
                                                                                tabIndex={-1}
                                                                                disableRipple
                                                                                checked={this.state.selectedCategory.includes(this.state.categorySelect.join(" > ") + " > " + this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][this.state.categorySelect[4]][item])}
                                                                            />
                                                                            {this.state.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][this.state.categorySelect[4]][item]}
                                                                        </ListItemButton> :
                                                                        <ListItemButton key={key} onClick={(e) => {
                                                                            this.setState({categorySelect: [this.state.categorySelect[0], this.state.categorySelect[1], this.state.categorySelect[2], this.state.categorySelect[3], this.state.categorySelect[4], item]});
                                                                        }} sx={this.state.categorySelect[5] === item ? {
                                                                            bgcolor: "rgba(255,255,255,0.2)"
                                                                        } : {}}>
                                                                            <ListItemText>
                                                                                {item}
                                                                            </ListItemText>
                                                                            <KeyboardArrowRight/>
                                                                        </ListItemButton>
                                                                })}
                                                            </List>
                                                        }
                                                    </Stack>
                                                </Paper>

                                            </AccordionDetails>
                                        </Accordion>
                                    </Collapse>
                                </Stack>
                                <Stack direction={"row"}>
                                    <TextField
                                        label={"產品名稱"}
                                        disabled={this.state.loading}
                                        variant={"standard"}
                                        value={this.state.name}
                                        fullWidth
                                        sx={{mr: 3, width: "70%"}}
                                        onChange={(e) => this.setState({name: e.target.value})}
                                    />
                                    <TextField
                                        label={"產品單位"}
                                        disabled={this.state.loading}
                                        variant={"standard"}
                                        value={this.state.unit}
                                        placeholder={"e.g. 斤、KG、條、隻..."}
                                        onChange={(e) => this.setState({unit: e.target.value})}
                                    />
                                </Stack>
                                <TextField
                                    label={"產品描述"}
                                    disabled={this.state.loading}
                                    variant={"outlined"}
                                    value={this.state.desc}
                                    multiline
                                    minRows={3}
                                    onChange={(e) => this.setState({desc: e.target.value})}
                                />
                                <Divider> 入貨設定 </Divider>
                                <FormControl>
                                    <Typography variant={"h5"}>是否使用條形碼？</Typography>
                                    <RadioGroup
                                        value={this.state.barCode}
                                        onChange={(e, v) => this.setState({barCode: v})}
                                    >
                                        <FormControlLabel value={true} control={<Radio/>}
                                                          label="使用條形碼 「以後此商品可通過掃描條碼入貨/出貨，請確保上面的單位是根據條形碼打印的位置(e.g. 包/盒...)」"/>
                                        <FormControlLabel value={false} control={<Radio/>}
                                                          label="使用數量 「以後這個產品需要人工選擇類別及輸入數量入貨/出貨(有簡易的界面)」"/>
                                    </RadioGroup>
                                </FormControl>
                                <Divider> 價格設定 </Divider>
                                <List>
                                    {
                                        this.state.price.map((item, index) => {
                                            return <ListItem>
                                                <Stack width={"100%"} direction={"row"}>
                                                    <TextField
                                                        value={item[0]}
                                                        disabled={this.state.loading}
                                                        type={"number"}
                                                        fullWidth
                                                        variant={"standard"}
                                                        error={item[0] < 1}
                                                        onChange={(e) => {
                                                            let newPrice = this.state.price
                                                            newPrice[index] = [Number(e.target.value), item[1]]
                                                            this.setState({
                                                                price: newPrice
                                                            })
                                                        }}
                                                        InputProps={{
                                                            startAdornment: <InputAdornment
                                                                position="start">HKD$</InputAdornment>,
                                                        }}
                                                    />
                                                    <ArrowRight/>
                                                    <TextField
                                                        value={item[1]}
                                                        fullWidth
                                                        disabled={this.state.loading}
                                                        type={"number"}
                                                        error={item[1] < 1}
                                                        variant={"standard"}
                                                        onChange={(e) => {
                                                            let newPrice = this.state.price
                                                            newPrice[index] = [item[0], Number(e.target.value)]
                                                            this.setState({
                                                                price: newPrice
                                                            })
                                                        }}
                                                        InputProps={{
                                                            endAdornment: <InputAdornment
                                                                position="end">{this.state.unit}</InputAdornment>,
                                                        }}
                                                    />
                                                    <IconButton
                                                        color={"error"}
                                                        disabled={this.state.price.length < 2 || this.state.loading}
                                                        onClick={(e) => this.setState({
                                                            price: this.state.price.filter(i => i !== item)
                                                        })}
                                                    >
                                                        <Clear/>
                                                    </IconButton>
                                                </Stack>
                                            </ListItem>
                                        })
                                    }
                                    <Button
                                        variant={"outlined"}
                                        disabled={this.state.loading}
                                        fullWidth
                                        onClick={(e) => this.setState({
                                            price: [...this.state.price, [null, null]],
                                        })}
                                    >
                                        添加價格
                                    </Button>
                                </List>
                            </Stack>

                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color={"error"}
                            variant={"text"}
                            onClick={(e) => this.setState({addDl: false})}
                            disabled={this.state.loading}
                        >
                            Cancel
                        </Button>
                        <LoadingButton
                            variant={"contained"}
                            color={"success"}
                            disabled={(
                                [this.state.name, this.state.unit, this.state.desc, this.state.barCode].includes("") ||
                                !(
                                    (this.state.others && this.state.selectedCategoryOther) ||
                                    (!this.state.others && this.state.selectedCategory.length > 0)
                                ) ||
                                this.state.price.filter(e =>
                                    e.includes(null) ||
                                    e.includes("") ||
                                    e[0] < 1 || e[1] < 1
                                ).length > 0
                            )}
                            loading={this.state.loading}
                            onClick={this.addItem}
                        >
                            Add
                        </LoadingButton>
                    </DialogActions>
                </Dialog>
            </Box>
        )
    }
}