import Axios from "axios";
import cookie from "react-cookies";


let url = !process.env.NODE_ENV || process.env.NODE_ENV === "development" ? "http://localhost:3100" : "https://p01--server--p5rzjcrgjpvy.code.run";



export default class Requires {
    static async get(path: String) {
        let res;
        try {
            if (cookie.load("jwt")) {
                res = await Axios.get(url+path, {
                    headers: { Authorization: `Bearer ${cookie.load("jwt")}` }
                });
            } else {
                res = await Axios.get(url+path);
            }
        } catch (err) {
            res = err.response;
        }
        console.log(res);
        return res;
    };

    static async post(path: String, data: Object) {
        let res;
        try {
            if (cookie.load("jwt")) {
                res = await Axios.post(url+path, data, {
                    headers: { authorization: `Bearer ${cookie.load("jwt")}` },
                });
            } else {
                res = await Axios.post(url+path, data);
            }
        } catch (err) {
            res = err.response;
        }
        if (res.status === 200) {
            if ("cookies" in res.data) {
                cookie.save(...res.data.cookies);
            }
        }

        return res;
    };
}


