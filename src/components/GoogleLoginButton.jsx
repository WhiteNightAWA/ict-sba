import {Card, CardActionArea, CardContent, CardMedia, Typography} from "@mui/material";
import GoogleLogo from "../res/img/Google Logo.svg";
import React from "react";
import {useGoogleLogin} from "@react-oauth/google";

function GoogleLoginButton(props) {
	const googleLogin = useGoogleLogin({
		onSuccess: tokenResponse => console.log(tokenResponse),
	});

	return (
		<Card onClick={ props.disabled ? ()=>{} : googleLogin} sx={{
			boxShadow: "",
			filter: props.disabled ? "grayscale(1) contrast(0.85)" : "",
			color: props.disabled ? "grey" : ""
		}} >
			<CardActionArea disabled={props.disabled} sx={{display: 'flex', flexDirection: 'row'}}>
				<CardMedia
					component="img"
					sx={{width: 50}}
					image={GoogleLogo}
				/>
				<CardContent sx={{pl: 0}}>
					<Typography sx={{fontSize: "1.25em"}}>
						{props.state === "login" ? "Login " : "SignUp "} with Google
					</Typography>
				</CardContent>
			</CardActionArea>
		</Card>
	)
}

export default GoogleLoginButton;