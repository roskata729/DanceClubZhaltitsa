module.exports = {
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/signin');
    },

    isNotLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/profile');
    },

    isAdministrator(req, res, next){
        if(req.isAuthenticated()){
            if(req.user.is_admin){
                return next();
            }
            return res.redirect('/profile');
        }
        return res.redirect('/signin');
    }
}