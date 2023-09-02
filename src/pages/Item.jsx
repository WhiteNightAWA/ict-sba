import React, {Component} from "react";
import {
    Accordion, AccordionDetails, AccordionSummary, Alert, Avatar,
    Box,
    Button,
    Card, CardActionArea,
    CardHeader,
    CardMedia, Dialog, DialogActions,
    DialogContent,
    DialogTitle, Divider, ImageList, ImageListItem, List, ListItem, Menu, MenuItem, Snackbar,
    Stack, TextField,
    Typography, Rating, Checkbox, Tooltip, FormControlLabel, CardContent, CircularProgress,
} from "@mui/material";
import {AutoPlaySwipeableViews, getValueColor, uploader, colors} from "../util/functions";
import Pagination from "../components/Pagination";
import {
    ArrowRight, Check, Delete, Edit,
    ExpandMore,
    Favorite,
    Share, Star, Visibility, VisibilityOff, Warning, Add, Help, ArrowLeft, ChevronLeft, ChevronRight
} from "@mui/icons-material";
import {UploadDropzone, UploadButton} from "react-uploader";
import Requires from "../util/requires";
import {AddItemDl} from "../components/shop/AddItemDl";
import SwipeableViews from "react-swipeable-views";

export default class Item extends Component {
    constructor(props) {
        super(props);

        this.state = {
            item: props.item,
            shop: {},

            reportDl: false,
            report: {
                photos: []
            },

            addDl: false,

            deleteDl: false,
            deleteName: "",
            deleteCountDown: 5,

            pag: 0,

            addingRate: false,
            addingRateImgs: [],
            addingRateDesc: "",
            addingRateAnonymous: false,
            addingRating: 0,
            addingPag: 0,

            setRating: [],
            ratedUser: [],
            ratedUserPags: [0, 0, 0],
            ratedUserPag: 0,

            noRatedUser: false,
        }
    }

    updateItem = async (update) => {
        let res = await Requires.put("/users/editItem/" + this.state.item._id, update);
        if (res.status === 200) {
            await this.props.loadItem();
            this.setState({
                item: res.data.item,
                addDl: false,
            });
        }
    }

    loadRated = async () => {
        this.setState({ noRatedUser: false })
        let ratedUser = []
        Array.from(this.state.setRating).splice(0, 3).map(async (item, index) => {
            let user = await Requires.get("/user/" + item.user_id);
            console.log(user);
            if (user.status === 200) {
                ratedUser.push({
                    ...item,
                    username: item.anonymous ? "匿名" : user.data.user.username,
                    photoURL: item.anonymous ? "" : user.data.user.photoURL
                })
            }
        })
        this.setState({ratedUser: ratedUser, noRatedUser: ratedUser.length === 0})
    }

    async componentDidMount() {
        let res = await Requires.get("/shops/get/" + this.state.item.shopId)
        if (res.status === 200) {
            this.setState({
                shop: res.data,
                setRating: this.state.item.rating ? this.state.item.rating : []
            });
            setTimeout(async () => await this.loadRated(), 100)
        }
    }

    render() {
        return [undefined, null].includes(this.state.item) ? <DialogContent>
            <Stack width={"100%"} height={"100%"} justifyContent={"center"} alignItems={"center"}>
                <Typography>
                    Undefined Item ID
                </Typography>
                <Button onClick={this.props.close}>Back</Button>
            </Stack>
        </DialogContent> : <>
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
            {
                this.state.item.imageList?.length !== 0 && <Box sx={{
                    position: 'relative',
                    filter: "drop-shadow(2px 4px 6px black)"
                }}>
                    <AutoPlaySwipeableViews
                        index={this.state.pag}
                        onChangeIndex={(i) => this.setState({pag: i})}
                    >
                        {
                            this.state.item.imageList?.map((url, index) => {
                                return (
                                    <CardMedia
                                        key={index}
                                        sx={{height: 600}}
                                        image={url}
                                        title={url}
                                    />)
                            })
                        }
                    </AutoPlaySwipeableViews>
                    <Pagination
                        dots={this.state.item.imageList?.length}
                        index={this.state.pag}
                        onChangeIndex={(i) => this.setState({pag: i})
                        }
                    />
                </Box>
            }
            <DialogContent sx={{minHeight: "50vh", overflowY: "visible", p: 3}}>
                <Stack width={"100%"} spacing={2}>
                    <Stack direction={"row"} justifyContent={"space-between"}>
                        <Stack width={"90%"}>
                            <CardActionArea onClick={() => {
                                window.location.hash = "/shop/" + this.state.item.shopId;
                                this.props.close();
                            }}>
                                <Stack direction={"row"} alignItems={"center"} width={"fit-content"} p={1} spacing={2}>
                                    <Avatar
                                        src={this.state.shop.avatar}
                                        alt={this.state.shop.name}
                                        sx={{width: 60, height: 60}}
                                    />
                                    <Stack>
                                        <Typography
                                            variant={"h5"}>{this.state.shop.shopName}
                                        </Typography>
                                        <Typography
                                            sx={{fontSize: '1rem', width: "60%"}}>
                                            {this.state.shop.short && this.state.shop.short}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </CardActionArea>
                            <Divider sx={{width: "100%", my: 1}}/>
                            <Typography fontSize={'1rem'} color={"darkgray"}>
                                {this.state.item.others ? this.state.item.selectedCategoryOther : this.state.item.selectedCategory.join("\n")}
                            </Typography>
                            <Typography variant={"h2"} color={"white"}>
                                {this.state.item.name}
                            </Typography>
                            {this.state.item.desc}

                        </Stack>
                        <Stack direction={"row"} spacing={1} height={"100%"}>
                            <Stack height={"100%"} justifyContent={"space-between"} spacing={1}>
                                {this.props.favorited?.includes(this.state.item._id) ?
                                    <Button
                                        startIcon={<Favorite color={"red"}/>}
                                        variant={"contained"}
                                        color={"error"}
                                        onClick={async () => await this.props.onFavorite(true, this.state.item._id)}
                                    >
                                        Favorited
                                    </Button> :
                                    <Button
                                        startIcon={<Favorite/>}
                                        variant={"outlined"}
                                        onClick={async () => this.props.user?._id ? await this.props.onFavorite(false, this.state.item._id) : this.setState({needLoginSb: true})}
                                    >
                                        Favorite
                                    </Button>
                                }
                                {this.state.copied ? <Button
                                    startIcon={<Check/>}
                                    variant={"contained"}
                                    color={"success"}
                                    onClick={() => {
                                        this.setState({copied: true})
                                        navigator.clipboard.writeText(window.location.host + `/#/shop/${this.props.shopId}?itemId=${this.state.item._id}`);
                                        setTimeout(() => this.setState({copied: false}), 1000);
                                    }}
                                >
                                    Copied
                                </Button> : <Button
                                    startIcon={<Share/>}
                                    variant={"outlined"}
                                    color={"info"}
                                    onClick={() => {
                                        this.setState({copied: true})
                                        navigator.clipboard.writeText(window.location.host + (process.env.REACT_APP_HERF !== undefined ? process.env.REACT_APP_HERF : "") + `/#/shop/${this.props.shopId}?itemId=${this.state.item._id}`);
                                        setTimeout(() => this.setState({copied: false}), 1000);
                                    }}
                                >
                                    Share
                                </Button>}
                                <Button startIcon={<Warning/>} variant={"outlined"} color={"warning"}
                                        onClick={() => this.props.user?._id ? this.setState({reportDl: true}) : this.setState({needLoginSb: true})}>
                                    Report
                                </Button>

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
                            </Stack>
                            {this.props.owner &&
                                <Stack
                                    height={"100%"}
                                    justifyContent={"space-between"}
                                    sx={{
                                        border: "red 1px solid",
                                        borderRadius: "8px",
                                        p: 1,
                                        background: "repeating-linear-gradient(-45deg, rgba(255, 0, 0, .5), rgba(255, 0, 0, .6) 30px, rgba(255, 0, 0, 0) 0, rgba(255, 0, 0, 0) 50px) !important"
                                    }}
                                    spacing={2}
                                >
                                    {this.state.item.visible ?
                                        <Button
                                            startIcon={<Visibility/>}
                                            variant={"contained"}
                                            color={"success"}
                                            onClick={async () => await this.updateItem({visible: false})}
                                        >
                                            visible
                                        </Button> :
                                        <Button
                                            startIcon={<VisibilityOff/>}
                                            variant={"contained"}
                                            color={"error"}
                                            onClick={async () => await this.updateItem({visible: true})}
                                        >
                                            Hidden
                                        </Button>
                                    }
                                    <Button onClick={() => this.setState({addDl: true})} startIcon={<Edit/>}
                                            variant={"contained"} color={"warning"}>
                                        Edit
                                    </Button>
                                    <AddItemDl
                                        addDl={this.state.addDl}
                                        closeDl={() => this.setState({addDl: false})}
                                        category={this.props.category}
                                        loadItem={this.props.loadItem}
                                        updateItem={async (n) => await this.updateItem(n)}
                                        edit={true}
                                        data={this.state.item}
                                    />

                                    <Button onClick={() => this.setState({
                                        deleteDl: true,
                                        deleteName: "",
                                        deleteCountDown: "-"
                                    })} startIcon={<Delete/>} variant={"contained"} color={"error"}>
                                        Delete
                                    </Button>
                                    <Dialog open={this.state.deleteDl} onClose={() => this.setState({deleteDl: false})}>
                                        <DialogTitle>
                                            <Typography variant={"h3"} color={"error"}>
                                                您確定要刪除此商品嗎<br/>您無法撤消此操作
                                            </Typography>
                                        </DialogTitle>
                                        <DialogContent>
                                            <TextField
                                                label={`請輸入該商品的名稱 [ ${this.state.item.name} ] 進行確認`}
                                                value={this.state.deleteName}
                                                onChange={(e) => {
                                                    let text = e.target.value;
                                                    this.setState({deleteName: text});

                                                    if (text === this.state.item.name) {
                                                        this.setState({deleteCountDown: 5});
                                                        setTimeout(() => {
                                                            this.setState({deleteCountDown: 4});
                                                            if (this.state.deleteName === this.state.item.name) {
                                                                setTimeout(() => {
                                                                    this.setState({deleteCountDown: 3});
                                                                    if (this.state.deleteName === this.state.item.name) {
                                                                        setTimeout(() => {
                                                                            this.setState({deleteCountDown: 2});
                                                                            if (this.state.deleteName === this.state.item.name) {
                                                                                setTimeout(() => {
                                                                                    this.setState({deleteCountDown: 1});
                                                                                    if (this.state.deleteName === this.state.item.name) {
                                                                                        setTimeout(() => {
                                                                                            this.setState({deleteCountDown: 0});
                                                                                            if (this.state.deleteName === this.state.item.name) {

                                                                                            } else {
                                                                                                this.setState({deleteCountDown: "-"});
                                                                                            }
                                                                                        }, 1000)
                                                                                    } else {
                                                                                        this.setState({deleteCountDown: "-"});
                                                                                    }
                                                                                }, 1000)
                                                                            } else {
                                                                                this.setState({deleteCountDown: "-"});
                                                                            }
                                                                        }, 1000)
                                                                    } else {
                                                                        this.setState({deleteCountDown: "-"});
                                                                    }
                                                                }, 1000)
                                                            } else {
                                                                this.setState({deleteCountDown: "-"});
                                                            }
                                                        }, 1000)
                                                    }
                                                }}
                                                error={this.state.deleteName !== this.state.item.name}
                                                sx={{mt: 2}}
                                                fullWidth
                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            <Button
                                                onClick={(e) => this.setState({deleteDl: false})}
                                                color={"error"}
                                                variant={"text"}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size={"large"}
                                                color={"error"}
                                                variant={"contained"}
                                                disabled={this.state.deleteCountDown > 0 || "-" === this.state.deleteCountDown}
                                                onClick={async () => {
                                                    let res = await Requires.delete("/users/editItem/" + this.state.item._id);
                                                    if (res.status === 200) {
                                                        await this.props.loadItem();
                                                        this.props.close()
                                                    }
                                                }}
                                            >
                                                DELETE{![0, "-"].includes(this.state.deleteCountDown) && <> ({this.state.deleteCountDown}s)</>}
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Stack>
                            }
                        </Stack>
                    </Stack>
                    <Box>
                        <Accordion sx={{bgColor: "rgba(0,0,0,0.5)"}}>
                            <AccordionSummary
                                expandIcon={<ExpandMore/>}
                            >
                                <Typography color={"lightgreen"}
                                            fontSize={"1.25rem"}
                                >
                                    <a style={{
                                        fontSize: "2.5rem"
                                    }}>最低價格：${Math.ceil(Math.min(...this.state.item.price.map(i => i[0] / i[1])) * 10) / 10}</a><sub>/{this.state.item.unit}
                                    <a style={{color: "gray", marginLeft: "3em"}}>(點擊查看所有價格)</a></sub>
                                </Typography>
                            </AccordionSummary>
                            <Divider/>
                            <AccordionDetails>
                                <List>
                                    {this.state.item.price.map((p, index) => {
                                        return <MenuItem sx={{
                                            textAlign: "center",
                                            fontSize: "2rem",
                                            justifyContent: "center"
                                        }}>
                                            HKD${p[0]} <ArrowRight/> {p[1]}{this.state.item.unit}
                                            <Typography variant={"h6"} color={"lightgray"} sx={{ml: 3}}>
                                                ${Math.ceil(p[0] / p[1] * 100) / 100}@{this.state.item.unit}
                                            </Typography>
                                        </MenuItem>
                                    })}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                        {this.state.item.record.length < 1 ? <Accordion>
                                <AccordionSummary>
                                    <a style={{fontSize: "2.5rem", color: "lightblue"}}>最近最新鮮的進貨日期：</a>
                                    <a style={{fontSize: "2.5rem", color: "red"}}>無庫存</a>
                                </AccordionSummary>
                            </Accordion> :
                            <Accordion>
                                <AccordionSummary>
                                    <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}
                                           width={"100%"}>
                                        <Typography color={"lightblue"}
                                                    fontSize={"1.25rem"}
                                        >
                                            <a style={{fontSize: "2.5rem"}}>最近最新鮮的進貨日期：</a>
                                            <a style={{
                                                fontSize: "2rem",
                                                color: getValueColor(Math.min(...this.state.item.record.map(r => Math.floor((new Date() - new Date(r.time)) / (1000 * 60 * 60 * 24)))))
                                            }}>
                                                {Math.min(...this.state.item.record.map(r => Math.floor((new Date() - new Date(r.time)) / (1000 * 60 * 60 * 24))))}日{Math.min(...this.state.item.record.map(r => Math.floor((new Date() - new Date(r.time)) / (1000 * 60 * 60) % 24)))}小時前
                                            </a>
                                        </Typography>
                                        <Divider orientation={"vertical"} flexItem/>
                                        <Typography fontSize={"1.5rem"}>
                                            總庫儲量: {this.state.item.barCode ? this.state.item.record.length : this.state.item.record.map(r => r.count).reduce((a, c) => a + c, 0)}
                                        </Typography>
                                    </Stack>
                                </AccordionSummary>
                            </Accordion>}
                        <Accordion defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Stack direction={"row"} alignItems={"center"}>
                                    <Typography
                                        style={{fontSize: "2.5rem", color: "lightyellow"}}>商品評價：</Typography>
                                    <Rating
                                        readOnly
                                        value={[0, undefined].includes(this.state.setRating?.length) ? 0 : this.state.setRating.map(r => r.rate).reduce((a, c) => a + c) / this.state.setRating.length}
                                        precision={0.5}
                                        icon={<Star/>}
                                        emptyIcon={<Star style={{opacity: 0.55}}/>}
                                        sx={{"*": {fontSize: "xxx-large"}}}
                                    />
                                    <Typography color={"gray"} pl={2}>
                                        ({[0, undefined].includes(this.state.setRating?.length) ? "暫無評價" : this.state.setRating.length})
                                    </Typography>
                                </Stack>
                            </AccordionSummary>
                            <Divider/>
                            <AccordionDetails>
                                {[0, undefined].includes(this.state.item.rating?.length) ? <Stack
                                    fontSize={"4em"}
                                    width={"100%"}
                                    alignItems={"center"}
                                    justifyContent={"center"}
                                    height={"5em"}
                                >
                                    暫無評價
                                </Stack> : <Stack>
                                    <Stack width={"100%"} alignItems={"center"}>
                                        <Stack direction={"row"} alignItems={"center"}>
                                            <Typography variant={"h1"}>
                                                {this.state.setRating.length === 0 ? "0.0" : (Math.round(this.state.setRating.map(r => r.rate).reduce((a, c) => a + c) / this.state.setRating.length * 10) / 10).toFixed(1)}
                                            </Typography>
                                            <Stack pl={2}>
                                                {[5, 4, 3, 2, 1].map((i, index) => {
                                                    return <Stack key={index} alignItems={"center"} direction={"row"}>
                                                        <Typography>{i}</Typography>
                                                        <Star fontSize={"small"}/>
                                                        <Box
                                                            ml={1}
                                                            borderRadius={"4px"}
                                                            boxShadow={"inset #333030 0 0 0.25em 0.125em"}
                                                            width={"150px"}
                                                            height={"10px"}
                                                            bgcolor={"rgba(255,255,255,0.2)"}
                                                        ><Box
                                                            height={"10px"}
                                                            borderRadius={"4px"}
                                                            bgcolor={colors[index]}
                                                            sx={{
                                                                transition: "width 0.5s"
                                                            }}
                                                            width={this.state.setRating.length === 0 ? 0 : this.state.setRating?.filter(r => r.rate === i).length / this.state.setRating?.filter(r => r.rate === this.state.setRating?.map(r => r.rate).reduce(
                                                                (acc, val, index, arr) =>
                                                                    (arr.filter(v => v === val).length > acc[1] ? [val, arr.filter(v => v === val).length] : acc),
                                                                [null, 0]
                                                            )[0]).length * 150}
                                                        /></Box>
                                                    </Stack>
                                                })}
                                            </Stack>
                                        </Stack>
                                        <Typography color={"gray"}>
                                            {this.state.setRating.length}則評價
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
                                                            ratedUserPag: 0,
                                                            setRating: n ? this.state.item.rating.filter(r => r.imageList.length !== 0) : this.state.item.rating
                                                        });
                                                        setTimeout(async () => await this.loadRated(), 100);
                                                    }}
                                                />}
                                            />
                                        </Stack>
                                    </Stack>
                                    <Divider/>
                                    <Stack width={"100%"} minHeight={"10em"} display={"related"} position={"relative"}>
                                        <Button sx={{
                                            height: "5em",
                                            position: "absolute",
                                            top: "calc(50% - 2.5em)",
                                            left: "0",
                                            zIndex: "999"
                                        }}
                                                onClick={(e) => this.setState({ratedUserPag: this.state.ratedUserPag === 0 ? this.state.ratedUser.length - 1 : this.state.ratedUserPag - 1})}>
                                            <ChevronLeft fontSize={"large"}/>
                                        </Button>
                                        <Button sx={{
                                            height: "5em",
                                            position: "absolute",
                                            top: "calc(50% - 2.5em)",
                                            right: "0",
                                            zIndex: "999"
                                        }}
                                                onClick={(e) => this.setState({ratedUserPag: this.state.ratedUserPag === this.state.ratedUser.length - 1 ? 0 : this.state.ratedUserPag + 1})}>
                                            <ChevronRight fontSize={"large"}/>
                                        </Button>
                                        <Stack
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%"
                                            }}
                                            alignItems={"center"}
                                            justifyContent={"center"}
                                        >
                                            <CircularProgress size={"4em"}/>
                                        </Stack>
                                        <SwipeableViews
                                            index={this.state.ratedUserPag}
                                            onChangeIndex={(i) => this.setState({ratedUserPag: i})}
                                            style={{width: "100%"}}
                                        >
                                            {this.state.ratedUser.map((item, index) => {
                                                return <Stack justifyContent={"center"} alignItems={"center"}
                                                              height={"100%"} width={"100%"}>
                                                    <Card elevation={12} sx={{m: "2em", width: "80%"}}>
                                                        <CardHeader
                                                            avatar={
                                                                <Avatar
                                                                    src={item.photoURL}
                                                                    alt={item.username}
                                                                    sx={{
                                                                        height: 40,
                                                                        width: 40
                                                                    }}
                                                                />
                                                            }
                                                            title={<Typography
                                                                variant={"h5"}>{item.username}</Typography>}
                                                        />
                                                        {
                                                            item.imageList?.length !== 0 && <Box sx={{
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
                                                                        item.imageList?.map((url, i) => {
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
                                                                    dots={item.imageList?.length}
                                                                    index={this.state.ratedUserPags[index]}
                                                                    onChangeIndex={(i) => {
                                                                        let n = this.state.ratedUserPags;
                                                                        n[index] = i;
                                                                        this.setState({ratedUserPags: n})
                                                                    }}
                                                                />
                                                            </Box>
                                                        }
                                                        <CardContent>
                                                            <Rating
                                                                readOnly
                                                                value={item.rate}
                                                                precision={1}
                                                                icon={<Star/>}
                                                                emptyIcon={<Star style={{opacity: 0.55}}/>}
                                                            />
                                                            <Typography color={"gray"}>
                                                                {item.desc}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card></Stack>
                                            })}
                                        </SwipeableViews>
                                        <Pagination
                                            dots={this.state.ratedUser.length}
                                            index={this.state.ratedUserPag}
                                            onChangeIndex={(i) => this.setState({ratedUserPag: i})}
                                        />
                                    </Stack>
                                </Stack>}
                                <Divider sx={{my: 2}}/>
                                {this.state.addingRate && <Stack direction={"row"} height={"20em"}>
                                    <Stack width={"40%"}>
                                        {
                                            this.state.addingRateImgs?.length !== 0 ? <ImageList
                                                sx={{width: "100%", height: "100%"}}
                                                children={this.state.addingRateImgs?.map((item) => (
                                                    <ImageListItem key={item}>
                                                        <img
                                                            src={`${item}?w=164&h=164&fit=crop&auto=format`}
                                                            srcSet={`${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                                            alt={item}
                                                            loading="lazy"
                                                        />
                                                    </ImageListItem>
                                                ))}
                                            /> : <Stack fontSize={"2em"} width={"100%"} alignItems={"center"}
                                                        justifyContent={"center"} height={"100%"}>
                                                No Image
                                            </Stack>
                                        }
                                        <UploadButton
                                            uploader={uploader}
                                            options={{
                                                multi: true,
                                            }}
                                            children={(props) => <Button {...props} variant={"contained"}>Upload
                                                Images</Button>}
                                            onComplete={files => this.setState({
                                                addingRateImgs: files.map((f) => f.fileUrl)
                                            })}
                                        />
                                    </Stack>
                                    <Stack width={"calc(60% - 4em)"} px={"2em"} alignItems={"center"}
                                           justifyContent={"space-evenly"}>
                                        <Rating
                                            value={this.state.addingRating}
                                            onChange={(e, n) => this.setState({addingRating: n})}
                                            precision={1}
                                            icon={<Star/>}
                                            emptyIcon={<Star style={{opacity: 0.55}}/>}
                                            sx={{"*": {fontSize: "3rem"}}}
                                        />
                                        <TextField
                                            value={this.state.addingRateDesc}
                                            onChange={(e) => this.setState({addingRateDesc: e.target.value})}
                                            label={"Description"}
                                            fullWidth
                                            multiline
                                            minRows={3}
                                        />
                                        <Stack direction={"row"} alignItems={"center"}>
                                            <FormControlLabel
                                                control={<Checkbox
                                                    value={this.state.addingRateAnonymous}
                                                    defaultChecked={this.state.addingRateAnonymous}
                                                    onChange={(e, c) => this.setState({addingRateAnonymous: c})}
                                                />}
                                                label={"匿名"}
                                            />
                                        </Stack>
                                    </Stack>
                                </Stack>}
                                <Stack direction={"row"} justifyContent={"center"}>
                                    {this.state.addingRate ? <>
                                        <Button
                                            variant={"text"}
                                            color={"error"}
                                            onClick={(e) => this.setState({addingRate: false})}
                                        >Cancel</Button>
                                        <Button
                                            variant={"contained"}
                                            color={"success"}
                                            startIcon={this.state.item.rating.filter(r => r.user_id === this.props.user?.user_id).length !== 0 ?
                                                <Edit/> : <Add/>}
                                            onClick={async (e) => {
                                                let res = await Requires.put("/users/marked/" + this.state.item._id, {
                                                    action: "rate",
                                                    imageList: this.state.addingRateImgs,
                                                    rate: this.state.addingRating,
                                                    desc: this.state.addingRateDesc,
                                                    anonymous: this.state.addingRateAnonymous,
                                                })
                                                if (res.status === 200) {
                                                    this.setState({
                                                        item: {
                                                            ...this.state.item,
                                                            rating: res.data.rating
                                                        },
                                                        addingRate: false,
                                                        setRating: res.data.rating,
                                                    });
                                                    setTimeout(async () => await this.loadRated(), 100)

                                                }
                                            }}
                                            disabled={
                                                this.state.addingRating === 0
                                            }
                                        >{this.state.item.rating.filter(r => r.user_id === this.props.user?.user_id).length !== 0 && "修改"}評價</Button>
                                    </> : (this.state.item.rating.filter(r => r.user_id === this.props.user?.user_id).length !== 0 ?
                                            <Button
                                                variant={"outlined"}
                                                color={"warning"}
                                                startIcon={<Edit/>}
                                                onClick={() => {
                                                    let ratings = this.state.item.rating.filter(r => r.user_id === this.props.user?.user_id)[0];
                                                    console.log(ratings.anonymous);
                                                    this.setState(this.props.user?._id ? {
                                                        addingRate: true,
                                                        addingRateImgs: ratings.imageList,
                                                        addingRating: ratings.rate,
                                                        addingRateDesc: ratings.desc,
                                                        addingRateAnonymous: ratings.anonymous ? true : false,
                                                    } : {needLoginSb: true});
                                                }}
                                            >修改評價</Button> : <Button
                                                variant={"outlined"}
                                                color={"warning"}
                                                startIcon={<Add/>}
                                                onClick={() => this.props.user?._id ? this.setState({addingRate: true}) : this.setState({needLoginSb: true})}
                                            >評價</Button>
                                    )}
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                </Stack>
            </DialogContent>
        </>

    }
}