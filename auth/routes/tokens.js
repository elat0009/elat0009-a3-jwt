
const express = require('express');
const router = express.Router();
const sanitizeBody = require('../../middleware/sanitizeBody');

const User = require('../../models/User');

router.post('/tokens', sanitizeBody, async (req, res) => {
    
    if (!user) {
        return res.status(401).send({
            errors: [
            {
                status: 'Unauthorized',
                code: '401',
                title: 'Incorrect username or password.'
            }
        ] 
        });
    }
});
