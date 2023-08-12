import {Component} from "react";
import {alpha, InputBase, styled, Typography, InputAdornment, Stack} from "@mui/material";
import {Search} from "@mui/icons-material";
import "../styles/Home.css";

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
    render() {
        return (
            <Stack sx={{textAlign: "center", margin: "5em"}} spacing={3}>
                <Typography variant={"h1"}>
                    Welcome to 買D餸
                </Typography>
                <Typography variant={"h6"} color={"grey"}>
                    Description. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Debitis dolores rem
                    voluptates! Eos, iusto, nemo. Accusamus ad atque cum dolorum ea est eum facere fugit iure, iusto
                    maiores provident quod rerum sapiente suscipit ullam veritatis vitae voluptas. Asperiores commodi
                    consequuntur deserunt exercitationem, libero odit reprehenderit sed vero voluptatibus? Accusamus
                    aliquid aspernatur deleniti ea eaque esse excepturi fuga harum impedit in iusto laborum magni minus,
                    molestiae, necessitatibus quaerat quibusdam reiciendis suscipit tenetur vel! Delectus distinctio,
                    dolorum esse, est eveniet hic in, inventore laborum magnam minima numquam quas quasi quia recusandae
                    sed tenetur ullam veniam! Culpa deserunt dicta laudantium quod soluta unde!
                </Typography>
                <SearchBar>
                    <InputBase
                        sx={{m: 1,  width: "100%", fontSize: "1.75em"}}
                        placeholder="Search..."
                        startAdornment={
                            <InputAdornment position="start">
                                <Search sx={{fontSize: "1.5em"}}/>
                            </InputAdornment>
                        }
                    />
                </SearchBar>
            </Stack>
        )
    }
}

export default Home;
