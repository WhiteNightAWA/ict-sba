import {Component} from "react";
import {
    Container,
    Box,
    Card,
    CardHeader,
    Avatar,
    IconButton,
    CardMedia,
    CardContent,
    Typography,
    CardAction, CardActions, Skeleton
} from "@mui/material";
import {Favorite, MoreVert, Share} from "@mui/icons-material";
import {red} from "@mui/material/colors";

export class Buy extends Component {
    render() {
        return (
            <Container sx={{
                m: 5,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-around",
                height: "85vh",
                overflow: "auto"
            }}>
                {[345, 551, 642, 352, 465, 522].map((w, index) => {
                    return (<Card sx={{width: w, m: 3}} elevation={6}>
                        <CardHeader
                            avatar={
                                <Skeleton variant="circular" width={40} height={40}/>
                            }
                            action={
                                <IconButton aria-label="settings" disabled={true}>
                                    <MoreVert/>
                                </IconButton>
                            }
                            title={<Skeleton variant="rounded" height={20}/>}
                            subheader={<Skeleton variant="text" sx={{fontSize: '1rem', width: "60%"}}/>}
                        />

                        <Skeleton variant="rectangular" width={"100%"} height={194}/>
                        <CardContent>
                            <Skeleton variant="text" sx={{fontSize: '1rem'}}/>
                            <Skeleton variant="text" sx={{fontSize: '1rem'}}/>
                            <Skeleton variant="text" sx={{fontSize: '1rem', width: "70%"}}/>
                        </CardContent>
                        <CardActions disableSpacing>
                            <IconButton aria-label="add to favorites" disabled={true}>
                                <Favorite/>
                            </IconButton>
                            <IconButton aria-label="share" disabled={true}>
                                <Share/>
                            </IconButton>
                        </CardActions>
                    </Card>)
                })}
            </Container>
        )
    }
}