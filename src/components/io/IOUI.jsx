import {Component} from "react";
import {Card, CardActionArea, CardContent, Grid, Stack, Typography} from "@mui/material";
import Requires from "../../util/requires";

export class IOUI extends Component {
    constructor(props) {
        super(props);

        this.state = {
            input: props.in,
            items: [],
        };
    }

    async componentDidMount() {
        await this.loadItem()
    }


    loadItem = async () => {
        let res = await Requires.get("/shops/items!");
        if (res.status === 200) {
            this.setState({
                items: res.data.items,
                pag: Array(res.data.items.length).fill(0),
                noItem: res.data.items.length < 1
            });
        } else {
            this.setState({
                loading: false,
                sb: true, sbS: "error", sbMsg: res.data.error_description
            });
        }
    }

    render() {
        return (
            <Grid container spacing={2} height={"100%"} p={4}>
                {this.state.items.map((i, index) => (
                    <Grid item xs={3} width={"20vw"} height={"20vh"}>
                        <Card variant={"outlined"} sx={{ width: "100%", height: "100%"}}>
                            <CardActionArea
                                sx={{
                                    width: "100%", height: "100%",
                                    background: i.record.length <= 0 && !this.state.input ? "repeating-linear-gradient(-45deg, rgba(255, 0, 0, .5), rgba(255, 0, 0, .6) 30px, rgba(255, 0, 0, 0) 0, rgba(255, 0, 0, 0) 50px) !important" : (
                                        i.barCode ?  "repeating-linear-gradient(-45deg, rgba(255, 155, 0, .5), rgba(255, 155, 0, .6) 30px, rgba(255, 155, 0, 0) 0, rgba(255, 0, 155, 0) 50px) !important" : ""
                                    )
                                }}
                                disabled={(i.record.length <= 0 && !this.state.input) || i.barCode}
                                onClick={async () => {
                                    let item = await Requires.put("/users/ioItem/"+i._id, {
                                        count: this.state.input ? 1 : -1
                                    }).then(async (res) => {
                                        if (res.status === 200) {
                                            await this.loadItem();
                                        }
                                    });
                                }}
                            >
                                <CardContent>
                                    <Stack>
                                        <Typography textAlign={"center"} variant={"h6"} color={"gray"}>
                                            {i.barCode ? i.record.length : i.record.map(r => r.count).reduce((a, c) => a + c, 0)}
                                        </Typography>
                                        <Typography textAlign={"center"} variant={"h2"}>
                                            {i.name}
                                        </Typography>
                                    </Stack>
                                    
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        )
    }
}