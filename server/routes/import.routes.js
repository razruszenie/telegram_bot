const passport = require('passport')
const {Router} = require('express')
const ctr = require('../controllers/import.controller')
const router = Router()

router.get(
      '/drom',
      // passport.authenticate('workerJWT', {session: false}),
      ctr.drom
)

router.get(
      '/ap',
      // passport.authenticate('workerJWT', {session: false}),
      ctr.ap
)

module.exports = router
