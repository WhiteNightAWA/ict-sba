import {Card, CardActionArea, CardContent, CardMedia, Typography} from "@mui/material";
import GoogleLogo from "../res/img/Google Logo.svg";
import React from "react";
import {useGoogleLogin} from "@react-oauth/google";
import Axios from "axios";
import cookie from "react-cookies";

function GoogleLoginButton(props) {
	const googleLogin = useGoogleLogin({
		onSuccess: async tokenResponse => {
			const res = await Axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
				headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
			});
			await props.google(res.data, tokenResponse)
		},
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
						Contiune with Google
					</Typography>
				</CardContent>
			</CardActionArea>
		</Card>
	)
}

export default GoogleLoginButton;