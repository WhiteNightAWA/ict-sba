import {Component} from "react";
import {Button, Stack, Typography} from "@mui/material";

export class Chat extends Component {
	render() {
		return (
			<Stack sx={{textAlign: "center", margin: "5em"}} spacing={3}>
				<Typography variant={"h2"}>
					Please Login or Signup to Contiune
				</Typography>
				<Stack direction={"row"} justifyContent={"center"} spacing={5}>
					<Button size={"large"} variant="outlined">
						Log In
					</Button>
					<Button size={"large"} variant="contained">
						Sign Up
					</Button>
				</Stack>
			</Stack>
		)
	}
}