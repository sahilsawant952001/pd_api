const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const axios = require('axios');
const uuid = require('uuid');
const app = express();

app.use(bodyParser.json());
app.use(cors({
    origin: ['http://localhost:3000']
}));
app.use(bodyParser.urlencoded({ extended: true }));

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sahil_sawant",
    database: "pddb"
});

app.post('/login', (req, res) => {

    const email = req.body.email;

    const password = req.body.password;

    const query1 = `select * from users where email='${email}' and password='${password}';`;

    connection.query(query1,(err, result1) => {
        if(err)
        {
            res.send({
                email:email,
                isAuthenticated:false
            })
        }
        else
        {
            if(result1.length>0){

                const query2 = `update users set isAuthenticated='${true}' where email='${email}';`;

                connection.query(query2,(err, result2) => {
                    if(result2){
                        res.send({
                            email:email,
                            isAuthenticated:true
                        })
                    }else{
                        res.send({
                            email:email,
                            isAuthenticated:false
                        })
                    }
                })
            
            }else{
                res.send({
                    email:email,
                    isAuthenticated:false
                })
            }
        }
    })
});

app.post('/register', (req, res) => {

    const email = req.body.email;

    const password = req.body.password;

    const query = `insert into users values ('${email}','${password}','false');`

    connection.query(query,(err, result) => {
        if(err)
        {
            res.send({
                registered:false
            })
        }
        else
        {
            if(result.length>0){
                res.send({
                    registered:false
                })
            }else{
                res.send({
                    registered:true
                })
            }
        }
    })
});

app.post('/logout',(req,res) => {

    const email = req.body.email;

    const query = `update users set isAuthenticated='${false}' where email = '${email}';`;

    connection.query(query,(err,result) => {
        if(result){
            res.send({
                isAuthenticated:false
            })
        }else{
            res.send({
                isAuthenticated:true
            })
        }
    })
})

app.post('/parkinson-test',(req,res) => {

    const email = req.body.email;
    const imgUrl = req.body.imgUrl;
    const x = req.body.x;
    const y = req.body.y;
    const height = req.body.height;
    const width = req.body.width;

    const query1 = `select * from users where email='${email}' and isAuthenticated='${true}'`;

    connection.query(query1,(err1,result1) => {
        if(result1){
            axios({
                method: 'post',
                url: 'http://localhost:5000/result',
                headers: {}, 
                data: {
                    img_url:imgUrl,
                    height:height,
                    width:width,
                    x:x,
                    y:y,
                    img_type:"spiral"
                }
            })
            .then((resp) => {
                if(resp){
                    const test_id = uuid.v4();
                    const test_date = new Date();
                    const test_result = resp.data.result === 'False' ? 'healthy':'parkinson';
                    
                    const query2 = `insert into tests values ('${test_id}','${imgUrl}',${height},${width},${x},${y},'${test_date}','${test_result}','${email}')`;
                    connection.query(query2, (err,result2) => {
                        if(result2){
                            res.send({
                                success:true,
                                testId:test_id,
                                imgUrl:imgUrl,
                                result:test_result,
                                date: test_date
                            })
                        }else{
                            res.send({
                                success:false
                            })
                        }
                    })
                }
            })
            .catch(error2 => {
                res.send({
                    success:false,
                })
            })     
        }else{
            res.send({
                success:false
            })
        }
    })
})

app.get('/parkinson-tests',(req, res) => {

    const email = req.query.email;

    const query1 = `select * from users where email='${email}' and isAuthenticated='${true}';`;

    connection.query(query1, (err1,result1) => {
        if(result1){
            const query2 = `select * from tests where email='${email}'`;

            connection.query(query2, (err2,result2) => {
                
                if(result2){
                    res.send({
                        success:true,
                        tests:result2
                    })
                }else{
                    res.send({
                        success:false
                    })
                }

            })

        }else{
            res.send({
                success:false
            })
        }
    })

})

app.listen(8000, () => {
    console.log('Server Listening on Port 8000')
});