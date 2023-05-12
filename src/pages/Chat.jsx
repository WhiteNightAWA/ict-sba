import {Component} from "react";
import {Stack, Typography} from "@mui/material";
import {Chat as ChatLogo} from "@mui/icons-material"

class Chat extends Component {

	render() {
		return (
			<Stack sx={{textAlign: "center", margin: "5em"}} spacing={5}>
				<Typography>
					<ChatLogo sx={{
						fontSize: "20em"
					}}/>
				</Typography>
				<Typography variant={"h2"}>
					Please Login or Signup to Contiune
				</Typography>
			</Stack>
		)
	}
}

export default Chat;