import {Component, useContext} from "react";
import {alpha, Box, Button, InputBase, styled, Tabs, Toolbar, Typography, AppBar as ABar} from "@mui/material";
import {Chat, Home, LocalMall, Search} from "@mui/icons-material";
import TabsLink from "./TabsLink";
import {Link} from "react-router-dom";


const SearchBar = styled('div')(({theme}) => ({
	position: 'relative',
	borderRadius: theme.shape.borderRadius,
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	'&:hover': {
		backgroundColor: alpha(theme.palette.common.white, 0.25),
	},
	marginRight: theme.spacing(2),
	marginLeft: 0,
	width: '100%',
	[theme.breakpoints.up('sm')]: {
		marginLeft: theme.spacing(3),
		width: 'auto',
	},
}));
const SearchIconWrapper = styled('div')(({theme}) => ({
	padding: theme.spacing(0, 2),
	height: '100%',
	position: 'absolute',
	pointerEvents: 'none',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
}));
const StyledInputBase = styled(InputBase)(({theme}) => ({
	color: 'inherit',
	'& .MuiInputBase-input': {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create('width'),
		width: '100%',
		[theme.breakpoints.up('md')]: {
			width: '20ch',
		},
	},
}));

class AppBar extends Component {

	constructor(props) {

		super(props);
		this.tabs = [
			["主頁", <Home/>, "home"],
			["BUY", <LocalMall/>, "buy"],
			["CHAT", <Chat/>, "chat"]
		]
		this.state = {
			tab: "home"
		}

	}
	render() {
		return (
			<Box sx={{flexGrow: 1}}>
				<ABar position="static">
					<Toolbar sx={{justifyContent: "space-between"}}>
						<Toolbar>

							<Typography variant="h6" component="div">
								[logo] Name
							</Typography>

							<SearchBar>
								<SearchIconWrapper>
									<Search/>
								</SearchIconWrapper>
								<StyledInputBase
									placeholder="Search…"
									inputProps={{'aria-label': 'search'}}
								/>
							</SearchBar>
						</Toolbar>

						<Tabs
							value={this.state.tab}
							onChange={(e, n) => this.setState({tab: n})}
							aria-label="page tabs"
						>

							{
								this.tabs.map((data, index) => {
									return <TabsLink sx={{
										width: "8em"
									}} label={data[0]} key={data[0]} icon={data[1]} value={data[2]} wrapped/>
								})
							}
						</Tabs>

						<Link to={"login"}>
							<Button className={"noTD"} size={"large"} vaiant={"contained"} onClick={() => this.setState({tab: "login"})}>
								Login & SignUp
							</Button>
						</Link>
					</Toolbar>
				</ABar>
			</Box>
		)
	}
}

export default AppBar;
