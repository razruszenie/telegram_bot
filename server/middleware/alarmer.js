const axios = require('axios');

module.exports.sendNotification = async (msg) => {

      try {
            await axios.get('https://alarmerbot.ru/?key=3e4e33-a0076a-b1855e&message=' +
                  encodeURIComponent(msg));
      }
      catch(e) {
            console.log(e)
      }
}
