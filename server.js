const express = require('express');
const app = express();

const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/test',(req,res)=>{
    res.send('hello world')
})

const port = 4000;

app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})