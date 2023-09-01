import Axios from "axios";
import cookie from "react-cookies";


let url = !process.env.NODE_ENV || process.env.NODE_ENV === "development" ? "http://localhost:3100" : "https://p01--server--p5rzjcrgjpvy.code.run";



export default class Requires {
    static async get(path: String, header: Object) {
        let res;
        if (!header) { header = {} };
        try {
            if (cookie.load("jwt")) {
                res = await Axios.get(url+path, {
                    headers: { Authorization: `Bearer ${cookie.load("jwt")}`, ...header }
                });
            } else {
                res = await Axios.get(url+path, { ...header });
            }
        } catch (err) {
            res = err.response;
        }
        console.log(res);
        return res;
    };

    static async delete(path: String) {
        let res;
        try {
            if (cookie.load("jwt")) {
                res = await Axios.delete(url+path, {
                    headers: { Authorization: `Bearer ${cookie.load("jwt")}` }
                });
            } else {
                res = await Axios.delete(url+path);
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


    static async put(path: String, data: Object) {
        let res;
        try {
            if (cookie.load("jwt")) {
                res = await Axios.put(url+path, data, {
                    headers: { authorization: `Bearer ${cookie.load("jwt")}` },
                });
            } else {
                res = await Axios.put(url+path, data);
            }
        } catch (err) {
            res = err.response;
        }
        return res;
    }
}


