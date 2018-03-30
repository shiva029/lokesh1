var passport = require('passport');
var mahi = require('./model.js');
var localStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user,done){

    done(null, user.id);
});

passport.deserializeUser(function(id,done){
    mahi.findById(id, function(err,user){

        done(err,user);
    })
})

passport.use('local.login', new LocalStrategy({
EmailField: "Email",
PaswordField:"Password",
passReqToCallback: true

}, function(req,Email,Password,done){
    req.checkBody('Email','Invalid Email').notEmpty().isEmail();
    req.checkBody('Password','Invalid Password').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
    });
    
    
     }
  //return done(null,false,req.flash('error',messages));
    mahi.findOne({'Email':Email},function(err,user){
   if(err){
       return done(err);
   }
    if(user) {
        return done (null,false,{message:'email is already in use'})
    }  
    var newmahi = new mahi();
    newmahi.Email = Email;
    newmahi.Password = newmahi.encryptPassword(Password);   
   newmahi.save(function(err,result){
       if(err){
           return done (err);
       }
        return done(null,newmahi);
   })
});
}));
    


