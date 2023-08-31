import {
    Accordion, AccordionDetails, AccordionSummary,
    Alert, Autocomplete, Button, Checkbox, Chip,
    Collapse, Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    Divider, FormControl, FormControlLabel, IconButton,
    ImageList,
    ImageListItem, InputAdornment, List, ListItem, ListItemButton, ListItemText,
    Paper, Radio, RadioGroup,
    Stack, TextField, Tooltip,
    Typography
} from "@mui/material";
import {UploadDropzone} from "react-uploader";
import {flattenObject, uploader} from "../util/functions";
import {ArrowRight, Clear, ExpandMore, KeyboardArrowRight} from "@mui/icons-material";
import {LoadingButton} from "@mui/lab";
import {Component} from "react";
import Requires from "../util/requires";

export class AddItemDl extends Component {
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
            selectedItem: null,

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
    modifyItem = async () => {
        this.setState({loading: true})
        let data = {
            imageList: this.state.imageList,
            selectedCategory: this.state.selectedCategory,
            others: this.state.others,
            selectedCategoryOther: this.state.selectedCategoryOther,
            name: this.state.name,
            unit: this.state.unit,
            desc: this.state.desc,
            barCode: this.state.barCode,
            price: this.state.price,
        };

        if (this.props.edit) {
            this.props.closeDl();
            this.setState({ loading: false });
            return await this.props.updateItem(data);
        }

        let res = this.props.edit ? await Requires.put("/users/editItem/"+this.props.data._id, data) : await Requires.post("/users/addItem", data);

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
            this.props.closeDl();
            await this.props.loadItem();
        } else {
            this.setState({
                loading: false,
                sb: true, sbS: "error", sbMsg: res.data.error_description
            });
        }
    }

    componentDidMount() {
        if (this.props.edit) {
            this.setState({...this.props.data})
        }
    }

    render() {
        return (
            <Dialog open={this.props.addDl} maxWidth={"lg"} fullWidth>
                <DialogTitle>
                    <Typography variant={"h3"}>
                        {this.props.edit ? "修改商品" : "新增商品"}
                    </Typography>
                </DialogTitle>
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
                                    <Stack width={"50%"} alignItems={"center"}
                                           justifyContent={"center"}>
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
                                            options={flattenObject(this.props.category)}
                                            onChange={(e, v) => this.setState({selectedCategory: v})}
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
                                                        {Object.keys(this.props.category).map((item, key) => {
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
                                                                <ListItemButton key={key}
                                                                                onClick={(e) => {
                                                                                    this.setState({categorySelect: [item]});
                                                                                }}
                                                                                sx={this.state.categorySelect[0] === item ? {
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
                                                            sx={isNaN(Object.keys(this.props.category[this.state.categorySelect[0]])[0]) ? {
                                                                width: "17%",
                                                                overflowY: "scroll",
                                                                maxHeight: "29em",
                                                            } : {
                                                                width: `${17 * 5}%`,
                                                                overflowY: "scroll",
                                                                maxHeight: "29em",
                                                            }}
                                                            dense={!isNaN(Object.keys(this.props.category[this.state.categorySelect[0]])[0])}>
                                                            {Object.keys(this.props.category[this.state.categorySelect[0]]).map((item, key) => {
                                                                return !isNaN(Number(item)) ?
                                                                    <ListItemButton key={key}
                                                                                    onClick={(e) => this.select(this.props.category[this.state.categorySelect[0]][item])}>
                                                                        <Checkbox
                                                                            size={"small"}
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            disableRipple
                                                                            checked={this.state.selectedCategory.includes(this.state.categorySelect.join(" > ") + " > " + this.props.category[this.state.categorySelect[0]][item])}
                                                                        />
                                                                        {this.props.category[this.state.categorySelect[0]][item]}
                                                                    </ListItemButton> :
                                                                    <ListItemButton key={key}
                                                                                    onClick={(e) => {
                                                                                        this.setState({categorySelect: [this.state.categorySelect[0], item]});
                                                                                    }}
                                                                                    sx={this.state.categorySelect[1] === item ? {
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
                                                            sx={isNaN(Object.keys(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]])[0]) ? {
                                                                width: "17%",
                                                                overflowY: "scroll",
                                                                maxHeight: "29em",
                                                            } : {
                                                                width: `${17 * 4}%`,
                                                                overflowY: "scroll",
                                                                maxHeight: "29em",
                                                            }}
                                                            dense={!isNaN(Object.keys(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]])[0])}>
                                                            {Object.keys(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]]).map((item, key) => {
                                                                return !isNaN(Number(item)) ?
                                                                    <ListItemButton key={key}
                                                                                    onClick={(e) => this.select(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][item])}>
                                                                        <Checkbox
                                                                            size={"small"}
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            disableRipple
                                                                            checked={this.state.selectedCategory.includes(this.state.categorySelect.join(" > ") + " > " + this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][item])}
                                                                        />
                                                                        {this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][item]}
                                                                    </ListItemButton> :
                                                                    <ListItemButton key={key}
                                                                                    onClick={(e) => {
                                                                                        this.setState({categorySelect: [this.state.categorySelect[0], this.state.categorySelect[1], item]});
                                                                                    }}
                                                                                    sx={this.state.categorySelect[2] === item ? {
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
                                                            sx={isNaN(Object.keys(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]])[0]) ? {
                                                                width: "17%",
                                                                overflowY: "scroll",
                                                                maxHeight: "29em",
                                                            } : {
                                                                width: `${17 * 3}%`,
                                                                overflowY: "scroll",
                                                                maxHeight: "29em",
                                                            }}
                                                            dense={!isNaN(Object.keys(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]])[0])}>
                                                            {Object.keys(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]]).map((item, key) => {
                                                                return !isNaN(Number(item)) ?
                                                                    <ListItemButton key={key}
                                                                                    onClick={(e) => this.select(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][item])}>
                                                                        <Checkbox
                                                                            size={"small"}
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            disableRipple
                                                                            checked={this.state.selectedCategory.includes(this.state.categorySelect.join(" > ") + " > " + this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][item])}
                                                                        />
                                                                        {this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][item]}
                                                                    </ListItemButton> :
                                                                    <ListItemButton key={key}
                                                                                    onClick={(e) => {
                                                                                        this.setState({categorySelect: [this.state.categorySelect[0], this.state.categorySelect[1], this.state.categorySelect[2], item]});
                                                                                    }}
                                                                                    sx={this.state.categorySelect[3] === item ? {
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
                                                            sx={isNaN(Object.keys(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]])[0]) ? {
                                                                width: "17%",
                                                                overflowY: "scroll",
                                                                maxHeight: "29em",
                                                            } : {
                                                                width: `${17 * 2}%`,
                                                                overflowY: "scroll",
                                                                maxHeight: "29em",
                                                            }}
                                                            dense={!isNaN(Object.keys(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]])[0])}>
                                                            {Object.keys(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]]).map((item, key) => {
                                                                return !isNaN(Number(item)) ?
                                                                    <ListItemButton key={key}
                                                                                    onClick={(e) => this.select(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][item])}>
                                                                        <Checkbox
                                                                            size={"small"}
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            disableRipple
                                                                            checked={this.state.selectedCategory.includes(this.state.categorySelect.join(" > ") + " > " + this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][item])}
                                                                        />
                                                                        {this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][item]}
                                                                    </ListItemButton> :
                                                                    <ListItemButton key={key}
                                                                                    onClick={(e) => {
                                                                                        this.setState({categorySelect: [this.state.categorySelect[0], this.state.categorySelect[1], this.state.categorySelect[2], this.state.categorySelect[3], item]});
                                                                                    }}
                                                                                    sx={this.state.categorySelect[4] === item ? {
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
                                                            sx={isNaN(Object.keys(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][this.state.categorySelect[4]])[0]) ? {
                                                                width: "17%",
                                                                overflowY: "scroll",
                                                                maxHeight: "29em",
                                                            } : {
                                                                width: `${17}%`,
                                                                overflowY: "scroll",
                                                                maxHeight: "29em",
                                                            }}
                                                            dense={!isNaN(Object.keys(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][this.state.categorySelect[4]])[0])}>
                                                            {Object.keys(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][this.state.categorySelect[4]]).map((item, key) => {
                                                                return !isNaN(Number(item)) ?
                                                                    <ListItemButton key={key}
                                                                                    onClick={(e) => this.select(this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][this.state.categorySelect[4]][item])}>
                                                                        <Checkbox
                                                                            size={"small"}
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            disableRipple
                                                                            checked={this.state.selectedCategory.includes(this.state.categorySelect.join(" > ") + " > " + this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][this.state.categorySelect[4]][item])}
                                                                        />
                                                                        {this.props.category[this.state.categorySelect[0]][this.state.categorySelect[1]][this.state.categorySelect[2]][this.state.categorySelect[3]][this.state.categorySelect[4]][item]}
                                                                    </ListItemButton> :
                                                                    <ListItemButton key={key}
                                                                                    onClick={(e) => {
                                                                                        this.setState({categorySelect: [this.state.categorySelect[0], this.state.categorySelect[1], this.state.categorySelect[2], this.state.categorySelect[3], this.state.categorySelect[4], item]});
                                                                                    }}
                                                                                    sx={this.state.categorySelect[5] === item ? {
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
                            <FormControl disabled={this.props.edit || this.state.loading}>
                                <Stack direction={"row"} alignItems={"center"}>
                                    <Typography variant={"h5"}>是否使用條形碼？</Typography>
                                    {Boolean(this.props.edit) && <Typography color={"error"}>
                                        您無法更改此設置，如果需要，您可以重新新增一個商品
                                    </Typography>}
                                </Stack>
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
                        onClick={this.props.closeDl}
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
                        onClick={this.modifyItem}
                    >
                        {this.props.edit ? "修改" : "新增"}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        )
    }
}