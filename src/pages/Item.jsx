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
    Typography
} from "@mui/material";
import {AutoPlaySwipeableViews, getValueColor, uploader} from "../util/functions";
import Pagination from "../components/Pagination";
import {
    ArrowRight, Check, Delete, Edit,
    ExpandMore,
    Favorite,
    Share, Visibility, VisibilityOff, Warning
} from "@mui/icons-material";
import {UploadDropzone} from "react-uploader";
import Requires from "../util/requires";
import {AddItemDl} from "../components/AddItemDl";

export default class Item extends Component {
    constructor(props) {
        super(props);

        console.log(props);
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

    async componentDidMount() {
        let res = await Requires.get("/shops/get/" + this.state.item.shopId)
        if (res.status === 200) {
            this.setState({shop: res.data});
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
                                        onClick={async () => this.props.user?._id ? await this.props.onFavorite(false, this.state.item._id) : this.setState({ needLoginSb: true })}
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
                                        navigator.clipboard.writeText(window.location.host + `/#/shop/${this.props.shopId}?itemId=${this.state.item._id}`);
                                        setTimeout(() => this.setState({copied: false}), 1000);
                                    }}
                                >
                                    Share
                                </Button>}
                                <Button startIcon={<Warning/>} variant={"outlined"} color={"warning"}
                                        onClick={() => this.props.user?._id ? this.setState({reportDl: true}) : this.setState({ needLoginSb: true })}>
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
                                    }}>最低價格：${Math.min(...this.state.item.price.map(i => i[0] / i[1]))}</a><sub>/{this.state.item.unit}
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
                                                ${p[0] / p[1]}@{this.state.item.unit}
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
                    </Box>
                </Stack>
            </DialogContent>
        </>

    }
}