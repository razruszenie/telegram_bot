const {Router} = require('express')
const ctr = require('../controllers/images.controller')
const router = Router()

router.get(
      '/:link',
      ctr.imageReplace
)

module.exports = router
