const axios = require('axios');

const fs = require('fs')

module.exports.drom = async (req, res) => {

  res.json('ok')

  const response = await axios.get("https://bampart.com/api/export/bamper?token=9dc4bd31-61b8-42c0-9769-63d0bd1d50d0",
        { responseType: 'blob',});
  const file = response.data;

  const domain = 'amipart.ru/'

  const lineArray = file.split('\n');

  const filename = './static/parts/file.csv';
  const writeStream = fs.createWriteStream(filename);


  for(const line of lineArray){
    let newLine = line.replace('"1_', '"')
          .replace(/bampart.com/g, domain)
          .replace(/\/images\/1\//g, '')
          .replace(/\//g, '-')
          .replace(/https:--amipart.ru-/g, 'https://amipart.ru/images/')

    writeStream.write(newLine);
  }
  console.log('Bampart csv created')
}

module.exports.ap = async (req, res) => {

  res.json('ok')

  const links = [
    {
      name: '3',
      url: 'necel'
    },
    {
      name: '4',
      url: 'hurxf'
    },
    {
      name: '4',
      url: 'ddsgm'
    },
    {
      name: '5',
      url: 'edqtw'
    },
    {
      name: '6',
      url: 'docxg'
    },
  ]

  for(const link of links){
    
    const response = await axios.get("https://autopoland.ru/export/drom/one/" + link.name + ".csv",
          { responseType: 'blob',});
    const file = response.data;

    const lineArray = file.split('\n');

    const filename = './static/parts/' + link.url + '.csv';
    const writeStream = fs.createWriteStream(filename);

    for(const line of lineArray){
      writeStream.write(line);
    }
    console.log(link.name + ' ap csv created')
  }
}