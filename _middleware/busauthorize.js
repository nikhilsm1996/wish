const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = busauthorize;

function busauthorize(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User') 
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        jwt({ secret, algorithms: ['HS256'] }),

        // authorize based on user role
        async (req, res, next) => {
            const busaccount = await db.BusinessAccount.findById(req.user.id);
            const refreshTokens = await db.RefreshToken.find({ busaccount: busaccount.id });

            if (!busaccount || (roles.length && !roles.includes(busaccount.role))) {
                // account no longer exists or role not authorized
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // authentication and authorization successful
            req.user.role = busaccount.role;
            req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
            next();
        }



        
    ];
}