const axios = require('axios');

const fs = require('fs')

module.exports.drom = async (req, res) => {

  res.json('ok')

  const response = await axios.get("https://bampart.com/api/export/bamper?token=9dc4bd31-61b8-42c0-9769-63d0bd1d50d0",
        { responseType: 'blob',});
  const file = response.data;

  const domain = 'amipart.ru/'

  const lineArray = file.split('\n');

  const filename = './static/parts/bnow.csv';
  const writeStream = fs.createWriteStream(filename);

  writeStream.write('"Артикул";"Наименование товара";"Новый/б.у.";"Марка";"Модель";"Кузов";' +
        '"Номер";"Двигатель";"Год";"L-R";"F-R";"U-D";"Цвет";"Примечание";' +
        '"Количество";"Цена";"Валюта";"Наличие";"Сроки доставки";"Фотография"' + "\r\n");
  let index = 0;
  for (const line of lineArray) {
    if(index > 2000 && index < 2540) {
      let newLine=line.replace('"1_', '"')
            .replace(/bampart.com/g, domain)
            .replace(/\/images\/1\//g, '')
            .replace(/\//g, '-')
            .replace(/https:--amipart.ru-/g, 'https://amipart.ru/images/')

      const newLineArr = newLine.split(';');
      writeStream.write('"ami' + newLineArr[0].replace('"', '') + ';'
            + newLineArr[4] + ';"б.у.";' + newLineArr[1] + ';' + newLineArr[2] + ';"";'
            + newLineArr[10] + ';"";' + newLineArr[3] + ';"";"";"";"";"";"1";"'
            + (parseInt(newLineArr[13].replace(/"/, ''))) * 80
            + '";"RUB";"В наличии";"1-3 дня";' + newLineArr[16].replace('\\r', ''));
    }
    index++;
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