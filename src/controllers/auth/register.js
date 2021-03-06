var models = require('../../models');
var bcrypt = require('bcrypt');
let services = require('../../services');

/**
 * Save the new user from his registration
 */
function post(req, res) {
    let q = req.body;
    /**
     * Check if all required attributes are entered
     */
    if (
        q.firstname !== undefined &&
        q.lastname !== undefined &&
        q.email !== undefined &&
        q.password !== undefined &&
        q.passwordConfirm !== undefined
    ) {

        let errors = services.account.checkRegisterRegex(req,res);

        /**
         * Errors management
         */
        if (errors.length > 0) {
            res.render("auth/register", {
                errors: errors,
                layout: 'layhome',
                csrfToken: req.csrfToken(),
                title : "Inscription" 
            });
            return;
        } else {
            models.User.findOne(q.email).then(function(user){
                if (user.length != 0){
                    const flash = {
                        msg:"Cet email est déjà utilisé.",
                        //type : alert-danger {errors}, alert-succes {{success}}
                        //alert:"alert-danger"
                    };
                    models.setFlash(flash, res);
                    res.redirect('/register'); 
                    return;
              } else {     
                bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(q.password, salt, (error, hash) => {
                    if (err) throw err;
                    q.password = hash;
                    models.User.create(q.firstname, q.lastname, q.email, q.password, false).then(function(e,result){
                            const flash = {
                                msg:"Compte créé avec succès. Vous pouvez désormais vous connecter.",
                                //type : alert-danger {errors}, alert-succes {{success}}
                                alert:"alert-success"
                            };
                            models.setFlash(flash, res);
                            res.redirect("/login");
                            return;
                        
                    }).catch(e => {
                        console.error(e);
                    });
                });
              });
            }
        });
    }
    }
}

/**
 * Return the registration page
 */
function get(req, res) {
    const flash = models.getFlash(req);
    models.destroyFlash(res);
    res.render('auth/register', {layout: 'layhome',errors: flash,csrfToken: req.csrfToken(),title : "Inscription"  });
    return;
}

module.exports = {post, get};