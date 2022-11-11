const dotenv = require('dotenv')
const path = require('path')

dotenv.config({
    path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`)
})

module.exports = {
    NODE_ENV: process.env.NODE_ENV,
    END_POINT: process.env.END_POINT,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    GAME_ID: process.env.GAME_ID,
    X_CLIENT_ID: process.env.X_CLIENT_ID,
    X_CLIENT_SECRET: process.env.X_CLIENT_SECRET,
    API_ENDPOINT_MCARD: process.env.API_ENDPOINT_MCARD,
    X_CLIENT_ID_MCARD: process.env.X_CLIENT_ID_MCARD,
    X_CLIENT_SECRET_MCARD: process.env.X_CLIENT_SECRET_MCARD,
    X_APP_ID: process.env.X_APP_ID,
    PORT: process.env.PORT

}