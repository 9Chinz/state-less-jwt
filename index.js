const express = require("express");

const app = express();

app.use(express.json())

const jwt = require("jsonwebtoken");
const extractJwt = require("passport-jwt").ExtractJwt;
const strategyJwt = require("passport-jwt").Strategy;
const passport = require("passport");

const config =  require('./config.js');
const SECRET_KEY = config.TOKEN_SECRET;
const GAME_ID = config.GAME_ID;

const jwtOption = {
    jwtFromRequest: extractJwt.fromUrlQueryParameter("accessToken"),
    secretOrKey: SECRET_KEY
};

const jwtAuth = new strategyJwt(jwtOption, (payload, done) => {
    if (payload.game_id !== GAME_ID){
        return done(null, false);
    }
    return done(null, true);
});

passport.use(jwtAuth);
const middlewareGame = passport.authenticate("jwt", {session:false});

//* play game link and get
app.get('/', middlewareGame, (req, res) => {
    console.log(`monit is working | current env ${process.env.NODE_ENV} | secret key ${SECRET_KEY}`)
    res.send('this should be frontend check')
});

//* requirement when for get link
const middlewareAPI = (req, res, next) => {
    const timestamp = new Date().toLocaleString('th-Th', { timeZone: 'Asia/Bangkok' })
    const x_id = req.headers['x-client-id']
    const x_secret = req.headers['x-client-secret']
    if (x_id !== config.X_CLIENT_ID || x_secret !== config.X_CLIENT_SECRET){
        console.log(`${timestamp} error 401: Unauthorized| {user_side} x-id: ${x_id} x-secret ${x_secret} | {server_side} x-id: ${config.X_CLIENT_ID} x-secret ${config.X_CLIENT_SECRET}`)
        return res.status(401).json({
            code : 401,
            errors : "Unauthorized"
        });
    }

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
        console.log(`${timestamp} error 422: error_field | reference ${reference} | game_id ${game_id} | config ${configuration}`)
        return res.status(422).json({
            code : 422,
            errors : error_field
        });
    }

    //! check ref_id is authorized or not : code 401
    if (reference.length != 40 || reference == null || configuration['credit'] <= 0){
        console.log(`${timestamp} error 401: Unauthorized | reference len ${reference.length} | credit ${configuration['credit']}`)
        return res.status(401).json({
            code : 401,
            errors : "Unauthorized"
        });
    } 

    //! check game_id if not success, no play game : code 404
    if (game_id != GAME_ID){
        console.log(`${timestamp} error 404:Not found game | game-id ${game_id}`)
        return res.status(404).json({
            code : 404,
            errors : "Not success, No Play Game",
            error_code : "error(40401) No Game in record"
        });
    }

    next();
};

//* get link play game and get access token
app.post('/api/game', middlewareAPI, (req, res) => {
    const timestamp = new Date().toLocaleString('th-Th', { timeZone: 'Asia/Bangkok' })

    const {reference, game_id, configuration} = req.body;

    const payload = {
        "reference": reference,
        "game_id": game_id,
        "configuration": configuration,
        "iat": new Date().getTime()
    };
    console.log(`${timestamp} success 200: ${payload}`)
    return res.status(200).json({
        code : 200,
        message : "Success",
        dynamicUrl : `${config.END_POINT}?gameID=${game_id}&accessToken=${jwt.sign(payload, SECRET_KEY, {expiresIn: '24h'})}`
    });
});

app.listen(3000, ()=>{
    console.log(`listening on port 3000 env:${process.env.NODE_ENV}`)
});