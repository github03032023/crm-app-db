const router = require('express').Router();
const {
    addUser,
    getUsers,
    updateUser,
    deleteUser,
    deleteUserFromDatabase
} = require('./controllers/userController');
const authMiddleware = require('./middlewares/authMiddleware');


router.post('/addUser', authMiddleware, addUser);

router.get('/getUsers', authMiddleware, getUsers);

router.put('/updateUser', authMiddleware, updateUser);

router.delete('/deleteUser', authMiddleware, deleteUser);

router.delete('/deleteUserFromDatabase', authMiddleware, deleteUserFromDatabase);


module.exports = router;