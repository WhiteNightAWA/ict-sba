import { Component } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import {Box, Dialog, DialogTitle, IconButton, Stack} from "@mui/material";
import {Close} from "@mui/icons-material";

export class BarCodeIO extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: []
        };
    }

    render() {
        return <Dialog open={this.props.open} fullScreen={true} onClose={this.props.close}>
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                Input
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={this.props.close}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <Close />
            </IconButton>
            <Stack alignItems={"center"} height={"100%"} justifyContent={"center"}>
                <Box height={"20vh"} width={"100%"} sx={{
                    overflow: "hidden",
                    overflowAnchor: "center",
                    "*": {
                        width: "100vw",
                        height: "100vh",
                        mt: "-25%"
                    },
                }}>
                    <BarcodeScannerComponent
                        onUpdate={(err, result) => {
                            console.log(result);
                            if (result) this.setState({data: [...this.state.data, result.text]});

                        }}
                    />
                </Box>
                <p>{this.state.data}</p>
            </Stack>
        </Dialog>
    }
}