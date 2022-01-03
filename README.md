works on local machine with port of 4000, all information is returned in JSON data
</br>
</br>
3 routes are avaliable
</br>
</br>
/addtransaction
</br>
expects "payer":string, "points":number, and "timestamp":string (will be converted to date when saved) in the request body as JSON
</br>
returns string of "successfully added transaction" or "not enough in payer account for this transaction"
</br>
this will also add the transaction to as an object to memory in the server
</br>
</br>
/acounts
</br>
returns each individual payer and their current point totals as an array of objects
</br>
</br>
/spend
</br>
expects "spend":number in the request body as JSON
</br>
returns amount spent by each user as a negative number(if zero spend, will return zero) as an array of objects
</br>
nothing is expected in the request body
