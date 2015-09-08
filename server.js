/**
 * Created by ziv on 23/7/2015.
 */
var FB = require('fb');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var facebookToDB = require('./www/js/facebookToDB.js');
var app = express();
var mongoAccessLayer = require('./www/js/mongoAccessLayer.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/www'));

app.post('/login', function (req, res) {

    if (req.body.password && req.body.email) {
        console.log('login 1');
        var loginInput = {
            user_name: req.body.email,
            password: req.body.password
        };

        facebookToDB.validateUser(loginInput, function (err, data) {
            if (err) {
                console.log('login 2');
                res.json({success: false, data: null, message: err.message});

            } else if (data && data.valid) {
                console.log('login 3');
                res.json({success: true, data: data});

            } else {
                console.log('login 4');
                //user not exist or password is incorrect
                res.json({success: false, data: null, message: 'Please check your input!'});
            }
        });

    } else {
        console.log('login 5');
        res.json({success: false, data: null, message: "Invalid Request!"});
    }
});

app.post('/categories/complete', function (req, res) {
    var cariteria = {
        condition: {email: req.body.email},
        setValues: {Categories: req.body.categories}
    };

    mongoAccessLayer.updateDocument("users", cariteria, function (err, data) {
        if (err) {
            res.json({success: false, data: null, message: err.message});

        } else {
            res.json({success: true, data: data, message: null});
        }
    });
});

app.post('/register/complete', function (req, res) {
    var userDocument = {
        "FirstName": req.body.firstname,
        "LastName": req.body.lastname,
        "email": req.body.email,
        "Password": req.body.password,
        "birthyear": req.body.birthyear,
        "city": req.body.city,
        "gender": req.body.gender
    };

    facebookToDB.checkUser(userDocument, function (err, data) {
        if (err) {
            res.send('check user - error!!');
        } else if (data) {
            res.send('User with same email already exist!');
        } else {
            mongoAccessLayer.insertDocument('users', userDocument, function (err, data) {
                if (err) {
                    console.log("could not create user!");
                    console.log("error details: ", err);
                    res.send('error while registration!');
                } else {
                    console.log("new user created");
                    console.log(data);
                    res.send('registration ended successfully!');
                }
            });
        }
    });
});

app.get('/user/:id/:accessToken', function (req, res) {
    if (req.params.id) {
        var params = {
            access_token: req.params.accessToken,
            fields: ['name', 'first_name', 'last_name', 'email', 'id']
        };

        FB.napi('/' + req.params.id, params, function (err, response) {
            if (err) {
                res.json({success: false, data: null, message: err.message});

            } else {
                facebookToDB.checkUser(response, function (err, data) {
                    if (err) {
                        res.json({success: false, data: null, message: err.message});

                    } else if (data) {
                        res.json({success: true, data: data});

                    } else {
                        facebookToDB.insertUser(response, function (err, data) {
                            if (err) {
                                res.json({success: false, data: null, message: err.message});

                            } else {
                                res.json({success: true, data: data});
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.json({success: false, data: null, message: "Invalid Request!"});
    }
});

app.get('/categories', function (req, res) {
    mongoAccessLayer.getCollection('categories', {}, function (err, data) {
        if (err) {
            res.json({success: false, data: null, message: err.message});
        }
        else {
            res.json({success: true, data: data, message: null});
        }
    })
});

app.get('/sales', function (req, res) {
    mongoAccessLayer.getCollection('sales', {}, function (err, data) {
        if (err) {
            res.json({success: false, data: null, message: err.message});
        } else {
            res.json({success: true, data: data, message: null});
        }
    })
});

app.get('/sales/:ids', function (req, res) {
    if (req.params.ids) {
        console.log('ids: ', req.params.ids);
        var idsArray = req.params.ids.split(',');
        idsArray = idsArray.map(function (id) {
            return parseInt(id);
        });

        var criteria = {
            id: {$in: idsArray}
        };
        mongoAccessLayer.getCollection('sales', criteria, function (err, data) {
            if (err) {
                res.json({success: false, data: null, message: err.message});
            } else {
                res.json({success: true, data: data, message: null});
            }
        })
    } else {
        res.json(null);
    }
});

app.get('/mallSales/:id', function (req, res) {
    if (req.params.id) {
        console.log('params:', req.params);
        var id = parseInt(req.params.id);
        console.log(req.params.id);
        var criteria = {
            mallId: id
        };
        mongoAccessLayer.getCollection('sales', criteria, function (err, data) {
            if (err) {
                res.json({success: false, data: null, message: err.message});
            } else {
                res.json({success: true, data: data, message: null});
            }
        })
    } else {
        res.json(null);
    }
});

app.get('/malls', function (req, res) {
    mongoAccessLayer.getCollection('malls', {}, function (err, data) {
        if (err) {
            res.json({success: false, data: null, message: err.message});
        }
        else {
            res.json({success: true, data: data, message: null});
        }
    })
});

app.post('/addToMySales', function (req, res) {
    var cariteria = {
        condition: {email: req.body.email},
        setValues: {Sales: req.body.saleDetails}
    };
    console.log("email", cariteria.condition);
    console.log("sale details", cariteria.setValues);

    console.log("(*)*)*)*)*)*)*)" + cariteria);


    mongoAccessLayer.pushDocument("users", cariteria, function (err, data) {
        if (err) {
            console.log(err);
            res.json({success: false, data: null, message: err.message});


        } else {
            console.log(data);
            res.json({success: true, data: data, message: null});
        }
    });
});

app.post('/removeFromMySales', function (req, res) {
console.log(req.body);
   var criteria = {
        condition: {email: req.body.email},
        setValues: {Sales: req.body.sales}
    };

    mongoAccessLayer.updateDocument("users", criteria, function (err, data) {
        if (err) {
            res.json({success: false, data: null, message: err.message});

        } else {
            res.json({success: true, data: data, message: null});
        }
    });
});

app.get('/mySalesList/:user', function (req, res) {
    var query = req.params.user;

    mongoAccessLayer.getMySales("users", query, function (err, data) {
        if (err) {
            res.json({success: false, data: null, message: err.message});

        } else {
            res.json({success: true, data: data, message: null});
        }
    });
});

var port = process.env.PORT || 8000;
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('listening at http://%s:%s', host, port);
});
