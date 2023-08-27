import React, {Component} from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CardMedia,
    Container,
    Dialog,
    DialogActions,
    DialogTitle,
    IconButton,
    InputAdornment,
    OutlinedInput,
    Paper,
    Skeleton,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    DialogContent,
    Typography,
    ImageList,
    ImageListItem,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Checkbox,
    Autocomplete,
    Chip, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import Requires from "../util/requires";
import {autoPlay} from 'react-swipeable-views-utils';
import SwipeableViews from 'react-swipeable-views';
import Pagination from "../components/Pagination";
import {LoadingButton, Rating, TabContext, TabPanel} from "@mui/lab";
import {
    Clear,
    Favorite,
    KeyboardArrowRight,
    LocalPhone,
    LocationOn,
    MoreVert,
    OpenInNew,
    Share
} from "@mui/icons-material";
import {Uploader} from "uploader";
import {UploadDropzone} from "react-uploader";

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
const uploader = Uploader({
    apiKey: "free" // Get production API keys from Bytescale
});

function flattenObject(obj, prefix = "") {
    let result = [];
    for (let key in obj) {
        let value = obj[key];
        if (typeof value === "object" && !Array.isArray(value)) {
            result = result.concat(flattenObject(value, prefix + key + " > "));
        } else if (Array.isArray(value)) {
            for (let item of value) {
                result.push(prefix + key + " > " + item);
            }
        } else {
            result.push(prefix + key + " > " + value);
        }
    }
    return result;
}

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
            addDl: true,
            imageList: [],
            category: {},
            categorySelect: [],
            selectedCategory: [],

            // sb
            sb: false,
            sbS: "",
            sbMsg: "",
        };
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
                    })
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
                sb: true, sbS: "success", sbMsg: "Update Successfully."
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
                          onClose={() => this.setState({sb: false})}>
                    <Alert onClose={() => this.setState({sb: false})}
                           severity={this.state.sbS}
                           sx={{width: '100%'}}>
                        {this.state.sbMsg}
                    </Alert>
                </Snackbar>
                <Stack alignItems={"center"}>
                    <Card sx={{
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
                                                    sx={{height: 200}}
                                                    image={url}
                                                    title={url}
                                                />)
                                        })
                                    }
                                </AutoPlaySwipeableViews>
                                <Pagination dots={this.state.shop.shopPhotos?.length}
                                            index={this.state.imgIndex}
                                            onChangeIndex={(i) => this.setState({imgIndex: i})}/>
                                {this.state.editing && <Box sx={{p: 1}}>
                                    {
                                        this.state.shop.shopPhotos?.map((img, index) => {
                                            return (<><TextField
                                                variant={"standard"}
                                                value={img}
                                                key={index}
                                                sx={{width: "93%"}}
                                                onChange={(e) => {
                                                    let photos = this.state.shop.shopPhotos;
                                                    photos[index] = e.target.value;
                                                    this.setState({
                                                        shop: {
                                                            ...this.state.shop,
                                                            shopPhotos: photos,
                                                        }
                                                    });
                                                }}
                                            /><IconButton color={"error"} onClick={() => {
                                                let photos = this.state.shop.shopPhotos;
                                                if (index > -1) {
                                                    photos.splice(index, 1);
                                                }
                                                this.setState({
                                                    shop: {
                                                        ...this.state.shop,
                                                        shopPhotos: photos,
                                                    }
                                                });
                                            }}>
                                                <Clear/>
                                            </IconButton></>)
                                        })
                                    }
                                    <Button fullWidth color={"success"} variant={"outlined"} onClick={() => {
                                        let photos = this.state.shop.shopPhotos;
                                        photos.push("");
                                        this.setState({
                                            shop: {
                                                ...this.state.shop,
                                                shopPhotos: photos,
                                            }
                                        });
                                    }}>Add Image</Button>
                                </Box>}
                            </Box>
                        }
                        <CardContent sx={{
                            display: "flex",
                            justifyContent: "center"
                        }}>
                            <Stack alignItems={"center"} spacing={3} width={"80%"}>
                                <Stack direction={"row"} alignItems={"center"} spacing={5} width={"100%"}>
                                    {this.state.editing ? <Box sx={{
                                        position: "relative"
                                    }}>
                                        <TextField
                                            label="Avatar Image Url"
                                            sx={{
                                                top: "40%",
                                                position: "absolute",
                                                zIndex: "50",
                                                backdropFilter: "blur(1em)",
                                                borderRadius: "5px",
                                            }}
                                            size={"small"}
                                            value={this.state.shop.avatar}
                                            onChange={(e) => this.setState({
                                                shop: {
                                                    ...this.state.shop,
                                                    avatar: e.target.value,
                                                }
                                            })}
                                        />
                                        <Avatar
                                            src={this.state.shop.avatar}
                                            alt={this.state.shop.shopName}
                                            sx={{
                                                height: "8em",
                                                width: "8em"
                                            }}
                                        />
                                    </Box> : <Avatar
                                        src={this.state.shop.avatar}
                                        alt={this.state.shop.shopName}
                                        sx={{
                                            height: "8em",
                                            width: "8em"
                                        }}
                                    />}
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
                                    <Button color={"error"} variant={"text"} onClick={(e) => window.location.reload()}
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
                            <Tab label="item" value={"item"}/>
                            <Tab label="Rating" value={"test"}/>
                        </Tabs>
                        <TabPanel value={"item"} sx={{width: "100%"}}>

                            <Button
                                fullWidth
                                variant={"outlined"}
                                color={"success"}
                            >Add Item</Button>
                            <Container sx={{
                                mt: 5,
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "space-around",
                                height: "68vh",
                                overflow: "auto",
                                width: "100%",
                            }} className={"scrollBar"}>
                                {this.state.shop.items?.map((w, index) => {
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
                </Stack>
                <Dialog open={this.state.addDl} maxWidth={"md"} fullWidth>
                    <DialogTitle> Add Item </DialogTitle>
                    <DialogContent>
                        <Paper sx={{
                            p: 5,
                            m: 2,
                        }}>
                            <Stack spacing={2}>
                                <Divider> Image </Divider>
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
                                <Divider> Basic Info </Divider>

                                <Autocomplete
                                    fullWidth
                                    multiple
                                    value={this.state.selectedCategory}
                                    options={flattenObject(this.state.category)}
                                    onChange={(e, v) => this.setState({selectedCategory: v})}
                                    getOptionLabel={(option) => option}
                                    renderTags={(value, getTagProps) => {
                                        return value.map((option, index) => (
                                            <Tooltip title={<Typography fontSize={"1.5em"}>{option}</Typography>} sx={{
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
                                            label={"Search"}
                                            variant={"filled"}
                                        />
                                    )}
                                />
                                <Accordion>
                                    <AccordionSummary>
                                        Table
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
                                                    width: "19.85%"
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
                                                            width: "19.85%",
                                                            overflowY: "scroll",
                                                            maxHeight: "29em",
                                                        } : {
                                                            width: `${19.85 * 4}%`,
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
                                                            width: "19.85%",
                                                            overflowY: "scroll",
                                                            maxHeight: "29em",
                                                        } : {
                                                            width: `${19.85 * 3}%`,
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
                                                            width: "19.85%",
                                                            overflowY: "scroll",
                                                            maxHeight: "29em",
                                                        } : {
                                                            width: `${19.85 * 2}%`,
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
                                                            width: "19.85%",
                                                            overflowY: "scroll",
                                                            maxHeight: "29em",
                                                        } : {
                                                            width: `${19.85}%`,
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
                                                                    this.setState({categorySelect: [this.state.categorySelect[0], this.state.categorySelect[1], this.state.categorySelect[2], [this.state.categorySelect[3]], item]});
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
                                            </Stack>
                                        </Paper>

                                    </AccordionDetails>
                                </Accordion>
                            </Stack>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button variant={"text"}>
                            Cancel
                        </Button>
                        <Button variant={"contained"} color={"success"}>
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        )
    }
}