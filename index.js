const express = require("express");

const path = require('path');
const router = express.Router();

const app = express();

const os = require("os");

app.use(express.json())
app.use('/', router);

const jwt = require("jsonwebtoken");
const extractJwt = require("passport-jwt").ExtractJwt;
const strategyJwt = require("passport-jwt").Strategy;
const passport = require("passport");

const dotEnv = require("dotenv");
dotEnv.config();
const SECRET_KEY = process.env.TOKEN_SECRET;

const jwtOption = {
    jwtFromRequest: extractJwt.fromUrlQueryParameter("accessToken"),
    secretOrKey: SECRET_KEY
};

const jwtAuth = new strategyJwt(jwtOption, (payload, done) => {
    console.log(payload)
    if(payload.game_id === "00001"){
        done(null, true);
    }else{
        done(null, false);
    }
});

passport.use(jwtAuth);
const middlewareGame = passport.authenticate("jwt", {session:false});

//* play game link and get
app.get('/', middlewareGame, (req, res) => {
    res.sendFile(path.join(__dirname+'/view/index.html'));
});

//* requirement when for get link
const middlewareAPI = (req, res, next) => {
    const {reference, game_id, configuration} = req.body;
    if (Object.keys(req.body).length != 3){
        let error_field = {};
        if (reference == undefined){
            error_field.reference = ["The reference field is required."];
        }
        if (game_id  == undefined){
            error_field.game_id = ["The game_id field is required"];
        } 
        if (configuration == undefined){
            error_field.configuration = ["The configuration field is required"];
        }
        return res.status(422).json({
            code : 422,
            errors : error_field
        });
    }

    //! check ref_id is authorized or not : code 401
    if (reference.length != 40 || reference == null || configuration['credit'] <= 0){
        return res.status(401).json({
            code : 401,
            errors : "Unauthorized"
        });
    } 

    //! check game_id if not success, no play game : code 404
    if (game_id != "00001"){
        return res.status(404).json({
            code : 404,
            errors : "Not success, No Play Game",
            error_code : "error(404) no game ไม่มีเกม"
        });
    }

    next();
};

//* get link play game and get access token
app.post('/api/game', middlewareAPI, (req, res) => {
    const {reference, game_id, configuration} = req.body;

    const payload = {
        "reference": reference,
        "game_id": game_id,
        "configuration": configuration,
        "iat": new Date().getTime()
    };
    return res.status(200).json({
        code : 200,
        message : "Success",
        dynamicUrl : `https://penalty-game.com?gameID=${game_id}&accessToken=${jwt.sign(payload, SECRET_KEY, {expiresIn: '24h'})}`
    });
});

app.listen(3000);