const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.post('/create-admin', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // 1. Create user in Supabase Auth
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email,
            password
        });

        if (signUpError) throw signUpError;

        // 2. Create profile with admin role
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: user.id,
                    name,
                    email,
                    role: 'admin'
                }
            ]);

        if (profileError) throw profileError;

        res.json({
            success: true,
            message: 'Admin account created successfully',
            user: {
                email,
                name,
                role: 'admin'
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
