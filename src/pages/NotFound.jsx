import {Component} from "react";
import {Stack, Typography} from "@mui/material";
import {DoNotDisturb} from "@mui/icons-material";

export default class NotFound extends Component {
    render() {
        return (
            <Stack height={"90vh"} alignItems={"center"} justifyContent={"center"}>
                <DoNotDisturb sx={{fontSize: "20em"}}/>
                <Typography variant={"h1"}>
                    404 Not Found! :(
                </Typography>
            </Stack>
        )
    }
}