const mongoose = require('mongoose');
const mongoDBUriString = process.env.MONGODB_URI_STRING;
mongoose.connect(mongoDBUriString).
then((response) =>{
    console.log('crmApp Database Connected')
}).catch((err)=>{
    console.log('Connection Error : ', err);
})