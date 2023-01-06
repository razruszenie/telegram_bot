const axios = require('axios')

const keys = require('../server/keys')

const apiKey = keys.JWT
const parseLink = 'https://alleap.ru/allegro/parser.php'

const currencies = require('../static/currency')


function calcPage(page, offset, limit){

      const calcVal = Math.abs(parseInt(offset.toString().charAt(0)) - 3)
      // maxProducts / limit = 4
      return 4 * page - calcVal
}

function cntPrice(price, priceWithDelivery){

      //price
      const actualPrice = price;
      let plusPrice = actualPrice;

      if (actualPrice < 99) {
            plusPrice += 60
      }
      else if (actualPrice >= 99 && actualPrice < 199) {
            plusPrice += 80
      }
      else if (actualPrice >= 199) {
            plusPrice += 80 + (actualPrice * 2 / 10)
      }

      //delivery
      let delivery = parseInt(priceWithDelivery - actualPrice);
      if(delivery < 0){
            delivery = 0
      }
      plusPrice += delivery + 100;
      const textPrice = parseInt(plusPrice * currencies.PLN.usd).toString() + '$ | ' +
            parseInt(plusPrice * currencies.PLN.rub).toString() + '₽ | ' +
            parseInt(plusPrice * currencies.PLN.byn).toString() + 'Br'

      return textPrice
}

async function createPage(bot, chatId, state, page, offset, query){

      if(state === 'używane'){
            state = 'u'
      } else{
            state = 'n'
      }

      await bot.sendMessage(chatId, 'Следующая страница: ' + calcPage(page, offset).toString(), {
            reply_markup: {
                  inline_keyboard: [
                        [
                              {
                                    text: 'Загрузить',
                                    callback_data: JSON.stringify(
                                          {
                                                t: 'oem',
                                                v: state,
                                                oem: query,
                                                p: page,
                                                o: offset
                                          })
                              }
                        ]
                  ]
            }
      });
}

module.exports.getProducts = async (bot, chatId, query, state, page, offset) => {

      try {

            if(state === 'u'){
                  state = 'używane'
            } else{
                  state = 'nowe'
            }
            const dataAllegro=await axios.get(parseLink, {
                  params: {
                        "api_key": apiKey,
                        "method": "search",
                        "query": query,
                        "status": state,
                        "page": page
                  },
                  headers: {}
            });

            const offerAllegro=dataAllegro.data;
            if(offerAllegro.success && offerAllegro.products.length !== 0){
                  const maxProducts = 40;
                  const limit = 10;

                  if(page === 1 && offset === 0){
                        await bot.sendMessage(chatId, 'Найдено запчастей: ' + offerAllegro.totalCount);
                  }
                  for (const [i, offer] of offerAllegro.products.entries()) {
                        if(i <= offset + limit - 1 && i + 1 > offset && i !== maxProducts){
                              await bot.sendPhoto(chatId, offer.mainImage,
                                    {
                                          caption: 'Цена: ' + cntPrice(offer.price, offer.price_with_delivery),
                                          reply_markup: {
                                                inline_keyboard: [
                                                      [
                                                            {
                                                                  text: 'Подробнее о запчасти❓',
                                                                  callback_data: JSON.stringify(
                                                                        {
                                                                              t: 'more',
                                                                              se: 'al',
                                                                              id: offer.id
                                                                        })

                                                            }
                                                      ],
                                                      [
                                                            {
                                                                  text: 'Уточнить у менеджера ✅',
                                                                  callback_data: JSON.stringify(
                                                                        {
                                                                              t: 'man',
                                                                              se: 'al',
                                                                              id: offer.id
                                                                        })
                                                            }
                                                      ]
                                                ]
                                          }
                                    });
                        }
                  }
                  if(offset < maxProducts - limit && offset < offerAllegro.totalCount
                  ){
                        if(offset + limit < offerAllegro.totalCount){
                              offset += limit;
                              await createPage(bot, chatId, state, page, offset, query)
                        }
                  }
                  else if(offset >= maxProducts - limit && offset < offerAllegro.totalCount
                        && offerAllegro.lastAvailablePage !== 1){
                        await createPage(bot, chatId, state, page + 1, 0, query)
                  }
            }
            else{
                  await bot.sendMessage(chatId, 'К сожалению ничего не найдено');
            }
      }
      catch(e) {
            // console.log(e)
            await bot.sendMessage(chatId, 'Ошибка загрузки данных. Попробуйте еще раз');
      }

}

module.exports.getProduct = async (bot, chatId, article, messageId, role) => {

      try {
            const dataAllegro=await axios.get(parseLink, {
                  params: {
                        "api_key": apiKey,
                        "method": "details",
                        "product_id": article
                  },
                  headers: {}
            });

            const offerAllegro=dataAllegro.data;
            if(offerAllegro.success){
                  let imgs = [];

                  let limit = 10;
                  let imgLength = offerAllegro.images.length;
                  const pages = Math.ceil(imgLength/limit);

                  const imgTurnArr = Array.from(Array(pages).keys());
                  for (const [i, imgTurn] of imgTurnArr.entries()) {
                        imgs[i] = [];

                        for (let [k, img] of offerAllegro.images.entries()) {
                              let limitLoop = limit;

                              k = (limit * i) + k;
                              limitLoop = limitLoop * (i + 1);
                              if(k < limitLoop && k < imgLength){
                                    imgs[i].push(    {
                                          type: "photo",
                                          media: offerAllegro.images[k].original
                                    })
                              }
                        }
                  }

                  let replayOption = {
                        reply_to_message_id: messageId
                  }
                  if(role === 'manager'){
                        replayOption = {}
                  }

                  for(const img of imgs){
                        await bot.sendMediaGroup(chatId, img, replayOption)
                  }

                  await bot.sendMessage(chatId,
                        cntPrice(offerAllegro.price, offerAllegro.price_with_delivery) +
                        '\nЦена за перевозку указана для товаров малогабаритных размеров. ' +
                        'При перевозке крупногабаритных товаров цена может увеличиться',{
                        reply_markup: {
                              inline_keyboard: [
                                    [
                                          {
                                                text: 'Уточнить у менеджера ✅',
                                                callback_data: JSON.stringify(
                                                      {
                                                            t: 'man',
                                                            se: 'al',
                                                            id: offerAllegro.id
                                                      })
                                          }
                                    ]
                              ]
                        }
                  });
            }
            else{
                  await bot.sendMessage(chatId, 'Ошибка загрузки дополнительной информации. Попробуйте еще раз');
            }
      }
      catch(e) {
            console.log(e)
            await bot.sendMessage(chatId, 'Ошибка загрузки данных. Попробуйте еще раз');
      }

}