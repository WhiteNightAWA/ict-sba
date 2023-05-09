import { useNavigate } from 'react-router-dom';
import {Tab} from "@mui/material";
import React from "react";

class _TabsLink extends React.Component {
    render() {
        return (
            <Tab {...this.props} sx={{
                fontSize: this.props.fontSize || "1em"
            }} onClick={this.click} />
        );
    }

    click = () => {
        this.props.navigate[0](this.props.value === "home" ? "/" : this.props.value)
    }
}

function TabsLink(props) {
    let navigate = useNavigate();
    // eslint-disable-next-line
    return <_TabsLink {...props} navigate={[navigate]} />
}

export default TabsLink;