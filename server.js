const express = require('express');
const app = express();

const cors = require('cors');

app.use(express.json());
app.use(cors());

//data storage in memory, no database used
const transactions = []


//routes, since only 3 routes used, I'll keep all in one file but with otherwise break up.
//request will also be post and get only. put or delete would not make sense for any of these but if functionaility was expanded adding put/patch/delete routes would be considered

//route will expect a post request with a payer, points, and timestamp in the body. Query params could also be used but since this is a payments, I'll try to keep everything in the body for security.
app.post('/addtransaction',(req,res)=>{
    //returns success or failure if it will be negative
    const payerPoints = transactions.filter(e=>e.payer===req.body.payer).map(e=>e.points)
    const accountTotal = payerPoints.length>0?payerPoints.reduce((a,c)=>a+c):0
    if(accountTotal+req.body.points<0){
        return res.status(400).json(
            'not enough in payer account for this transaction'
        )
    }
    transactions.push({...req.body,timestamp:new Date(req.body.timestamp)})
    return res.status(200).json(
        'successfully added transaction'
    )

})

//route will expect a post with a spend in the body.
app.post('/spend',(req,res)=>{
    transactions = transactions.sort((a,b)=>a.timestamp-b.timestamp)
    const sortedTransactions = transactions

    let spend = req.body.spend
    let spendLog = []   

    //check if total points not enough 
    if((transactions.length>0?transactions.map(e=>e.points).reduce((a,c)=>a+c):0)<spend){
        return res.status(400).json("not enough for spend")
    }
    //checks if for where amount would be negative if full amount was taken
    // and returns amount of first time it would be negative or negative if no time
    function checkForNegative(payer,arr){
        //returns a negative number or zero
        const filteredArr = arr.filter(e=>e.payer===payer)
        let sumOfPoints = 0
        for(let i=0;i<filteredArr.length;i++){
            sumOfPoints+=filteredArr[i].points
            if(sumOfPoints<0){
                return -sumOfPoints
            }
        }
        return 0
    }

    for(let i =0;i<sortedTransactions.length;i++){
        
        //iteration through sorted transactions list to find oldest points to spend and check if at any point balance will be negative in the transaction log if full amount is taken, if take only enough for negative to not appear.
        //(I considered adding negative point transacions to spend btu found the edge case of if the first transaction amount was over spend and there was a negative transaction amount by the same payer right after)
        if(sortedTransactions[i].points>0 && spend>0){
            if(sortedTransactions[i].points>=spend){
                sortedTransactions[i].points-=spend
                const amountLess = checkForNegative(sortedTransactions[i].payer,sortedTransactions)
                spendLog.push({payer:sortedTransactions[i].payer,points:-spend+amountLess})
                spend=amountLess
            }else{
                const amountLess = checkForNegative(sortedTransactions[i].payer,sortedTransactions.slice(i+1))
                spend-=sortedTransactions[i].points
                spend+=amountLess
                spendLog.push({payer:sortedTransactions[i].payer,points:-sortedTransactions[i].points+amountLess})
                sortedTransactions[i].points=+amountLess
            }
        }
    }

    const hash ={}
    for(let action of spendLog){
        if(hash[action.payer]){
            hash[action.payer]+=action.points
        }else{
            hash[action.payer]=action.points
        }
    }
    const result = []
    for(let key in hash){
        result.push({payer:key,points:hash[key]})
    }
    return res.status(200).json(
        result
    )

})

//accounts routes is a get with no body expectations
app.get('/accounts',(req,res)=>{
    const hash ={}
    for(let transaction of transactions){
        if(hash[transaction.payer]){
            hash[transaction.payer]+=transaction.points
        }else{
            hash[transaction.payer]=transaction.points
        }
    }
    const result = []
    for(let key in hash){
        result.push({payer:key,points:hash[key]})
    }
    return res.status(200).json(
        result
    )
})

const port = 4000;

app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})