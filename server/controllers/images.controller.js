const request = require('request');

module.exports.imageReplace = async (req, res) => {

      const link = req.params.link;

      const directories = link.slice(0,6);
      const replacedDir = directories.replace(/-/g, '/')
      const url = 'https://bampart.com/images/1/' + link.replace(directories, replacedDir);

      request({
                  url: url,
                  encoding: null
            },
            (err, resp, buffer) => {
                  if (!err && resp.statusCode === 200){
                        res.set("Content-Type", "image/jpeg");
                        res.send(resp.body);
                  }
            });
}
