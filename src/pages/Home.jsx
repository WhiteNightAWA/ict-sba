import {Component} from "react";
import {alpha, InputBase, styled, Typography, InputAdornment, Stack, List, MenuItem, Button} from "@mui/material";
import {KeyboardDoubleArrowRight, Search} from "@mui/icons-material";
import "../styles/Home.css";
import Requires from "../util/requires";
import {Link} from "react-router-dom";

const SearchBar = styled('div')(({theme}) => ({
    position: 'relative',
    borderRadius: "0.75em",
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '60%',
    height: "5em",
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
    display: "flex",
    flexDirection: "row",
}));


class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    async componentDidMount() {
        let user = await Requires.get("/users/test");
        if (user.status === 200) {
            this.setState({
                type: user.data.type
            });
        }
    }

    render() {
        return (
            <Stack sx={{textAlign: "center", margin: "5em"}} spacing={3}>
                <Typography variant={"h1"}>
                    歡迎來到<Typography fontSize={"8rem"} className={"background-gradient"}>買D餸</Typography>
                </Typography>
                <Typography variant={"h6"} color={"lightgoldenrodyellow"}>
                    歡迎來到我們的網站！
                    <br/>
                    我們的目標是讓顧客以更實惠的價格找到合適的美食。我們明白新鮮度的重要性，因此我們確保您能夠找到新鮮美味的選擇，同時不會讓您花費過多。
                    <br/>
                    對於餐廳老闆，我們提供一個平台，讓您有更多曝光機會，吸引更廣泛的觀眾。我們了解能見度的價值，希望能幫助您展示您的美食，吸引潛在顧客。
                    <br/>
                    立即加入我們，體驗一個讓每個參與者受益的平台。發現實惠、新鮮的美食，享受無壓力的環境，並為您的餐廳獲得更多曝光。讓我們攜手創建一個滿足顧客、快樂員工和成功餐廳老闆的繁榮社區。
                </Typography>
                <Stack direction={"row"} justifyContent={"space-around"}>
                    <Link to={"buy"}>
                        <Button
                            endIcon={<KeyboardDoubleArrowRight sx={{"*": {fontSize: "3rem"}}}/>}
                        >
                            <Typography variant={"h3"}>
                                探索更多餸
                            </Typography>
                        </Button>
                    </Link>
                    {this.state.type ? <Link to={"myShop"}>
                        <Button
                            endIcon={<KeyboardDoubleArrowRight sx={{"*": {fontSize: "3rem"}}}/>}
                            disabled={this.state.type !== "sell"}
                        >
                            <Typography variant={"h3"}>
                                管理你的商店
                            </Typography>
                        </Button>
                    </Link> : <Link to={"login"}><Button
                        endIcon={<KeyboardDoubleArrowRight sx={{"*": {fontSize: "3rem"}}}/>}
                    >
                        <Typography variant={"h3"}>
                            登入/註冊
                        </Typography>
                    </Button></Link>}
                </Stack>
            </Stack>
        )
    }
}

export default Home;
