var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var bcrypt = require('bcrypt-node');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var expressSession = require('express-session');
var flash    = require('connect-flash');
//var bcrypt = require('bcrypt');

var mahi = require('./model.js');
//var mahi = require('./passport.js');


mongoose.connect('mongodb://localhost/poiu');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//app.use(validator());
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//global vars
app.use(function(req,res,next){
    res.locals.errors = null;
    next();
})

// express validator middleware
app.use(expressValidator({
    errorFormatter:function(param,msg,value){
        var namespace = param.split('.'),
         root = namespace.shift(),
         formParam = root;


        while(namespace.length){
            formParam += '[' + namespace.shift() +']';

        }
        return{
            param:formParam,
            msg:msg,
            value:value
        }

    }
})

);
app.get('/login',function(req,res){
if(!req.session.cva){
 return res.status(401).send({message:"Invalid Email or Password"});
}
return res.status(200).send({message:"successfully login"});
});

app.get('/logout',function(req,res){
req.session.destroy();
return res.status(200).send("successfully logout");
});


app.post('/login',function(req,res){
    var Email = req.body.Email;
    var Password = req.body.Password;

/*mahi.findOne({Password:Password,Email:Email},function(err,user){
    if(err){
            return res.status(500).send();
        }
        if(!user){
            return res.status(404).send();
        }
        return res.status(200).send(user);
})
});*/

    mahi.findOne({Email:Email},function(err,mahi){
        if(err){
            return res.status(500).send();
        }
        if(!mahi){
            return res.status(404).send();
        }
        mahi.comparePassword(Password, function(err,isMatch){
            if(isMatch && isMatch ==true){
                //req.session.mahi = mahi;
                return res.status(200).send(mahi);
            }else{
                return res.status(401).send();
            }
        })
    })
});



/*mahi.findOne({Email:Email,Password:Password},function(err,mahi){
    if(err){
            return res.status(500).send();
        }
        if(!mahi){
            return res.status(404).send();
        }
        return res.status(200).send();
})
})*/

app.get('/', function(req,res){
    mahi.find({})
    .exec(function(err,mahis){
        if(err){
            res.send('error')
        } else{
            res.json(mahis);
        }
    })
});


app.post('/bsk',function(req,res){
req.checkBody('FirstName', 'first name is required').notEmpty();
req.checkBody('LastName', 'last name is required').notEmpty();
req.checkBody('Email', 'email is required').notEmpty();
req.checkBody('Password', 'Password  is required').notEmpty();
req.checkBody('Mobl', 'mobl is required').notEmpty();

var errors = req.validationErrors();

       if(errors){

       }else {
                  var newmahi = new mahi();

        newmahi.FirstName = req.body.FirstName;
         newmahi.LastName = req.body.LastName;
        newmahi.Email = req.body.Email;
         newmahi.Password = req.body.Password;
          newmahi.Mobl = req.body.Mobl;
                
       }
       
       
        newmahi.save(function(err,mahi){
            if(err){
                res.send('error');
                console.log('error');
            }else{
       
                res.send(mahi);
                console.log('success');
            
        }   
        });
});


app.post('/', function(req,res){
    mahi.create(req.body,function(err,mahi){
        if(err){
            res.send('error');

        }else{
            res.send(mahi);
        }
    })
})
app.post('/otp', function(req,res){
    var Mobl = req.body.Mobl;

    var otp = (Math.floor(math.random()*10000)+10000).toString().substring(1);
    //console.log(otp);
    //res.send(otp);

    var newmahi = new mahi();
    newmahi.Mobl = Mobl;
    newmahi.otp = otp;
    newmahi.save(function(err,sdata){
        if(err){
            return res.status(500).send();

        }else{
            return res.status(200).send({UserId:sdata.id,otp:sdata.otp});
        }
    })
 
});
/*
// passport/login.js
passport.use('login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, Email, Password, done) { 
    // check in mongo if a user with username exists or not
    mahi.findOne({ 'Email' :  Email }, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          return done(null, false, 
                req.flash('message', 'User Not found.'));                 
        }
        // User exists but wrong password, log the error 
        if (!isValidPassword(user, Password)){
          console.log('Invalid Password');
          return done(null, false, 
              req.flash('message', 'Invalid Password'));
        }
        // User and password both match, return user from 
        // done method which will be treated like success
        return done(null, user);
      }
    );
}));*/


//var LocalStrategy = require('passport-local').Strategy;
/*passport.use('local-login',
  new LocalStrategy({
      usernameField : 'Email',
      PasswordField : 'Password',
      passReqToCallback : true
    },
    function(req, Email, Password, done) {
      mahi.findOne({ 'Email' :  Email }, function(err, user) {
        if (err) return done(err);
        if (!user){
            req.flash("Email", req.body.Email);
            return done(null, false, req.flash('loginError', 'No user found.'));
        }
        if (!user.authenticate(Password)){
            req.flash("Email", req.body.Email);
            return done(null, false, req.flash('loginError', 'Password does not Match.'));
        }
        var Email_address = req.body.Email;
        username_tmp = Email_address;
        var username = Email_address.substring(0, email_address.lastIndexOf("@"));
        global_Email = Email;
        Pass = req.body.Password;
        return done(null, user);
      });
    }
  )
);*/

//var passport = require('passport')
  var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(Email, Password, done) {
    mahi.findOne({ Email: Email }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(Password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
))

app.listen(4000,function(){
    console.log('server run');

});


